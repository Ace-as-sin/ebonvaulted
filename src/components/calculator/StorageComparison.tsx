import type { ReactNode } from 'react'
import { formatStorageGb, type PricingEstimate } from '../../lib/pricing'
import { PRICING_CONFIG } from '../../lib/pricingConfig'

interface StorageComparisonProps {
  estimate: PricingEstimate
}

export function StorageComparison({ estimate }: StorageComparisonProps) {
  const { usage, fixed, storageGb } = estimate
  const maxCapacity = Math.max(
    PRICING_CONFIG.usage.maxStorageGb,
    fixed.plan?.storageGb ?? 0,
    storageGb,
  )

  const usagePct = maxCapacity > 0 ? (usage.billedGb / maxCapacity) * 100 : 0
  const reservedGb = fixed.plan?.storageGb ?? 0
  const reservedPct = maxCapacity > 0 ? (reservedGb / maxCapacity) * 100 : 0
  const usedOnFixedPct =
    reservedGb > 0 ? Math.min(100, (storageGb / reservedGb) * 100) : 0

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">
          Visual storage comparison
        </h3>
        <p className="mt-1 text-sm text-muted">
          Usage-based bills for what you store. Fixed plans reserve capacity up
          front — unused space is not automatically wasted money, because the
          per-GB economics can differ.
        </p>
      </div>

      <div className="space-y-4">
        <ComparisonRow
          title="Usage-based storage"
          meta={[
            `Storage used: ${formatStorageGb(storageGb)}`,
            `Storage billed: ${formatStorageGb(usage.billedGb)}`,
          ]}
          bar={
            <ProgressTrack
              label={`Billed ${formatStorageGb(usage.billedGb)} of ${formatStorageGb(maxCapacity)} scale`}
              fillPercent={usagePct}
              fillClass="bg-gradient-to-r from-teal-500 to-teal-400"
            />
          }
        />

        <ComparisonRow
          title={
            fixed.plan
              ? `Fixed ${formatStorageGb(fixed.plan.storageGb)} plan (${fixed.plan.name})`
              : 'Fixed storage plan'
          }
          meta={
            fixed.plan
              ? [
                  `Storage used: ${formatStorageGb(storageGb)}`,
                  `Storage reserved: ${formatStorageGb(fixed.plan.storageGb)}`,
                  fixed.sufficient
                    ? `Unused capacity: ${formatStorageGb(fixed.unusedGb)}`
                    : 'Selected usage exceeds this plan’s capacity',
                ]
              : ['No fixed plan available for this amount']
          }
          bar={
            fixed.plan ? (
              <div className="space-y-2">
                <ProgressTrack
                  label={`Reserved ${formatStorageGb(fixed.plan.storageGb)} of ${formatStorageGb(maxCapacity)} scale`}
                  fillPercent={reservedPct}
                  fillClass="bg-gradient-to-r from-blue-500 to-blue-400"
                />
                <ProgressTrack
                  label={`Used ${formatStorageGb(storageGb)} within reserved ${formatStorageGb(fixed.plan.storageGb)}`}
                  fillPercent={usedOnFixedPct}
                  fillClass="bg-blue-400/70"
                  trackClass="bg-blue-500/15"
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  )
}

function ComparisonRow({
  title,
  meta,
  bar,
}: {
  title: string
  meta: string[]
  bar: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-line bg-charcoal-800/40 p-4 sm:p-5">
      <h4 className="font-display text-sm font-semibold text-ink">{title}</h4>
      <ul className="mt-2 space-y-1 text-sm text-muted">
        {meta.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {bar && <div className="mt-4">{bar}</div>}
    </div>
  )
}

function ProgressTrack({
  label,
  fillPercent,
  fillClass,
  trackClass = 'bg-white/8',
}: {
  label: string
  fillPercent: number
  fillClass: string
  trackClass?: string
}) {
  const width = Math.max(0, Math.min(100, fillPercent))
  return (
    <div
      className={`h-2.5 overflow-hidden rounded-full ${trackClass}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ease-out ${fillClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
