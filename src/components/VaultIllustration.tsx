/** Decorative SVG of a secure vault / file stack — CSS-friendly, no stock imagery. */
export function VaultIllustration() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[420px]"
      aria-hidden="true"
    >
      <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-teal-400/10 via-blue-500/5 to-transparent blur-2xl" />

      <svg
        viewBox="0 0 420 420"
        className="relative h-full w-full drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>Illustration of encrypted files secured in a vault</title>

        <rect
          x="48"
          y="56"
          width="324"
          height="308"
          rx="28"
          fill="#0e1830"
          stroke="url(#frameStroke)"
          strokeWidth="1.5"
        />
        <rect
          x="64"
          y="72"
          width="292"
          height="276"
          rx="22"
          fill="#0a1220"
          stroke="rgba(148,163,184,0.12)"
        />

        <rect x="88" y="96" width="244" height="36" rx="10" fill="#121f38" />
        <circle cx="108" cy="114" r="5" fill="#2dd4bf" opacity="0.85" />
        <rect
          x="124"
          y="108"
          width="96"
          height="12"
          rx="4"
          fill="rgba(148,163,184,0.25)"
        />

        <g>
          <rect
            x="96"
            y="156"
            width="228"
            height="52"
            rx="12"
            fill="#121f38"
            stroke="rgba(45,212,191,0.2)"
          />
          <rect
            x="112"
            y="170"
            width="28"
            height="24"
            rx="6"
            fill="rgba(45,212,191,0.15)"
            stroke="rgba(45,212,191,0.45)"
          />
          <rect
            x="152"
            y="172"
            width="120"
            height="8"
            rx="3"
            fill="rgba(244,247,251,0.55)"
          />
          <rect
            x="152"
            y="186"
            width="72"
            height="6"
            rx="3"
            fill="rgba(148,163,184,0.35)"
          />
        </g>

        <g opacity="0.85">
          <rect
            x="96"
            y="222"
            width="228"
            height="52"
            rx="12"
            fill="#121f38"
            stroke="rgba(96,165,250,0.18)"
          />
          <rect
            x="112"
            y="236"
            width="28"
            height="24"
            rx="6"
            fill="rgba(96,165,250,0.12)"
            stroke="rgba(96,165,250,0.4)"
          />
          <rect
            x="152"
            y="238"
            width="100"
            height="8"
            rx="3"
            fill="rgba(244,247,251,0.45)"
          />
          <rect
            x="152"
            y="252"
            width="64"
            height="6"
            rx="3"
            fill="rgba(148,163,184,0.3)"
          />
        </g>

        <g opacity="0.65">
          <rect
            x="96"
            y="288"
            width="228"
            height="40"
            rx="12"
            fill="#121f38"
            stroke="rgba(148,163,184,0.12)"
          />
          <rect
            x="112"
            y="300"
            width="20"
            height="16"
            rx="4"
            fill="rgba(148,163,184,0.12)"
          />
          <rect
            x="144"
            y="304"
            width="88"
            height="8"
            rx="3"
            fill="rgba(148,163,184,0.28)"
          />
        </g>

        <g transform="translate(300 118)">
          <circle
            cx="28"
            cy="28"
            r="28"
            fill="#0e1830"
            stroke="rgba(45,212,191,0.45)"
            strokeWidth="1.5"
          />
          <path
            d="M20 26v-4a8 8 0 1 1 16 0v4"
            stroke="#2dd4bf"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect
            x="18"
            y="26"
            width="20"
            height="16"
            rx="3"
            fill="rgba(45,212,191,0.15)"
            stroke="#2dd4bf"
            strokeWidth="1.5"
          />
          <circle cx="28" cy="33" r="2" fill="#2dd4bf" />
        </g>

        <circle cx="90" cy="340" r="40" fill="rgba(45,212,191,0.08)" />
        <circle cx="340" cy="80" r="50" fill="rgba(59,130,246,0.08)" />

        <defs>
          <linearGradient id="frameStroke" x1="48" y1="56" x2="372" y2="364">
            <stop stopColor="#2dd4bf" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#60a5fa" stopOpacity="0.25" />
            <stop offset="1" stopColor="#2dd4bf" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
