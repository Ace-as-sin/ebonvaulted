import { Loader2, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState, type DragEvent } from 'react'
import { StorageApiError } from '../api/types'
import { uploadEncryptedFile } from '../api/storage'
import {
  encryptFile,
  opaqueStoredName,
  toEncryptionMeta,
} from '../crypto/encrypt'
import { rememberFileKey } from '../crypto/keyStore'
import { formatBytes } from '../lib/format'

type ItemPhase =
  | 'queued'
  | 'encrypting'
  | 'uploading'
  | 'done'
  | 'error'
  | 'cancelled'

interface UploadItem {
  id: string
  file: File
  phase: ItemPhase
  encryptProgress: number
  uploadProgress: number
  error?: string
  abort?: AbortController
}

interface UploadZoneProps {
  onUploaded: () => void
  disabled?: boolean
}

export function UploadZone({ onUploaded, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [dragOver, setDragOver] = useState(false)

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }, [])

  const processFile = useCallback(
    async (item: UploadItem) => {
      const abort = new AbortController()
      updateItem(item.id, { phase: 'encrypting', abort, encryptProgress: 0.1 })

      try {
        const encrypted = await encryptFile(item.file, item.file.name, {
          signal: abort.signal,
          onProgress: (ratio) =>
            updateItem(item.id, { encryptProgress: ratio }),
        })
        updateItem(item.id, { phase: 'uploading', encryptProgress: 1 })

        const meta = toEncryptionMeta(encrypted)
        const storedName = opaqueStoredName()

        const result = await uploadEncryptedFile({
          ciphertext: encrypted.ciphertext,
          storedName,
          contentType: 'application/octet-stream',
          encryption: meta,
          signal: abort.signal,
          onProgress: (ratio) =>
            updateItem(item.id, { uploadProgress: ratio }),
        })

        // Interim: keep key in memory for this session only.
        rememberFileKey(result.file.id, encrypted.fileKeyRaw)
        updateItem(item.id, { phase: 'done', uploadProgress: 1 })
        onUploaded()
      } catch (err) {
        if (abort.signal.aborted) {
          updateItem(item.id, { phase: 'cancelled', error: 'Cancelled' })
          return
        }
        const message =
          err instanceof StorageApiError || err instanceof Error
            ? err.message
            : 'Upload failed.'
        updateItem(item.id, { phase: 'error', error: message })
      }
    },
    [onUploaded, updateItem],
  )

  const enqueue = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList)
      if (files.length === 0) return
      const next: UploadItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        phase: 'queued',
        encryptProgress: 0,
        uploadProgress: 0,
      }))
      setItems((prev) => [...next, ...prev])
      for (const item of next) {
        void processFile(item)
      }
    },
    [processFile],
  )

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    if (disabled) return
    enqueue(event.dataTransfer.files)
  }

  const cancel = (item: UploadItem) => {
    item.abort?.abort()
    updateItem(item.id, { phase: 'cancelled', error: 'Cancelled' })
  }

  const retry = (item: UploadItem) => {
    const fresh: UploadItem = {
      id: crypto.randomUUID(),
      file: item.file,
      phase: 'queued',
      encryptProgress: 0,
      uploadProgress: 0,
    }
    setItems((prev) => [fresh, ...prev.filter((i) => i.id !== item.id)])
    void processFile(fresh)
  }

  return (
    <section aria-label="Upload files">
      <div
        className={`rounded-xl border border-dashed px-4 py-10 text-center transition-colors ${
          dragOver
            ? 'border-teal-400 bg-teal-500/10'
            : 'border-line bg-navy-900/40'
        } ${disabled ? 'opacity-50' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-teal-400" aria-hidden />
        <p className="mt-3 font-display text-base font-semibold text-ink">
          Add files to your space
        </p>
        <p className="mt-1 text-sm text-muted">
          Drag and drop, or choose photos, videos, and other files. Encryption
          happens on this device before upload.
        </p>
        <button
          type="button"
          className="btn-cta mt-5 inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          multiple
          onChange={(e) => {
            if (e.target.files) enqueue(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-line bg-navy-900/50 px-3 py-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-subtle">
                    {formatBytes(item.file.size)} · {statusLabel(item)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {(item.phase === 'encrypting' ||
                    item.phase === 'uploading') && (
                    <button
                      type="button"
                      className="rounded p-1 text-muted hover:text-ink"
                      aria-label="Cancel upload"
                      onClick={() => cancel(item)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {item.phase === 'error' && (
                    <button
                      type="button"
                      className="text-xs text-teal-400 hover:underline"
                      onClick={() => retry(item)}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
              {(item.phase === 'encrypting' || item.phase === 'uploading') && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-800">
                  <div
                    className="h-full bg-teal-500 transition-[width]"
                    style={{
                      width: `${Math.round(
                        (item.phase === 'encrypting'
                          ? item.encryptProgress * 0.35
                          : 0.35 + item.uploadProgress * 0.65) * 100,
                      )}%`,
                    }}
                  />
                </div>
              )}
              {item.phase === 'encrypting' && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                  Encrypting locally…
                </p>
              )}
              {item.error && item.phase !== 'cancelled' && (
                <p className="mt-1 text-xs text-red-300">{item.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function statusLabel(item: UploadItem): string {
  switch (item.phase) {
    case 'queued':
      return 'Queued'
    case 'encrypting':
      return 'Encrypting'
    case 'uploading':
      return `Uploading ${Math.round(item.uploadProgress * 100)}%`
    case 'done':
      return 'Stored'
    case 'cancelled':
      return 'Cancelled'
    case 'error':
      return 'Failed'
  }
}
