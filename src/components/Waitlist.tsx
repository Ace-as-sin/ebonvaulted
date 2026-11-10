import { CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { analytics } from '../lib/analytics'
import { ctaDelayStyle } from '../lib/ctaDelay'
import { createMetaEventId, trackLead } from '../lib/metaPixel'
import { INTENDED_USE_OPTIONS, PLAN_LABELS } from '../lib/plans'
import { isTrackingAllowed } from '../lib/trackingConsent'
import {
  getWaitlistEndpoint,
  submitWaitlist,
  validateWaitlistForm,
} from '../lib/waitlist'
import type { IntendedUse, StoragePlan, WaitlistFormData } from '../types'

interface WaitlistProps {
  selectedPlan: StoragePlan
  onPlanChange: (plan: StoragePlan) => void
  email: string
  onEmailChange: (email: string) => void
  joined: boolean
  onJoined: () => void
}

export function Waitlist({
  selectedPlan,
  onPlanChange,
  email,
  onEmailChange,
  joined,
  onJoined,
}: WaitlistProps) {
  const formId = useId()
  const [intendedUse, setIntendedUse] = useState<IntendedUse>('personal')
  const [feedback, setFeedback] = useState('')
  const [consent, setConsent] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [errors, setErrors] = useState<
    Partial<Record<keyof WaitlistFormData, string>>
  >({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const submittingRef = useRef(false)

  const fullForm: WaitlistFormData = {
    email,
    plan: selectedPlan,
    intendedUse,
    feedback,
    consent,
  }

  const clearFieldError = (key: keyof WaitlistFormData) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submittingRef.current || joined) return

    const fieldErrors = validateWaitlistForm(fullForm)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) {
      const first = Object.keys(fieldErrors)[0]
      if (first === 'plan' || first === 'intendedUse' || first === 'feedback') {
        setDetailsOpen(true)
      }
      window.setTimeout(() => {
        document.getElementById(`${formId}-${first}`)?.focus()
      }, 0)
      return
    }

    if (!getWaitlistEndpoint()) {
      setStatus('error')
      setMessage(
        'Development mode: VITE_WAITLIST_ENDPOINT is not configured. Submissions are disabled until a backend endpoint is set.',
      )
      analytics.track('waitlist_submit_error', {
        plan: selectedPlan,
        code: 'not_configured',
      })
      return
    }

    submittingRef.current = true
    setStatus('loading')
    setMessage('')

    const trackingAllowed = isTrackingAllowed()
    const metaEventId = trackingAllowed ? createMetaEventId() : undefined
    const result = await submitWaitlist(fullForm, {
      eventId: metaEventId,
      trackingAllowed,
    })

    submittingRef.current = false

    if (result.ok) {
      setStatus('idle')
      if (metaEventId) trackLead(metaEventId)
      analytics.track('waitlist_submit_success', {
        plan: selectedPlan,
        intendedUse,
      })
      onJoined()
      return
    }

    setStatus('error')
    setMessage(result.error)
    analytics.track('waitlist_submit_error', {
      plan: selectedPlan,
      code: result.code,
    })
  }

  return (
    <section
      id="waitlist"
      className="scroll-mt-20 border-t border-line bg-radial-glow py-20 sm:py-24"
      aria-labelledby="waitlist-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-line bg-charcoal-800/60 shadow-2xl shadow-navy-950/50 backdrop-blur-sm">
          <div className="border-b border-line bg-gradient-to-r from-teal-500/10 via-transparent to-blue-500/10 px-6 py-8 sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Early Access
            </p>
            <h2
              id="waitlist-heading"
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              Be First Inside the Vault.
            </h2>
            <p className="mt-3 text-base text-muted">
              Join the waitlist to receive 5GB free on launch, help shape
              pricing, and get launch-related updates. No payment is collected
              at this stage.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {joined ? (
              <div
                className="flex flex-col items-center gap-4 py-8 text-center"
                role="status"
              >
                <CheckCircle2
                  className="h-12 w-12 text-teal-400"
                  aria-hidden="true"
                />
                <h3 className="font-display text-xl font-semibold text-ink">
                  You are on the waitlist
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-muted">
                  We will email you with launch updates for the plan you
                  selected.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => void handleSubmit(e)}
                noValidate
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor={`${formId}-email`}
                    className="block text-sm font-medium text-ink"
                  >
                    Email address <span className="text-teal-400">*</span>
                  </label>
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      analytics.waitlistFormStart(selectedPlan)
                      onEmailChange(e.target.value)
                      clearFieldError('email')
                      if (status === 'error') {
                        setStatus('idle')
                        setMessage('')
                      }
                    }}
                    onFocus={() => analytics.waitlistFormStart(selectedPlan)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? `${formId}-email-error` : undefined
                    }
                    className="mt-2 w-full rounded-xl border border-line bg-navy-950/60 px-4 py-3 text-sm text-ink placeholder:text-subtle transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p
                      id={`${formId}-email-error`}
                      className="mt-1.5 text-sm text-red-400"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    id={`${formId}-details-toggle`}
                    aria-expanded={detailsOpen}
                    aria-controls={`${formId}-details`}
                    onClick={() => setDetailsOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal-400"
                  >
                    Optional details
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        detailsOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={`${formId}-details`}
                    role="region"
                    aria-labelledby={`${formId}-details-toggle`}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      detailsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-5 pt-4">
                        <div>
                          <label
                            htmlFor={`${formId}-plan`}
                            className="block text-sm font-medium text-ink"
                          >
                            Preferred storage plan
                          </label>
                          <select
                            id={`${formId}-plan`}
                            name="plan"
                            value={selectedPlan}
                            onChange={(e) => {
                              const plan = e.target.value as StoragePlan
                              analytics.waitlistFormStart(plan)
                              onPlanChange(plan)
                              analytics.track('pricing_plan_select', {
                                plan,
                                source: 'form',
                              })
                            }}
                            onFocus={() =>
                              analytics.waitlistFormStart(selectedPlan)
                            }
                            className="mt-2 w-full rounded-xl border border-line bg-navy-950/60 px-4 py-3 text-sm text-ink transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
                          >
                            {(Object.keys(PLAN_LABELS) as StoragePlan[]).map(
                              (id) => (
                                <option key={id} value={id}>
                                  {PLAN_LABELS[id]}
                                </option>
                              ),
                            )}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor={`${formId}-intendedUse`}
                            className="block text-sm font-medium text-ink"
                          >
                            Primary intended use
                          </label>
                          <select
                            id={`${formId}-intendedUse`}
                            name="intendedUse"
                            value={intendedUse}
                            onChange={(e) => {
                              analytics.waitlistFormStart(selectedPlan)
                              setIntendedUse(e.target.value as IntendedUse)
                              clearFieldError('intendedUse')
                            }}
                            className="mt-2 w-full rounded-xl border border-line bg-navy-950/60 px-4 py-3 text-sm text-ink transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
                          >
                            {INTENDED_USE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor={`${formId}-feedback`}
                            className="block text-sm font-medium text-ink"
                          >
                            What matters most to you?
                          </label>
                          <textarea
                            id={`${formId}-feedback`}
                            name="feedback"
                            rows={3}
                            maxLength={1000}
                            value={feedback}
                            onChange={(e) => {
                              analytics.waitlistFormStart(selectedPlan)
                              setFeedback(e.target.value)
                              clearFieldError('feedback')
                            }}
                            className="mt-2 w-full resize-y rounded-xl border border-line bg-navy-950/60 px-4 py-3 text-sm text-ink placeholder:text-subtle transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
                            placeholder="Privacy, price, storage size, sharing, mobile access…"
                          />
                          {errors.feedback && (
                            <p
                              className="mt-1.5 text-sm text-red-400"
                              role="alert"
                            >
                              {errors.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-start gap-3 text-sm text-muted">
                    <input
                      id={`${formId}-consent`}
                      name="consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => {
                        analytics.waitlistFormStart(selectedPlan)
                        setConsent(e.target.checked)
                        clearFieldError('consent')
                      }}
                      aria-invalid={Boolean(errors.consent)}
                      aria-describedby={
                        errors.consent ? `${formId}-consent-error` : undefined
                      }
                      className="mt-0.5 h-4 w-4 rounded border-line bg-navy-950 text-teal-500 focus:ring-teal-400/40"
                    />
                    <span>
                      I agree to receive launch-related emails from Ebon Vaults
                      about early access and product updates.{' '}
                      <span className="text-teal-400">*</span>
                    </span>
                  </label>
                  {errors.consent && (
                    <p
                      id={`${formId}-consent-error`}
                      className="mt-1.5 text-sm text-red-400"
                      role="alert"
                    >
                      {errors.consent}
                    </p>
                  )}
                </div>

                {status === 'error' && message && (
                  <div
                    className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
                    role="alert"
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-cta inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  style={ctaDelayStyle('waitlist-submit')}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Submitting…
                    </>
                  ) : (
                    'Join the Waitlist'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
