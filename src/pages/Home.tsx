import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { About } from '../components/About'
import { FAQ } from '../components/FAQ'
import { Features } from '../components/Features'
import { Hero } from '../components/Hero'
import { Pricing } from '../components/Pricing'
import { ValueStrip } from '../components/ValueStrip'
import { Waitlist } from '../components/Waitlist'
import { analytics } from '../lib/analytics'
import { isStoragePlan } from '../lib/waitlistNav'
import type { StoragePlan } from '../types'

export function Home() {
  const [searchParams] = useSearchParams()
  const planFromUrl = searchParams.get('plan')
  const [selectedPlan, setSelectedPlan] = useState<StoragePlan>(() =>
    isStoragePlan(planFromUrl) ? planFromUrl : 'plus',
  )
  const [syncedPlanParam, setSyncedPlanParam] = useState(planFromUrl)
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  if (planFromUrl !== syncedPlanParam) {
    setSyncedPlanParam(planFromUrl)
    if (isStoragePlan(planFromUrl)) {
      setSelectedPlan(planFromUrl)
    }
  }

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
      <Hero
        email={email}
        onEmailChange={setEmail}
        selectedPlan={selectedPlan}
        joined={joined}
        onJoined={() => setJoined(true)}
      />
      <ValueStrip />
      <Waitlist
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
        email={email}
        onEmailChange={setEmail}
        joined={joined}
        onJoined={() => setJoined(true)}
      />
      <Pricing onSelectPlan={selectPlanAndScroll} />
      <Features />
      <About />
      <FAQ />
    </>
  )
}
