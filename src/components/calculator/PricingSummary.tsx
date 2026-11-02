import { formatCurrency, formatStorageGb, type PricingEstimate } from '../../lib/pricing'
import { PRICING_CONFIG, PRICING_DISCLAIMER } from '../../lib/pricingConfig'
import type { StoragePlan } from '../../types'

interface PricingSummaryProps {
  estimate: PricingEstimate
  selectedFixedPlanId: StoragePlan
  onFixedPlanChange: (plan: StoragePlan) => void
}

export function PricingSummary({
  estimate,
  selectedFixedPlanId,
  onFixedPlanChange,
}: PricingSummaryProps) {
  const { usage, fixed, comparison, billingPeriod, model } = estimate
  const periodLabel = billingPeriod === 'annual' ? 'annual' : 'monthly'
  const primaryCost =
    billingPeriod === 'annual' ? estimate.displayAnnual : estimate.displayMonthly

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-teal-400/30 bg-gradient-to-br from-teal-500/12 via-charcoal-800/80 to-blue-500/10 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
          Estimated {periodLabel} cost
        </p>
        <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-teal-400 sm:text-5xl">
          {primaryCost !== null ? formatCurrency(primaryCost) : '—'}
        </p>
        <p className="mt-2 text-sm text-muted">
          For {formatStorageGb(estimate.storageGb)} of space storage
          {model === 'usage' && usage.minimumApplied
            ? ' (minimum monthly charge applied)'
            : ''}
          {model === 'fixed' && fixed.plan
            ? ` on the ${fixed.plan.name} plan`
            : ''}
          .
        </p>
        <p className="mt-3 text-xs leading-relaxed text-subtle">
          {PRICING_DISCLAIMER}
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <SummaryStat
          label="Selected storage"
          value={formatStorageGb(estimate.storageGb)}
          tone="blue"
        />
        <SummaryStat
          label="Effective price / GB"
          value={
            model === 'usage'
              ? usage.effectivePerGb !== null
                ? `${formatCurrency(usage.effectivePerGb)}/GB`
                : 'N/A at 0 GB'
              : fixed.effectivePerGb !== null
                ? `${formatCurrency(fixed.effectivePerGb)}/GB reserved`
                : '—'
          }
          tone="blue"
        />
        <SummaryStat
          label="Monthly estimate"
          value={
            estimate.displayMonthly !== null
              ? formatCurrency(estimate.displayMonthly)
              : '—'
          }
          tone="teal"
        />
        <SummaryStat
          label="Annual projection"
          value={
            estimate.displayAnnual !== null
              ? formatCurrency(estimate.displayAnnual)
              : '—'
          }
          tone="teal"
        />
      </dl>

      {model === 'fixed' && (
        <div>
          <label
            htmlFor="calculator-fixed-plan"
            className="block text-sm font-medium text-ink"
          >
            Fixed plan
          </label>
          <select
            id="calculator-fixed-plan"
            value={selectedFixedPlanId}
            onChange={(e) => onFixedPlanChange(e.target.value as StoragePlan)}
            className="mt-2 w-full rounded-xl border border-line bg-navy-950/60 px-4 py-3 text-sm text-ink transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
          >
            {PRICING_CONFIG.fixedPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} — {formatStorageGb(plan.storageGb)} ·{' '}
                {formatCurrency(plan.monthlyPrice)}/mo
              </option>
            ))}
          </select>
          {!fixed.sufficient && fixed.plan && (
            <p className="mt-2 text-sm text-amber-200" role="status">
              {formatStorageGb(estimate.storageGb)} exceeds the{' '}
              {fixed.plan.name} capacity
              {fixed.nextPlan
                ? `. Next suitable plan: ${fixed.nextPlan.name} (${formatStorageGb(fixed.nextPlan.storageGb)}).`
                : '. No larger fixed plan is available in this calculator.'}
            </p>
          )}
        </div>
      )}

      {comparison.monthlyDelta !== null && comparison.cheaperModel && (
        <div
          className="rounded-xl border border-line bg-navy-950/50 px-4 py-3 text-sm leading-relaxed text-muted"
          role="status"
        >
          {comparison.cheaperModel === 'tie' ? (
            <>
              At this storage amount, both models estimate about{' '}
              <span className="font-medium text-ink">
                {formatCurrency(comparison.usageMonthly)}
              </span>{' '}
              per month.
            </>
          ) : comparison.cheaperModel === 'usage' ? (
            <>
              Pay for What You Use is about{' '}
              <span className="font-medium text-teal-400">
                {formatCurrency(Math.abs(comparison.monthlyDelta))}
              </span>{' '}
              less per month than the suitable fixed plan
              {comparison.suitableFixedPlan
                ? ` (${comparison.suitableFixedPlan.name})`
                : ''}
              .
            </>
          ) : (
            <>
              The suitable fixed plan
              {comparison.suitableFixedPlan
                ? ` (${comparison.suitableFixedPlan.name})`
                : ''}{' '}
              is about{' '}
              <span className="font-medium text-blue-400">
                {formatCurrency(Math.abs(comparison.monthlyDelta))}
              </span>{' '}
              less per month than usage-based billing at this amount.
            </>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'teal' | 'blue'
}) {
  return (
    <div className="rounded-xl border border-line bg-navy-950/40 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-subtle">
        {label}
      </dt>
      <dd
        className={`mt-1 font-display text-lg font-semibold tabular-nums ${
          tone === 'teal' ? 'text-teal-400' : 'text-blue-400'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
