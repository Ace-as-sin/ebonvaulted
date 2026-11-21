import { useCallback, useEffect, useState } from 'react'
import {
  deleteFile,
  downloadEncryptedFile,
  getStorageQuota,
  listFiles,
} from '../api/storage'
import { StorageApiError, type StoredFileRecord, type StorageQuota } from '../api/types'
import { base64ToBytes } from '../crypto/bytes'
import {
  decryptCiphertextBlob,
  decryptFilename,
} from '../crypto/encrypt'
import { forgetFileKey, takeFileKey } from '../crypto/keyStore'
import { FileGallery } from '../components/FileGallery'
import { StorageUsage } from '../components/StorageUsage'
import { UploadZone } from '../components/UploadZone'

export function DashboardPage() {
  const [files, setFiles] = useState<StoredFileRecord[]>([])
  const [quota, setQuota] = useState<StorageQuota | null>(null)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  /** Session-only decrypted names for files we still have keys for. */
  const [names, setNames] = useState<Record<string, string>>({})

  const resolveNames = useCallback(async (list: StoredFileRecord[]) => {
    const next: Record<string, string> = {}
    for (const file of list) {
      const key = takeFileKey(file.id)
      const packB64 = file.encryption?.encryptedName
      if (!key || !packB64) continue
      try {
        const pack = Uint8Array.from(base64ToBytes(packB64))
        const filenameIv = pack.slice(0, 12)
        const encName = pack.slice(12)
        next[file.id] = await decryptFilename(encName, filenameIv, key)
      } catch {
        // Keep opaque server name if decrypt fails.
      }
    }
    if (Object.keys(next).length > 0) {
      setNames((prev) => ({ ...prev, ...next }))
    }
  }, [])

  const refresh = useCallback(async () => {
    setListError(null)
    try {
      const [fileRes, quotaRes] = await Promise.all([
        listFiles(),
        getStorageQuota(),
      ])
      setFiles(fileRes.files)
      setQuota(quotaRes)
      void resolveNames(fileRes.files)
    } catch (err) {
      const message =
        err instanceof StorageApiError
          ? err.message
          : 'Could not load your space storage.'
      setListError(message)
    } finally {
      setLoading(false)
    }
  }, [resolveNames])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const displayName = (file: StoredFileRecord) =>
    names[file.id] ?? file.name

  const onDownload = async (file: StoredFileRecord) => {
    setActionError(null)
    setDownloadingId(file.id)
    try {
      const key = takeFileKey(file.id)
      const blob = await downloadEncryptedFile(file.id)

      if (!key || !file.encryption?.iv) {
        // Cannot decrypt without a session key — save ciphertext only with notice.
        setActionError(
          'Downloaded encrypted bytes only. The decryption key is not available on this device yet (key wrapping is unfinished).',
        )
        triggerBrowserDownload(blob, `${file.name || 'file'}.enc`)
        return
      }

      const plainBlob = await decryptCiphertextBlob(blob, file.encryption, key)

      let filename = names[file.id] ?? 'download'
      if (file.encryption.encryptedName) {
        try {
          const pack = Uint8Array.from(
            base64ToBytes(file.encryption.encryptedName),
          )
          const filenameIv = pack.slice(0, 12)
          const encName = pack.slice(12)
          filename = await decryptFilename(encName, filenameIv, key)
          setNames((prev) => ({ ...prev, [file.id]: filename }))
        } catch {
          // keep fallback name
        }
      }

      triggerBrowserDownload(plainBlob, filename)
    } catch (err) {
      setActionError(
        err instanceof StorageApiError || err instanceof Error
          ? err.message
          : 'Download failed.',
      )
    } finally {
      setDownloadingId(null)
    }
  }

  const onDelete = async (file: StoredFileRecord) => {
    setActionError(null)
    try {
      await deleteFile(file.id)
      forgetFileKey(file.id)
      setNames((prev) => {
        const next = { ...prev }
        delete next[file.id]
        return next
      })
      await refresh()
    } catch (err) {
      setActionError(
        err instanceof StorageApiError ? err.message : 'Delete failed.',
      )
      throw err
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Your space
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Private space storage. Files are encrypted in your browser before
          upload. Previews of encrypted media are only generated locally after
          decryption — never uploaded as plaintext thumbnails.
        </p>
      </div>

      <StorageUsage quota={quota} loading={loading && !quota} />

      {actionError && (
        <p
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
          role="status"
        >
          {actionError}
        </p>
      )}

      <UploadZone onUploaded={() => void refresh()} />

      <FileGallery
        files={files}
        loading={loading}
        error={listError}
        displayName={displayName}
        onDownload={(f) => void onDownload(f)}
        onDelete={onDelete}
        downloadingId={downloadingId}
      />
    </div>
  )
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
