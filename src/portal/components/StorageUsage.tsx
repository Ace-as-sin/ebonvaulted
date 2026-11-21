import type { StorageQuota } from '../api/types'
import { formatBytes } from '../lib/format'

interface StorageUsageProps {
  quota: StorageQuota | null
  loading?: boolean
}

export function StorageUsage({ quota, loading }: StorageUsageProps) {
  if (loading || !quota) {
    return (
      <div
        className="rounded-xl border border-line bg-navy-900/50 p-4"
        aria-busy={loading}
      >
        <p className="text-sm text-muted">Loading storage usage…</p>
      </div>
    )
  }

  const ratio =
    quota.quotaBytes > 0
      ? Math.min(1, quota.usedBytes / quota.quotaBytes)
      : 0
  const pct = Math.round(ratio * 100)

  return (
    <section
      className="rounded-xl border border-line bg-navy-900/50 p-4 sm:p-5"
      aria-label="Storage usage"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            Space used
          </h2>
          <p className="mt-1 text-sm text-muted">
            {formatBytes(quota.usedBytes)} of {formatBytes(quota.quotaBytes)}
          </p>
        </div>
        <p className="text-sm text-teal-400">
          {formatBytes(quota.remainingBytes)} remaining
        </p>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-navy-800"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% of space used`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  )
}
