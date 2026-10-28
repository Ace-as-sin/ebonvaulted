import { Building2, Eye, HandCoins, KeyRound } from 'lucide-react'
import { OurPromise } from './OurPromise'
import { Reveal } from './Reveal'

const PILLARS = [
  {
    icon: KeyRound,
    title: 'You control your information',
    body: 'Personal files should remain under customer control. Storage should not require surrendering privacy as the price of convenience.',
  },
  {
    icon: Building2,
    title: 'Independent infrastructure',
    body: 'Ebon Vaults intends to operate its own physical servers. Owning the stack supports clearer accountability and transparent business practices.',
  },
  {
    icon: HandCoins,
    title: 'Straightforward pricing',
    body: 'A clear subscription model — not advertising profiles, data resale, or secondary monetization of customer content.',
  },
  {
    icon: Eye,
    title: 'Trust through clarity',
    body: 'We will document security practices as systems are designed and verified. No unverified promises — just honest progress toward a trustworthy product.',
  },
]

export function About() {
  return (
    <section
      id="about"
      className="scroll-mt-20 border-t border-line py-20 sm:py-24"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Why Ebon Vaults?
            </p>
            <h2
              id="about-heading"
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              Privacy should not be optional
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Large cloud providers often bundle storage with advertising,
              analytics, or AI pipelines. Ebon Vaults is being built as an
              independently operated alternative focused on secure storage —
              without turning personal files into a product.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              We are still in prelaunch. Production servers have not been
              purchased or deployed yet. This site exists to measure demand,
              refine pricing, and gather feedback from people who care about
              private, encrypted storage.
            </p>
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-2">
            {PILLARS.map((pillar, index) => {
              const Icon = pillar.icon
              return (
                <Reveal
                  key={pillar.title}
                  as="li"
                  delay={100 + index * 80}
                  className="rounded-2xl border border-line bg-charcoal-800/40 p-5"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/20">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-ink">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {pillar.body}
                  </p>
                </Reveal>
              )
            })}
          </ul>
        </div>

        <Reveal delay={120} variant="fade">
          <OurPromise />
        </Reveal>
      </div>
    </section>
  )
}
