import { ChevronDown, Shield } from 'lucide-react'
import { useId, useState } from 'react'
import {
  CUSTOMER_PROMISES,
  type CustomerPromise,
} from '../content/promises'

function PromiseStatement({
  promise,
  baseId,
}: {
  promise: CustomerPromise
  baseId: string
}) {
  const [limitOpen, setLimitOpen] = useState(false)
  const limitPanelId = `${baseId}-${promise.id}-limit`
  const limitButtonId = `${baseId}-${promise.id}-limit-btn`

  return (
    <li className="rounded-2xl border border-line bg-charcoal-800/40 p-5 transition duration-300 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/20">
          <Shield className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-base font-semibold text-ink sm:text-lg">
            {promise.headline}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {promise.body}
          </p>

          {promise.limitations && (
            <div className="mt-3">
              <button
                type="button"
                id={limitButtonId}
                aria-expanded={limitOpen}
                aria-controls={limitPanelId}
                onClick={() => setLimitOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-subtle transition hover:text-teal-400"
              >
                Understand the limitations
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    limitOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={limitPanelId}
                role="region"
                aria-labelledby={limitButtonId}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  limitOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="mt-2 rounded-xl border border-line bg-navy-950/50 px-3.5 py-3 text-sm leading-relaxed text-muted">
                    {promise.limitations}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export function OurPromise() {
  const baseId = useId()

  return (
    <div className="mt-16 border-t border-line pt-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
          Our Promise to You
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Tired of unreadable EULAs? Try ours.
        </h3>
        <p className="mt-3 font-display text-base font-medium text-teal-400 sm:text-lg">
          Seven promises. NO bull Sh*t. Your data protected by principles.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          We believe protecting your data starts with respecting you. That’s why
          we’ve written our commitments in plain English. No confusing legal
          jargon. No hidden surprises. Just seven promises you can actually
          understand.
        </p>
      </div>

      <ul
        className="mx-auto mt-10 max-w-3xl space-y-3"
        aria-label="Seven planned customer promises"
      >
        {CUSTOMER_PROMISES.map((promise) => (
          <PromiseStatement
            key={promise.id}
            promise={promise}
            baseId={baseId}
          />
        ))}
      </ul>

      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-subtle">
        Our planned customer commitments. Final service terms and technical
        safeguards will be published before launch.
      </p>
    </div>
  )
}
