import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pricing } from '../components/Pricing'
import { PricingCalculator } from '../components/PricingCalculator'
import { analytics } from '../lib/analytics'
import { waitlistPath } from '../lib/waitlistNav'
import type { StoragePlan } from '../types'

export function PricingCalculatorPage() {
  const navigate = useNavigate()

  useEffect(() => {
    analytics.pageView('/pricing-calculator')
    window.scrollTo(0, 0)
  }, [])

  const goToWaitlist = useCallback(
    (plan: StoragePlan) => {
      navigate(waitlistPath(plan))
    },
    [navigate],
  )

  return (
    <div className="border-b border-line">
      <Pricing onSelectPlan={goToWaitlist} showCalculatorLink={false} />
      <PricingCalculator onJoinWaitlist={goToWaitlist} />
    </div>
  )
}
