import { CheckCircle2, Loader2 } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { analytics } from '../lib/analytics'
import { INTENDED_USE_OPTIONS, PLAN_LABELS } from '../lib/plans'
import { getWaitlistEndpoint, submitWaitlist, validateWaitlistForm } from '../lib/waitlist'
import type { IntendedUse, StoragePlan, WaitlistFormData } from '../types'

interface WaitlistProps {
  selectedPlan: StoragePlan
  onPlanChange: (plan: StoragePlan) => void
}

const INITIAL: WaitlistFormData = {
  email: '',
  plan: 'plus',
  intendedUse: 'personal',
  feedback: '',
  consent: false,
}

export function Waitlist({ selectedPlan, onPlanChange }: WaitlistProps) {
  const formId = useId()
  const [form, setForm] = useState<Omit<WaitlistFormData, 'plan'>>({
    email: INITIAL.email,
    intendedUse: INITIAL.intendedUse,
    feedback: INITIAL.feedback,
    consent: INITIAL.consent,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof WaitlistFormData, string>>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const submittingRef = useRef(false)
  const emailRef = useRef<HTMLInputElement>(null)

  const fullForm: WaitlistFormData = { ...form, plan: selectedPlan }

  const update = <K extends keyof Omit<WaitlistFormData, 'plan'>>(
    key: K,
    value: WaitlistFormData[K],
  ) => {
    analytics.waitlistFormStart(selectedPlan)
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    if (status === 'error') {
      setStatus('idle')
      setMessage('')
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submittingRef.current || status === 'success') return

    const fieldErrors = validateWaitlistForm(fullForm)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) {
      const first = Object.keys(fieldErrors)[0]
      const el = document.getElementById(`${formId}-${first}`)
      el?.focus()
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

    const result = await submitWaitlist(fullForm)

    submittingRef.current = false

    if (result.ok) {
      setStatus('success')
      setMessage(
        'You are on the list. We will email you with launch updates for the plan you selected.',
      )
      analytics.track('waitlist_submit_success', {
        plan: selectedPlan,
        intendedUse: form.intendedUse,
      })
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
              Join the waitlist to share interest, help shape pricing, and get
              launch-related updates. No payment is collected at this stage.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {status === 'success' ? (
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
                  {message}
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
                    ref={emailRef}
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
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
                  <label
                    htmlFor={`${formId}-plan`}
                    className="block text-sm font-medium text-ink"
                  >
                    Preferred storage plan <span className="text-teal-400">*</span>
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
                    onFocus={() => analytics.waitlistFormStart(selectedPlan)}
                    className="mt-2 w-full rounded-xl border border-line bg-navy-950/60 px-4 py-3 text-sm text-ink transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
                  >
                    {(Object.keys(PLAN_LABELS) as StoragePlan[]).map((id) => (
                      <option key={id} value={id}>
                        {PLAN_LABELS[id]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-intendedUse`}
                    className="block text-sm font-medium text-ink"
                  >
                    Primary intended use <span className="text-teal-400">*</span>
                  </label>
                  <select
                    id={`${formId}-intendedUse`}
                    name="intendedUse"
                    value={form.intendedUse}
                    onChange={(e) =>
                      update('intendedUse', e.target.value as IntendedUse)
                    }
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
                    What matters most to you?{' '}
                    <span className="font-normal text-subtle">(optional)</span>
                  </label>
                  <textarea
                    id={`${formId}-feedback`}
                    name="feedback"
                    rows={3}
                    maxLength={1000}
                    value={form.feedback}
                    onChange={(e) => update('feedback', e.target.value)}
                    className="mt-2 w-full resize-y rounded-xl border border-line bg-navy-950/60 px-4 py-3 text-sm text-ink placeholder:text-subtle transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
                    placeholder="Privacy, price, storage size, sharing, mobile access…"
                  />
                </div>

                <div>
                  <label className="flex items-start gap-3 text-sm text-muted">
                    <input
                      id={`${formId}-consent`}
                      name="consent"
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => update('consent', e.target.checked)}
                      aria-invalid={Boolean(errors.consent)}
                      aria-describedby={
                        errors.consent ? `${formId}-consent-error` : undefined
                      }
                      className="mt-0.5 h-4 w-4 rounded border-line bg-navy-950 text-teal-500 focus:ring-teal-400/40"
                    />
                    <span>
                      I agree to receive launch-related emails from Ebon Vaulted
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-teal-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
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
