import { useId } from 'react'
import type { BillingPeriod, PricingModel } from '../../types'

interface PricingModelSelectorProps {
  model: PricingModel
  billingPeriod: BillingPeriod
  onModelChange: (model: PricingModel) => void
  onBillingPeriodChange: (period: BillingPeriod) => void
}

const MODELS: { id: PricingModel; label: string; description: string }[] = [
  {
    id: 'usage',
    label: 'Pay for What You Use',
    description: 'Billed on consumed storage, with a monthly minimum.',
  },
  {
    id: 'fixed',
    label: 'Fixed Storage Plan',
    description: 'Reserved capacity at a flat monthly price.',
  },
]

export function PricingModelSelector({
  model,
  billingPeriod,
  onModelChange,
  onBillingPeriodChange,
}: PricingModelSelectorProps) {
  const baseId = useId()

  return (
    <div className="space-y-5">
      <div>
        <p
          id={`${baseId}-model-label`}
          className="text-sm font-medium text-ink"
        >
          Pricing model
        </p>
        <div
          role="radiogroup"
          aria-labelledby={`${baseId}-model-label`}
          className="mt-3 grid gap-3 sm:grid-cols-2"
        >
          {MODELS.map((option) => {
            const selected = model === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onModelChange(option.id)}
                className={`rounded-2xl border p-4 text-left transition duration-200 ${
                  selected
                    ? 'border-teal-400/45 bg-teal-400/10 shadow-lg shadow-teal-500/10'
                    : 'border-line bg-navy-950/40 hover:border-line-strong'
                }`}
              >
                <span className="block font-display text-sm font-semibold text-ink">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">
                  {option.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p
          id={`${baseId}-period-label`}
          className="text-sm font-medium text-ink"
        >
          Billing period
        </p>
        <div
          role="radiogroup"
          aria-labelledby={`${baseId}-period-label`}
          className="mt-3 inline-flex rounded-xl border border-line bg-navy-950/50 p-1"
        >
          {(
            [
              { id: 'monthly', label: 'Monthly' },
              { id: 'annual', label: 'Annual projection' },
            ] as const
          ).map((option) => {
            const selected = billingPeriod === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onBillingPeriodChange(option.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-navy-950'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
