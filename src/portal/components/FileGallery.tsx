import {
  Download,
  FileIcon,
  Film,
  Grid2X2,
  ImageIcon,
  List,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import type { StoredFileRecord } from '../api/types'
import { formatBytes, formatDate } from '../lib/format'
import { DeleteConfirm } from './DeleteConfirm'

export type GalleryView = 'grid' | 'list'

interface FileGalleryProps {
  files: StoredFileRecord[]
  loading?: boolean
  error?: string | null
  displayName: (file: StoredFileRecord) => string
  onDownload: (file: StoredFileRecord) => void
  onDelete: (file: StoredFileRecord) => Promise<void>
  downloadingId?: string | null
}

function FileTypeIcon({ name }: { name: string }) {
  const lower = name.toLowerCase()
  if (/\.(png|jpe?g|gif|webp|heic|avif)$/.test(lower)) {
    return <ImageIcon className="h-5 w-5 text-teal-400" aria-hidden />
  }
  if (/\.(mp4|mov|webm|mkv|avi)$/.test(lower)) {
    return <Film className="h-5 w-5 text-blue-400" aria-hidden />
  }
  return <FileIcon className="h-5 w-5 text-muted" aria-hidden />
}

export function FileGallery({
  files,
  loading,
  error,
  displayName,
  onDownload,
  onDelete,
  downloadingId,
}: FileGalleryProps) {
  const [view, setView] = useState<GalleryView>('list')
  const [pendingDelete, setPendingDelete] = useState<StoredFileRecord | null>(
    null,
  )
  const [deleting, setDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await onDelete(pendingDelete)
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section aria-label="Your files">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Your files</h2>
        <div className="flex rounded-lg border border-line p-0.5">
          <button
            type="button"
            className={`rounded-md p-2 ${view === 'list' ? 'bg-navy-800 text-ink' : 'text-muted'}`}
            aria-pressed={view === 'list'}
            aria-label="List view"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`rounded-md p-2 ${view === 'grid' ? 'bg-navy-800 text-ink' : 'text-muted'}`}
            aria-pressed={view === 'grid'}
            aria-label="Grid view"
            onClick={() => setView('grid')}
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-muted" aria-busy="true">
          Loading files…
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {!loading && !error && files.length === 0 && (
        <div className="rounded-xl border border-dashed border-line bg-navy-900/30 px-6 py-16 text-center">
          <p className="font-display text-lg text-ink">Your space is empty</p>
          <p className="mt-2 text-sm text-muted">
            Upload photos, videos, or files. They are encrypted on this device
            before leaving your browser.
          </p>
        </div>
      )}

      {!loading && files.length > 0 && view === 'list' && (
        <ul className="divide-y divide-line rounded-xl border border-line bg-navy-900/40">
          {files.map((file) => {
            const label = displayName(file)
            return (
              <li
                key={file.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap"
              >
                <FileTypeIcon name={label} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{label}</p>
                  <p className="text-xs text-subtle">
                    {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted hover:text-ink"
                    onClick={() => onDownload(file)}
                    disabled={downloadingId === file.id}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    {downloadingId === file.id ? '…' : 'Download'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted hover:border-red-500/40 hover:text-red-300"
                    onClick={() => setPendingDelete(file)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {!loading && files.length > 0 && view === 'grid' && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const label = displayName(file)
            return (
              <li
                key={file.id}
                className="flex flex-col rounded-xl border border-line bg-navy-900/40 p-4"
              >
                <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-navy-950/60">
                  <FileTypeIcon name={label} />
                </div>
                <p className="truncate text-sm font-medium">{label}</p>
                <p className="mt-1 text-xs text-subtle">
                  {formatBytes(file.sizeBytes)}
                </p>
                <p className="text-xs text-subtle">{formatDate(file.createdAt)}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-line py-1.5 text-xs text-muted hover:text-ink"
                    onClick={() => onDownload(file)}
                    disabled={downloadingId === file.id}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-line px-2 py-1.5 text-xs text-muted hover:text-red-300"
                    onClick={() => setPendingDelete(file)}
                    aria-label={`Delete ${label}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <DeleteConfirm
        open={Boolean(pendingDelete)}
        label={pendingDelete ? displayName(pendingDelete) : ''}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  )
}
