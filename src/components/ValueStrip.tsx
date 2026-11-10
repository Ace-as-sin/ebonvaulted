import { EyeOff, FolderLock, ShieldCheck, type LucideIcon } from 'lucide-react'

const POINTS: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: 'Privacy first',
    body: 'Built to protect your files — not monetize them with ads or profiles.',
    icon: ShieldCheck,
  },
  {
    title: 'No AI training',
    body: 'Your data stays yours. Customer files will not train AI models.',
    icon: EyeOff,
  },
  {
    title: 'Encrypted storage',
    body: 'Encryption designed to safeguard stored files as the platform is built.',
    icon: FolderLock,
  },
]

export function ValueStrip() {
  return (
    <section
      className="border-t border-line bg-navy-900/30 py-12 sm:py-14"
      aria-label="Why join Ebon Vaults"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3 sm:gap-10 sm:px-6 lg:px-8">
        {POINTS.map((point) => {
          const Icon = point.icon
          return (
            <div key={point.title} className="text-center sm:text-left">
              <div className="inline-flex items-center justify-center gap-2 text-teal-400">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <p className="text-sm font-semibold tracking-tight text-ink">
                  {point.title}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {point.body}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
