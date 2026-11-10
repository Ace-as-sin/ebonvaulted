import { ArrowRight, CheckCircle2, Loader2, Shield } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import iconHeroSrc from '../assets/EbonVaultsIcon-hero.webp'
import iconHeroLgSrc from '../assets/EbonVaultsIcon-hero-lg.webp'
import { analytics } from '../lib/analytics'
import { ctaDelayStyle } from '../lib/ctaDelay'
import { createMetaEventId, trackLead } from '../lib/metaPixel'
import { isTrackingAllowed } from '../lib/trackingConsent'
import {
  getWaitlistEndpoint,
  submitWaitlist,
  validateWaitlistForm,
} from '../lib/waitlist'
import type { StoragePlan } from '../types'
import { VaultIllustration } from './VaultIllustration'

interface HeroProps {
  email: string
  onEmailChange: (email: string) => void
  selectedPlan: StoragePlan
  joined: boolean
  onJoined: () => void
}

export function Hero({
  email,
  onEmailChange,
  selectedPlan,
  joined,
  onJoined,
}: HeroProps) {
  const formId = useId()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const submittingRef = useRef(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submittingRef.current || joined) return

    analytics.track('cta_click', {
      id: 'join_early_access',
      location: 'hero',
    })

    const form = {
      email,
      plan: selectedPlan,
      intendedUse: 'personal' as const,
      feedback: '',
      consent: true,
    }
    const fieldErrors = validateWaitlistForm(form)
    if (fieldErrors.email) {
      setEmailError(fieldErrors.email)
      document.getElementById(`${formId}-email`)?.focus()
      return
    }
    setEmailError('')

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
    const result = await submitWaitlist(form, {
      eventId: metaEventId,
      trackingAllowed,
    })

    submittingRef.current = false

    if (result.ok) {
      setStatus('idle')
      if (metaEventId) trackLead(metaEventId)
      analytics.track('waitlist_submit_success', {
        plan: selectedPlan,
        intendedUse: 'personal',
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
      className="relative overflow-hidden bg-radial-glow"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <img
        src={iconHeroSrc}
        srcSet={`${iconHeroSrc} 520w, ${iconHeroLgSrc} 780w`}
        sizes="(min-width: 1024px) 520px, (min-width: 640px) min(48vw, 480px), min(55vw, 420px)"
        alt=""
        width={520}
        height={347}
        decoding="async"
        fetchPriority="low"
        loading="lazy"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-0 w-[min(55vw,420px)] -translate-x-[12%] translate-y-[18%] select-none opacity-[0.14] sm:w-[min(48vw,480px)] sm:opacity-[0.16] lg:w-[520px]"
      />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <div className="animate-fade-up text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-1.5 text-xs font-medium text-teal-400 backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            Coming Soon
          </div>

          <h1
            id="hero-heading"
            className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]"
          >
            Your Data.{' '}
            <span className="text-gradient">Your Vault.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
            Private, encrypted file storage designed to put control of your data
            back in your hands. No AI training. No advertising profiles. Just
            your files, protected.
          </p>

          {joined ? (
            <div
              className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-teal-400/25 bg-teal-500/10 px-5 py-5 text-center sm:flex-row sm:text-left lg:items-start"
              role="status"
            >
              <CheckCircle2
                className="h-8 w-8 shrink-0 text-teal-400"
                aria-hidden="true"
              />
              <div>
                <p className="font-display text-lg font-semibold text-ink">
                  You are on the waitlist
                </p>
                <p className="mt-1 text-sm text-muted">
                  We will email you with launch updates. 5GB free on launch.
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              noValidate
              className="mt-8"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <label className="sr-only" htmlFor={`${formId}-email`}>
                  Email address
                </label>
                <input
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    onEmailChange(e.target.value)
                    if (emailError) setEmailError('')
                    if (status === 'error') {
                      setStatus('idle')
                      setMessage('')
                    }
                    analytics.waitlistFormStart(selectedPlan)
                  }}
                  onFocus={() => analytics.waitlistFormStart(selectedPlan)}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={
                    emailError ? `${formId}-email-error` : `${formId}-consent`
                  }
                  className="w-full min-w-0 flex-1 rounded-xl border border-line bg-navy-950/60 px-4 py-3.5 text-sm text-ink placeholder:text-subtle transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
                  placeholder="you@example.com"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-cta inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[11.5rem]"
                  style={ctaDelayStyle('hero')}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Joining…
                    </>
                  ) : (
                    <>
                      Join Early Access
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
              {emailError && (
                <p
                  id={`${formId}-email-error`}
                  className="mt-2 text-sm text-red-400"
                  role="alert"
                >
                  {emailError}
                </p>
              )}
              {status === 'error' && message && (
                <p className="mt-2 text-sm text-amber-100" role="alert">
                  {message}
                </p>
              )}
              <p
                id={`${formId}-consent`}
                className="mt-3 text-xs leading-relaxed text-subtle"
              >
                By joining, you agree to receive launch-related emails from
                Ebon Vaults. 5GB free on launch · No payment today.
              </p>
            </form>
          )}

          <div className="mt-5">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center text-sm font-medium text-muted transition hover:text-teal-400"
              onClick={() =>
                analytics.track('cta_click', {
                  id: 'explore_pricing',
                  location: 'hero',
                })
              }
            >
              Explore pricing
              <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div
          className="animate-fade-in relative mx-auto w-full max-w-md lg:max-w-none"
          style={{ animationDelay: '150ms' }}
        >
          <div className="animate-float">
            <VaultIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}
