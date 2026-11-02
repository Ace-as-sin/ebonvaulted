import { KeyRound, Lock, Server, Shield, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArchitectureDiagram } from '../components/security/ArchitectureDiagram'
import { TopicCard } from '../components/security/TopicCard'
import {
  ACCESS_TOPICS,
  ENCRYPTION_TOPICS,
  INFRASTRUCTURE_TOPICS,
  PRIVACY_ALIGNMENT,
  RECOVERY_TOPICS,
} from '../content/security'
import { analytics } from '../lib/analytics'

export function SecurityPage() {
  useEffect(() => {
    analytics.pageView('/security')
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="border-b border-line">
      <header className="relative overflow-hidden border-b border-line bg-radial-glow">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Our Security
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Your Data. Your Keys. Your Private Space.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            A transparent look at how we&apos;re designing Ebon Vaults to protect
            your files—from encryption and access controls to physical
            infrastructure and disaster recovery.
          </p>
          <p className="mt-4 inline-flex max-w-2xl rounded-full border border-blue-400/35 bg-blue-500/10 px-3.5 py-1.5 text-sm font-medium text-blue-400">
            Planned — everything on this page describes our intended design, not
            a live production vault.
          </p>
        </div>
      </header>

      <section
        className="border-b border-line py-16 sm:py-20"
        aria-labelledby="expertise-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-14">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-400 ring-1 ring-teal-400/25">
              <Shield className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
                Expertise
              </p>
              <h2
                id="expertise-heading"
                className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
              >
                Built With Cybersecurity at Its Core
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted">
                Ebon Vaults is being designed by cybersecurity specialists with
                years of experience in cybersecurity and technology. Security
                isn&apos;t an afterthought or an optional feature—it&apos;s a
                foundational part of how we&apos;re designing our infrastructure,
                software, and privacy protections.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted">
                We approach storage security through layered defenses, careful
                access controls, encryption, threat modeling, and transparent
                engineering decisions. Our goal is to build a service where
                customers retain meaningful control over their information.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-subtle">
                This describes our design approach. It does not claim an external
                cybersecurity firm has independently validated the architecture,
                and it does not invent certifications or headcount.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-b border-line bg-navy-900/30 py-16 sm:py-20"
        aria-labelledby="architecture-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Architecture
            </p>
            <h2
              id="architecture-heading"
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              Planned data flow
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Our security model is built around encrypting on the customer
              device first, then moving ciphertext through an application layer
              that manages identity and storage — not plaintext browsing of your
              files.
            </p>
          </div>

          <div className="mt-12">
            <ArchitectureDiagram />
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-line bg-charcoal-800/40 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Lock
                className="mt-0.5 h-5 w-5 shrink-0 text-teal-400"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-muted">
                In the planned design, the server manages authentication, storage
                quotas, encrypted objects, file metadata, and access permissions
                without needing access to plaintext file contents.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {ENCRYPTION_TOPICS.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-b border-line py-16 sm:py-20"
        aria-labelledby="infrastructure-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Infrastructure
            </p>
            <h2
              id="infrastructure-heading"
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              Independent Infrastructure. Purpose-Built Storage.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              We&apos;re designing Ebon Vaults around independently operated
              physical servers and purpose-built storage — so space storage stays
              storage, not a side channel into advertising platforms.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {INFRASTRUCTURE_TOPICS.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-b border-line bg-navy-900/30 py-16 sm:py-20"
        aria-labelledby="access-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/20">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="access-heading"
                className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
              >
                Access controls &amp; permissions
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                Layered access design is part of how we intend to keep vault
                contents private even when systems are online and reachable.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {ACCESS_TOPICS.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-b border-line py-16 sm:py-20"
        aria-labelledby="recovery-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-teal-400 ring-1 ring-teal-400/25">
              <Server className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="recovery-heading"
                className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
              >
                Resilience &amp; recovery
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                Before launch, we plan to validate how backups, restores, and
                operational recovery interact with encryption commitments.
              </p>
            </div>
          </div>
          <div className="mt-10 space-y-5">
            {RECOVERY_TOPICS.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-b border-line bg-navy-900/30 py-16 sm:py-20"
        aria-labelledby="privacy-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Privacy principles
            </p>
            <h2
              id="privacy-heading"
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              Aligned with our Seven Privacy Promises
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Security architecture supports the same commitments published on
              the homepage — ownership, no sale or AI training, privacy, care,
              and transparent subscriptions.
            </p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {PRIVACY_ALIGNMENT.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-line bg-charcoal-800/40 p-5"
              >
                <h3 className="font-display text-base font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-muted">
            Read the full promises on the{' '}
            <Link to="/#about" className="font-medium text-teal-400 hover:underline">
              About
            </Link>{' '}
            section of the homepage.
          </p>
        </div>
      </section>

      <section className="bg-radial-glow py-16 sm:py-20" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <Sparkles
            className="mx-auto h-8 w-8 text-teal-400"
            aria-hidden="true"
          />
          <h2
            id="cta-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink"
          >
            Follow the build
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Join the waitlist to hear as we turn this planned architecture into
            a working vault — without invented launch dates or unverified claims.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/#waitlist"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:brightness-110"
              onClick={() => {
                analytics.track('cta_click', {
                  id: 'join_waitlist',
                  location: 'security_page',
                })
              }}
            >
              Join the Waitlist
            </Link>
            <Link
              to="/pricing-calculator"
              className="inline-flex items-center justify-center rounded-xl border border-line-strong bg-white/5 px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-teal-400/40"
            >
              Pricing Calculator
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
