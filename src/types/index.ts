export type StoragePlan = 'essential' | 'plus' | 'premium'

export type IntendedUse =
  | 'personal'
  | 'photos'
  | 'business'
  | 'other'

export interface WaitlistFormData {
  email: string
  plan: StoragePlan
  intendedUse: IntendedUse
  feedback: string
  consent: boolean
}

export interface WaitlistPayload {
  email: string
  plan: StoragePlan
  intendedUse: IntendedUse
  feedback?: string
  source?: string
  submittedAt: string
}

export type WaitlistResult =
  | { ok: true }
  | { ok: false; error: string; code: 'not_configured' | 'network' | 'server' | 'validation' }

export interface PricingPlan {
  id: StoragePlan
  name: string
  storage: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
}

export type AnalyticsEventName =
  | 'page_view'
  | 'pricing_section_view'
  | 'pricing_plan_select'
  | 'waitlist_form_start'
  | 'waitlist_submit_success'
  | 'waitlist_submit_error'
  | 'cta_click'
  | 'nav_click'

export interface AnalyticsEventMap {
  page_view: { path: string; referrer?: string }
  pricing_section_view: { once?: boolean }
  pricing_plan_select: { plan: StoragePlan; source: 'pricing_card' | 'form' }
  waitlist_form_start: { plan?: StoragePlan }
  waitlist_submit_success: { plan: StoragePlan; intendedUse: IntendedUse }
  waitlist_submit_error: { plan: StoragePlan; code: string }
  cta_click: { id: string; location: string }
  nav_click: { target: string }
}
