interface LogoProps {
  className?: string
  compact?: boolean
}

/** Text-based logo placeholder — swap the inner markup for an <img> when ready. */
export function Logo({ className = '', compact = false }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-display font-semibold tracking-tight text-ink ${className}`}
      aria-label="Ebon Vaulted"
    >
      <span
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/20 to-blue-500/20 ring-1 ring-teal-400/30"
        aria-hidden="true"
      >
        <span className="h-3.5 w-3.5 rounded-sm border-2 border-teal-400/90 bg-navy-900/60 shadow-[0_0_12px_rgba(45,212,191,0.35)]" />
      </span>
      {!compact && (
        <span className="text-[1.05rem] leading-none">
          Ebon <span className="text-teal-400">Vaulted</span>
        </span>
      )}
    </span>
  )
}
