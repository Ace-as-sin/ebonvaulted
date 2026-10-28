import { Check } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { analytics } from '../lib/analytics'
import { PRICING_PLANS } from '../lib/plans'
import type { StoragePlan } from '../types'

interface PricingProps {
  onSelectPlan: (plan: StoragePlan) => void
}

export function Pricing({ onSelectPlan }: PricingProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          analytics.pricingSectionView()
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSelect = (plan: StoragePlan) => {
    analytics.track('pricing_plan_select', {
      plan,
      source: 'pricing_card',
    })
    analytics.track('cta_click', {
      id: `pricing_${plan}`,
      location: 'pricing',
    })
    onSelectPlan(plan)
  }

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="scroll-mt-20 border-t border-line bg-navy-900/50 py-20 sm:py-24"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Pricing
          </p>
          <h2
            id="pricing-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            Simple plans. Clear prices.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Initial test pricing for early interest. Select a plan to join the
            waitlist — no payment required today.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <li
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition duration-300 sm:p-8 ${
                plan.highlighted
                  ? 'border-teal-400/40 bg-gradient-to-b from-teal-400/10 via-charcoal-800/80 to-charcoal-800/60 shadow-xl shadow-teal-500/10 lg:-translate-y-2'
                  : 'border-line bg-charcoal-800/40 hover:border-line-strong'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-950">
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="font-display text-xl font-semibold text-ink">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-muted">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold tracking-tight text-ink">
                    {plan.price}
                  </span>
                  <span className="text-sm text-subtle">{plan.period}</span>
                </p>
                <p className="mt-1 text-sm font-medium text-teal-400">
                  {plan.storage} storage
                </p>
              </div>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-muted"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-teal-400"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-navy-950 shadow-lg shadow-teal-500/20 hover:brightness-110'
                    : 'border border-line-strong bg-white/5 text-ink hover:border-teal-400/40 hover:bg-white/8'
                }`}
                onClick={() => handleSelect(plan.id)}
              >
                Join Waitlist
              </button>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-subtle">
          Pricing is preliminary and subject to change before launch. The
          “Most Popular” label highlights a recommended starting point for
          testing interest — it does not reflect current sales or adoption.
        </p>
      </div>
    </section>
  )
}
