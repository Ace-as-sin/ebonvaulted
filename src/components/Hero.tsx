import { ArrowRight, Shield } from 'lucide-react'
import { analytics } from '../lib/analytics'
import { VaultIllustration } from './VaultIllustration'

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-radial-glow"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
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

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#waitlist"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-teal-500/25 transition hover:brightness-110 sm:w-auto"
              onClick={() =>
                analytics.track('cta_click', {
                  id: 'join_early_access',
                  location: 'hero',
                })
              }
            >
              Join Early Access
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#pricing"
              className="inline-flex w-full items-center justify-center rounded-xl border border-line-strong bg-white/5 px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-teal-400/40 hover:bg-white/8 sm:w-auto"
              onClick={() =>
                analytics.track('cta_click', {
                  id: 'explore_pricing',
                  location: 'hero',
                })
              }
            >
              Explore Pricing
            </a>
          </div>

          <p className="mt-6 text-sm text-subtle">
            Prelaunch waitlist · Independent infrastructure in progress
          </p>
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
