import iconSrc from '../assets/EbonVaultsIconSmall.png'

interface LogoProps {
  className?: string
  compact?: boolean
  /** When false, renders wordmark only (no icon). */
  showIcon?: boolean
}

export function Logo({
  className = '',
  compact = false,
  showIcon = true,
}: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-display font-semibold tracking-tight text-ink ${className}`}
      aria-label="Ebon Vaults"
    >
      {showIcon && (
        <img
          src={iconSrc}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-lg object-cover"
          aria-hidden="true"
        />
      )}
      {!compact && (
        <span className="text-[1.05rem] leading-none">
          Ebon <span className="text-teal-400">Vaults</span>
        </span>
      )}
    </span>
  )
}
