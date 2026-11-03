import { getTrackingConsent, isTrackingAllowed } from './trackingConsent'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: (...args: unknown[]) => void
  }
}

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim()

let booted = false
const trackedPaths = new Set<string>()

function ensureFbqStub(): void {
  if (typeof window === 'undefined' || window.fbq) return

  type FbqFn = ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void
    queue: unknown[][]
    loaded: boolean
    version: string
    push: (...args: unknown[]) => void
  }

  const fbq = function (...args: unknown[]) {
    const fn = fbq as FbqFn
    if (fn.callMethod) {
      fn.callMethod(...args)
    } else {
      fn.queue.push(args)
    }
  } as FbqFn

  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []
  window.fbq = fbq
  window._fbq = fbq
}

function loadPixelScript(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById('meta-pixel-script')) return

  const script = document.createElement('script')
  script.id = 'meta-pixel-script'
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)
}

/** Initialize Meta Pixel when configured. Respects opt-out consent. */
export function initMetaPixel(): void {
  if (!PIXEL_ID || booted || typeof window === 'undefined') return
  booted = true

  ensureFbqStub()
  loadPixelScript()

  const allowed = isTrackingAllowed()
  window.fbq?.('consent', allowed ? 'grant' : 'revoke')
  window.fbq?.('init', PIXEL_ID)

  if (allowed) {
    trackPageView(window.location.pathname + window.location.search)
  }
}

export function applyMetaConsent(allowed: boolean): void {
  if (!PIXEL_ID || typeof window === 'undefined') return
  initMetaPixel()
  window.fbq?.('consent', allowed ? 'grant' : 'revoke')
  if (!allowed) {
    trackedPaths.clear()
  }
}

export function trackPageView(path = window.location.pathname): void {
  if (!PIXEL_ID || !isTrackingAllowed()) return
  initMetaPixel()

  const key = path || '/'
  if (trackedPaths.has(key)) return
  trackedPaths.add(key)
  window.fbq?.('track', 'PageView')
}

export function trackLead(eventId: string): void {
  if (!PIXEL_ID || !isTrackingAllowed() || !eventId) return
  initMetaPixel()
  window.fbq?.('track', 'Lead', {}, { eventID: eventId })
}

export function createMetaEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function isMetaPixelConfigured(): boolean {
  return Boolean(PIXEL_ID)
}

/** Keep Pixel consent in sync if the visitor changes preference later. */
export function bindMetaConsentListener(): () => void {
  const onChange = (event: Event) => {
    const detail = (event as CustomEvent<string>).detail
    applyMetaConsent(detail !== 'denied')
  }
  window.addEventListener('ebonvaults:tracking-consent', onChange)
  // Re-check stored consent on boot for pages that mount after init
  applyMetaConsent(getTrackingConsent() !== 'denied')
  return () => {
    window.removeEventListener('ebonvaults:tracking-consent', onChange)
  }
}
