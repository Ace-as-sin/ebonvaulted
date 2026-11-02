import { ArrowDown } from 'lucide-react'
import { ARCHITECTURE_STAGES } from '../../content/security'

export function ArchitectureDiagram() {
  return (
    <div className="rounded-3xl border border-line bg-charcoal-800/40 p-5 sm:p-8">
      <ol className="mx-auto flex max-w-xl flex-col items-stretch gap-0">
        {ARCHITECTURE_STAGES.map((stage, index) => (
          <li key={stage.id} className="flex flex-col items-center">
            <div className="w-full rounded-2xl border border-line bg-navy-950/70 px-4 py-4 text-center sm:px-6">
              <p className="font-display text-base font-semibold text-ink sm:text-lg">
                {stage.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {stage.detail}
              </p>
            </div>
            {index < ARCHITECTURE_STAGES.length - 1 && (
              <div
                className="flex flex-col items-center py-2 text-teal-400"
                aria-hidden="true"
              >
                <span className="h-3 w-px bg-teal-400/40" />
                <ArrowDown className="h-4 w-4" />
                <span className="h-3 w-px bg-teal-400/40" />
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-subtle">
        Architecture shown represents our planned production design and may
        evolve during security testing and development.
      </p>
    </div>
  )
}
