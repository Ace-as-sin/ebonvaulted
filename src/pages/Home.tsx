import { useCallback, useEffect, useState } from 'react'
import { About } from '../components/About'
import { FAQ } from '../components/FAQ'
import { Features } from '../components/Features'
import { Hero } from '../components/Hero'
import { Pricing } from '../components/Pricing'
import { Waitlist } from '../components/Waitlist'
import { analytics } from '../lib/analytics'
import type { StoragePlan } from '../types'

export function Home() {
  const [selectedPlan, setSelectedPlan] = useState<StoragePlan>('plus')

  useEffect(() => {
    analytics.pageView('/')
  }, [])

  const selectPlanAndScroll = useCallback((plan: StoragePlan) => {
    setSelectedPlan(plan)
    const el = document.getElementById('waitlist')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <>
      <Hero />
      <Pricing onSelectPlan={selectPlanAndScroll} />
      <Waitlist
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
      />
      <Features />
      <About />
      <FAQ />
    </>
  )
}
