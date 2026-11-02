import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { analytics } from '../lib/analytics'
import {
  buildPricingEstimate,
  parseStorageInput,
  recommendWaitlistPlan,
} from '../lib/pricing'
import { PRICING_CONFIG, PRICING_DISCLAIMER } from '../lib/pricingConfig'
import type { BillingPeriod, PricingModel, StoragePlan } from '../types'
import { PricingExplanation } from './calculator/PricingExplanation'
import { PricingModelSelector } from './calculator/PricingModelSelector'
import { PricingSummary } from './calculator/PricingSummary'
import { StorageComparison } from './calculator/StorageComparison'
import { StorageSlider } from './calculator/StorageSlider'

interface PricingCalculatorProps {
  onJoinWaitlist: (plan: StoragePlan) => void
}

export function PricingCalculator({ onJoinWaitlist }: PricingCalculatorProps) {
  const [storageGb, setStorageGb] = useState(PRICING_CONFIG.defaultStorageGb)
  const [inputText, setInputText] = useState(
    String(PRICING_CONFIG.defaultStorageGb),
  )
  const [model, setModel] = useState<PricingModel>('usage')
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [selectedFixedPlanId, setSelectedFixedPlanId] =
    useState<StoragePlan>('plus')

  const estimate = useMemo(
    () =>
      buildPricingEstimate({
        storageGb,
        model,
        billingPeriod,
        selectedFixedPlanId,
      }),
    [storageGb, model, billingPeriod, selectedFixedPlanId],
  )

  const setStorage = (gb: number) => {
    const clamped = Math.min(
      PRICING_CONFIG.usage.maxStorageGb,
      Math.max(PRICING_CONFIG.usage.minStorageGb, gb),
    )
    setStorageGb(clamped)
    setInputText(String(clamped))

    // Keep fixed-plan selection aligned when usage exceeds the current plan.
    if (model === 'fixed') {
      const current = PRICING_CONFIG.fixedPlans.find(
        (p) => p.id === selectedFixedPlanId,
      )
      if (current && clamped > current.storageGb) {
        const auto = PRICING_CONFIG.fixedPlans
          .slice()
          .sort((a, b) => a.storageGb - b.storageGb)
          .find((p) => p.storageGb >= clamped)
        if (auto) setSelectedFixedPlanId(auto.id)
      }
    }
  }

  const commitInput = () => {
    const parsed = parseStorageInput(inputText)
    if (parsed === null) {
      setInputText(String(storageGb))
      return
    }
    setStorage(Math.round(parsed * 100) / 100)
  }

  const handleJoinWaitlist = () => {
    const plan = recommendWaitlistPlan(storageGb, model, selectedFixedPlanId)
    analytics.track('cta_click', {
      id: 'calculator_waitlist',
      location: 'pricing_calculator',
    })
    analytics.track('pricing_plan_select', {
      plan,
      source: 'calculator',
    })
    onJoinWaitlist(plan)
  }

  return (
    <section
      id="pricing-calculator"
      className="scroll-mt-20 border-t border-line bg-navy-950 py-20 sm:py-24"
      aria-labelledby="calculator-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Pricing Calculator
          </p>
          <h2
            id="calculator-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            Private storage. Your rules. Your price.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Estimate monthly space storage costs, compare pay-as-you-go with
            fixed plans, and see what reserved capacity means for your usage.
          </p>
          <p className="mt-2 text-sm text-subtle">{PRICING_DISCLAIMER}</p>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-line bg-charcoal-800/50 shadow-2xl shadow-navy-950/40">
          <div className="grid lg:grid-cols-2">
            <div className="space-y-8 border-b border-line p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <PricingModelSelector
                model={model}
                billingPeriod={billingPeriod}
                onModelChange={setModel}
                onBillingPeriodChange={setBillingPeriod}
              />
              <StorageSlider
                value={Math.round(storageGb)}
                inputText={inputText}
                onValueChange={setStorage}
                onInputTextChange={setInputText}
                onInputCommit={commitInput}
              />
            </div>

            <div className="space-y-6 bg-gradient-to-b from-teal-500/5 via-transparent to-blue-500/5 p-6 sm:p-8">
              <PricingSummary
                estimate={estimate}
                selectedFixedPlanId={selectedFixedPlanId}
                onFixedPlanChange={setSelectedFixedPlanId}
              />
            </div>
          </div>

          <div className="border-t border-line p-6 sm:p-8">
            <StorageComparison estimate={estimate} />
          </div>

          <div className="border-t border-line px-6 py-5 sm:px-8">
            <PricingExplanation />
          </div>
        </div>

        <div className="mt-14 rounded-3xl border-2 border-teal-400/40 bg-gradient-to-br from-teal-500/15 via-charcoal-800/80 to-blue-500/15 px-6 py-12 text-center shadow-2xl shadow-teal-500/15 sm:px-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Next step
          </p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Find your space. Join the waitlist.
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Explore your storage options today. Be among the first to know when
            Ebon Vaults launches.
          </p>
          <button
            type="button"
            onClick={handleJoinWaitlist}
            className="mt-8 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-8 py-4 text-base font-semibold text-navy-950 shadow-lg shadow-teal-500/30 transition hover:brightness-110 sm:w-auto sm:min-w-[280px] sm:px-10 sm:py-4 sm:text-lg"
          >
            Join the Waitlist
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="mt-4 text-sm text-subtle">
            We’ll preselect the closest fixed plan preference from your estimate.
            No payment is collected today.
          </p>
        </div>
      </div>
    </section>
  )
}
