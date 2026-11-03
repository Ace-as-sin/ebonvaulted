import { useEffect, useState } from 'react'
import { setTrackingConsent, type TrackingConsent } from '../lib/trackingConsent'
import { isMetaPixelConfigured } from '../lib/metaPixel'

/**
 * Opt-out banner: ads/measurement cookies are on until the visitor declines.
 * Hidden when Meta Pixel is not configured.
 */
export function TrackingConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isMetaPixelConfigured()) return
    try {
      const stored = localStorage.getItem('ebonvaults_tracking_consent')
      // Show once until the visitor makes an explicit choice.
      if (stored !== 'granted' && stored !== 'denied') {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const choose = (value: TrackingConsent) => {
    setTrackingConsent(value)
    setVisible(false)
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-navy-950/95 px-4 py-4 shadow-2xl shadow-navy-950/50 backdrop-blur-md sm:px-6"
      role="dialog"
      aria-label="Measurement cookies"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          We use Meta Pixel to measure ads and waitlist conversions. No email or
          form answers are sent to Meta. You can turn this off anytime.
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="rounded-xl border border-line-strong bg-white/5 px-4 py-2 text-sm font-semibold text-ink transition hover:border-teal-400/40"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:brightness-110"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
