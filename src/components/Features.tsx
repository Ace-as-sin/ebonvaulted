import {
  EyeOff,
  FolderLock,
  Share2,
  ShieldCheck,
  Smartphone,
  Server,
  type LucideIcon,
} from 'lucide-react'

interface Feature {
  title: string
  description: string
  icon: LucideIcon
  status: 'principle' | 'planned'
}

const FEATURES: Feature[] = [
  {
    title: 'Privacy First',
    description:
      'Built around protecting customer information — not monetizing it through ads or profiling.',
    icon: ShieldCheck,
    status: 'principle',
  },
  {
    title: 'Encrypted Storage',
    description:
      'Encryption designed to safeguard stored files as the platform is built and verified.',
    icon: FolderLock,
    status: 'planned',
  },
  {
    title: 'Independent Infrastructure',
    description:
      'Planned storage on Ebon Vaults’ own physical servers — not rented space from a third-party cloud.',
    icon: Server,
    status: 'planned',
  },
  {
    title: 'No AI Training',
    description:
      'Customer files will not be used to train AI models. Your data stays yours.',
    icon: EyeOff,
    status: 'principle',
  },
  {
    title: 'Simple File Access',
    description:
      'Planned secure browser and mobile access so you can reach your vault when you need it.',
    icon: Smartphone,
    status: 'planned',
  },
  {
    title: 'Share on Your Terms',
    description:
      'Planned controlled file-sharing so you decide what leaves the vault — and with whom.',
    icon: Share2,
    status: 'planned',
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-line py-20 sm:py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Features
          </p>
          <h2
            id="features-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            Built for control, not compromise
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Ebon Vaults is in prelaunch. The capabilities below describe our
            principles and planned product direction — not a live production
            service today.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <li
                key={feature.title}
                className="group rounded-2xl border border-line bg-charcoal-800/40 p-6 transition duration-300 hover:border-teal-400/30 hover:bg-charcoal-800/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/10 text-teal-400 ring-1 ring-teal-400/20 transition group-hover:bg-teal-400/15">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                      feature.status === 'planned'
                        ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/20'
                        : 'bg-teal-500/10 text-teal-400 ring-1 ring-teal-400/20'
                    }`}
                  >
                    {feature.status === 'planned' ? 'Planned' : 'Principle'}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
