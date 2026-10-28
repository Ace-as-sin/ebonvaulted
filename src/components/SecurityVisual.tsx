import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

function IconStage({
  caption,
  label,
  delay = 80,
  children,
}: {
  caption: string
  label: string
  delay?: number
  children: ReactNode
}) {
  return (
    <Reveal delay={delay} className="relative">
      <figure className="relative mx-auto flex w-full max-w-sm flex-col items-center lg:max-w-md">
        <div className="pointer-events-none absolute inset-[18%] rounded-full bg-gradient-to-br from-teal-400/15 via-blue-500/10 to-transparent blur-2xl" />
        <div className="relative flex aspect-square w-full max-w-[280px] items-center justify-center overflow-visible">
          {children}
        </div>
        <figcaption className="sr-only">{label}</figcaption>
        <p className="mt-2 text-center text-xs leading-relaxed text-subtle">
          {caption}
        </p>
      </figure>
    </Reveal>
  )
}

/** Features — animated lock. */
export function EncryptionVisual() {
  return (
    <IconStage
      label="Lock icon"
      caption="Encryption first. Files designed to stay sealed without your key."
    >
      <svg
        viewBox="0 0 160 160"
        className="h-[72%] w-[72%] animate-float-slow drop-shadow-[0_12px_40px_rgba(45,212,191,0.18)]"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M52 72v-16a28 28 0 0 1 56 0v16"
          stroke="#2dd4bf"
          strokeWidth="7"
          strokeLinecap="round"
          className="animate-lock-shackle"
        />
        <rect
          x="40"
          y="72"
          width="80"
          height="64"
          rx="14"
          fill="#0e1830"
          stroke="#2dd4bf"
          strokeWidth="3"
        />
        <circle cx="80" cy="98" r="8" fill="#2dd4bf" />
        <rect x="76" y="104" width="8" height="16" rx="3" fill="#2dd4bf" />
      </svg>
    </IconStage>
  )
}

/** About — animated vault door. */
export function VaultVisual() {
  return (
    <IconStage
      label="Vault icon"
      caption="Independent infrastructure — not rented space in someone else’s cloud."
      delay={40}
    >
      <svg
        viewBox="0 0 160 160"
        className="h-[76%] w-[76%] animate-float drop-shadow-[0_12px_40px_rgba(96,165,250,0.16)]"
        style={{ animationDuration: '7s' }}
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="28"
          y="36"
          width="104"
          height="100"
          rx="16"
          fill="#0e1830"
          stroke="#60a5fa"
          strokeWidth="3"
        />
        <g className="animate-vault-dial">
          <circle
            cx="80"
            cy="86"
            r="22"
            fill="#121f38"
            stroke="#60a5fa"
            strokeWidth="2.5"
          />
          <circle cx="80" cy="86" r="8" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" />
          <line
            x1="80"
            y1="86"
            x2="80"
            y2="70"
            stroke="#2dd4bf"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        <circle cx="44" cy="52" r="3" fill="rgba(148,163,184,0.45)" />
        <circle cx="116" cy="52" r="3" fill="rgba(148,163,184,0.45)" />
        <circle cx="44" cy="120" r="3" fill="rgba(148,163,184,0.45)" />
        <circle cx="116" cy="120" r="3" fill="rgba(148,163,184,0.45)" />
      </svg>
    </IconStage>
  )
}

/** FAQ — animated shield. */
export function OwnershipVisual() {
  return (
    <IconStage
      label="Shield icon"
      caption="Your key. Your files. Technical safeguards over empty promises."
    >
      <svg
        viewBox="0 0 160 160"
        className="h-[72%] w-[72%] overflow-visible animate-float-slow drop-shadow-[0_12px_40px_rgba(45,212,191,0.18)]"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="80"
          cy="89"
          r="72"
          className="animate-ring-pulse"
          stroke="rgba(45,212,191,0.28)"
          strokeWidth="1.5"
          fill="none"
        />
        <g transform="translate(80 89) scale(0.86) translate(-80 -89)">
          <path
            d="M80 28l48 18v34c0 34-22 60-48 70-26-10-48-36-48-70V46l48-18z"
            fill="#0e1830"
            stroke="#2dd4bf"
            strokeWidth="3.5"
            strokeLinejoin="round"
            className="animate-shield-breathe"
          />
          <path
            d="M58 84l16 16 30-36"
            stroke="#2dd4bf"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-check-draw"
          />
        </g>
      </svg>
    </IconStage>
  )
}
