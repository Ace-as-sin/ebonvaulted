interface DeleteConfirmProps {
  open: boolean
  label: string
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirm({
  open,
  label,
  busy,
  onCancel,
  onConfirm,
}: DeleteConfirmProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-line bg-navy-900 p-6 shadow-xl">
        <h2 id="delete-title" className="font-display text-lg font-semibold">
          Delete file?
        </h2>
        <p className="mt-2 text-sm text-muted">
          This permanently removes the encrypted object from your space storage.
          This cannot be undone.
        </p>
        <p className="mt-3 truncate rounded-lg bg-navy-950/60 px-3 py-2 text-sm text-ink">
          {label}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-ink"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
