import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { formatCurrency } from '../../lib/pricing'
import { PRICING_CONFIG } from '../../lib/pricingConfig'

export function PricingExplanation() {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonId = useId()
  const { usage } = PRICING_CONFIG
  const hasAnnualDiscount =
    (PRICING_CONFIG.annualDiscountPercent ?? 0) > 0

  return (
    <div className="rounded-2xl border border-line bg-navy-950/40">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-ink transition hover:text-teal-400 sm:px-6"
        >
          <span>How is my price calculated?</span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-subtle transition-transform duration-200 ${
              open ? 'rotate-180 text-teal-400' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-line px-5 py-4 text-sm leading-relaxed text-muted sm:px-6">
            <p>
              <span className="font-medium text-ink">Pay for What You Use</span>{' '}
              estimates your bill from storage you actually consume. Monthly
              cost is the greater of the minimum monthly charge (
              {formatCurrency(usage.minimumMonthlyCharge)}) and billed GB ×{' '}
              {formatCurrency(usage.pricePerGbMonth)} per GB. Usage is rounded
              up to the nearest {usage.billingIncrementGb} GB increment for the
              estimate (0 GB stays 0 GB).
            </p>
            <p>
              <span className="font-medium text-ink">Fixed Storage Plans</span>{' '}
              charge a flat monthly price for reserved capacity (100 GB, 500 GB,
              or 1 TB). You pay for the reserved plan whether or not you fill
              it. 1 TB is treated as 1,000 GB throughout this calculator.
            </p>
            <p>
              Storage usage in a live service would typically be measured from
              account consumption over the billing period. This calculator
              {usage.assumesConstantUsage
                ? ' assumes constant usage for the full month'
                : ' provides a point-in-time estimate'}
              , so actual metered bills may vary.
            </p>
            <p>
              Estimates{' '}
              {usage.includesTaxes ? 'include' : 'do not include'} taxes or
              fees. Annual projections multiply the monthly estimate by 12
              {hasAnnualDiscount
                ? ` and apply a configured annual discount of ${PRICING_CONFIG.annualDiscountPercent}%`
                : ' — no annual discount is configured'}
              .
            </p>
            <p>
              Usage-based rates shown here are illustrative placeholders pending
              business confirmation. Fixed-plan figures match the site’s
              preliminary test pricing and may change before launch. Final
              billing policies and prices are subject to confirmation before
              launch.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
