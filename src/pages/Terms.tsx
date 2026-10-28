import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { analytics } from '../lib/analytics'

export function Terms() {
  useEffect(() => {
    analytics.pageView('/terms')
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
        Terms of Use
      </h1>
      <p className="mt-3 text-sm text-subtle">
        Last updated: October 28, 2026 · Prelaunch placeholder
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            About these terms
          </h2>
          <p className="mt-2">
            These terms apply to this prelaunch marketing and waitlist website
            for Ebon Vaulted. They do not govern a live cloud storage product —
            that product is not available yet.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Waitlist participation
          </h2>
          <p className="mt-2">
            Joining the waitlist is voluntary and free. Selecting a pricing plan
            indicates interest only. It does not create a paid subscription,
            reserve capacity, or guarantee access at launch.
          </p>
          <p className="mt-2">
            Preliminary prices shown on this site are for market validation and
            may change before launch.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Accuracy of information
          </h2>
          <p className="mt-2">
            You agree to provide an email address you control and information
            that is reasonably accurate for waitlist purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Communications
          </h2>
          <p className="mt-2">
            By consenting on the waitlist form, you agree to receive
            launch-related emails. You may request to stop those emails using
            the mechanism provided in future messages, once that process is
            available.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            No service warranty
          </h2>
          <p className="mt-2">
            This website is provided as-is for informational and waitlist
            purposes. Ebon Vaulted does not warrant uninterrupted availability of
            the site or a specific launch date for the storage product.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Governing details
          </h2>
          <p className="mt-2">
            <span className="block rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-amber-100/90">
              [PLACEHOLDER] Governing law, legal entity name, business address,
              and dispute process will be added once confirmed. Do not treat
              this page as complete legal counsel.
            </span>
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            Contact
          </h2>
          <p className="mt-2">
            <span className="block rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-amber-100/90">
              [PLACEHOLDER] Add an official contact channel here when available.
            </span>
          </p>
        </section>
      </div>
    </article>
  )
}
