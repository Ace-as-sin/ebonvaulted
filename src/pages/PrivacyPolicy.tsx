import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { analytics } from '../lib/analytics'

export function PrivacyPolicy() {
  useEffect(() => {
    analytics.pageView('/privacy')
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm text-teal-400">
        <Link to="/" className="hover:underline">
          ← Back to home
        </Link>
      </p>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-subtle">
        Last updated: October 28, 2026 · Prelaunch placeholder
      </p>

      <div className="prose-legal mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Overview
          </h2>
          <p className="mt-2">
            Ebon Vaults is a prelaunch privacy-focused cloud storage project.
            This website exists to collect early-access waitlist interest. We
            do not operate a production file-storage service at this time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Information we collect
          </h2>
          <p className="mt-2">
            If you join the waitlist, we collect the information you submit:
            email address, preferred storage plan, primary intended use, and
            any optional feedback you provide. We also record that you
            consented to receive launch-related emails.
          </p>
          <p className="mt-2">
            If analytics are enabled via site configuration, we may collect
            aggregated, non-identifying usage signals such as page views,
            section views, and plan selections. Analytics are designed not to
            transmit your waitlist email or other form contents unless a future
            configuration explicitly changes that practice and this policy is
            updated.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            How we use information
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>To manage the early-access waitlist</li>
            <li>To send launch-related emails you consented to receive</li>
            <li>To understand demand for pricing plans and product features</li>
            <li>To improve this prelaunch website</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            What we do not do
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>We do not sell waitlist information</li>
            <li>
              We do not use submitted information to train AI models on your
              personal files (no customer files are stored on this prelaunch
              site)
            </li>
            <li>
              We do not create advertising profiles from waitlist submissions
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Storage and retention
          </h2>
          <p className="mt-2">
            Waitlist submissions are sent to a backend endpoint configured by
            the site operator. Retention details depend on that backend.
            {/* PLACEHOLDER: Confirm retention period and storage location once the waitlist backend is chosen. */}
            <span className="mt-2 block rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-amber-100/90">
              [PLACEHOLDER] Retention period, hosting region, and subprocessors
              will be confirmed when the waitlist backend is finalized.
            </span>
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Contact
          </h2>
          <p className="mt-2">
            {/* PLACEHOLDER: Do not invent a support email or legal entity. */}
            <span className="block rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-amber-100/90">
              [PLACEHOLDER] Add a contact email and legal entity name here once
              confirmed. Until then, use the waitlist form only for launch
              interest — not for legal requests that require a verified channel.
            </span>
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Changes
          </h2>
          <p className="mt-2">
            This policy may be updated as Ebon Vaults moves from prelaunch toward
            a live service. Material changes affecting waitlist members will be
            reflected on this page.
          </p>
        </section>
      </div>
    </article>
  )
}
