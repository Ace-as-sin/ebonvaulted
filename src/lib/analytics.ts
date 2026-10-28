import type { AnalyticsEventMap, AnalyticsEventName } from '../types'

const ANALYTICS_ENABLED = import.meta.env.VITE_ANALYTICS_ENABLED === 'true'
const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined

const viewedSections = new Set<string>()
let formStarted = false

function getTrafficSource(): string {
  try {
    const params = new URLSearchParams(window.location.search)
    const utm = params.get('utm_source')
    if (utm) return utm
    const ref = document.referrer
    if (!ref) return 'direct'
    return new URL(ref).hostname
  } catch {
    return 'unknown'
  }
}

function emit<T extends AnalyticsEventName>(
  name: T,
  payload: AnalyticsEventMap[T],
): void {
  if (!ANALYTICS_ENABLED) {
    if (import.meta.env.DEV) {
      console.debug('[analytics]', name, payload)
    }
    return
  }

  const body = {
    name,
    payload,
    ts: new Date().toISOString(),
    path: window.location.pathname,
    source: getTrafficSource(),
  }

  if (!ANALYTICS_ENDPOINT) {
    if (import.meta.env.DEV) {
      console.debug('[analytics:local]', body)
    }
    return
  }

  const json = JSON.stringify(body)

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: 'application/json' })
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob)
      return
    }
  } catch {
    // fall through to fetch
  }

  void fetch(ANALYTICS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
    keepalive: true,
  }).catch(() => {
    // Analytics failures should never interrupt UX
  })
}

export const analytics = {
  track<T extends AnalyticsEventName>(name: T, payload: AnalyticsEventMap[T]) {
    emit(name, payload)
  },

  pageView(path = window.location.pathname) {
    emit('page_view', {
      path,
      referrer: document.referrer || undefined,
    })
  },

  pricingSectionView() {
    if (viewedSections.has('pricing')) return
    viewedSections.add('pricing')
    emit('pricing_section_view', { once: true })
  },

  waitlistFormStart(plan?: AnalyticsEventMap['waitlist_form_start']['plan']) {
    if (formStarted) return
    formStarted = true
    emit('waitlist_form_start', { plan })
  },

  resetSessionFlags() {
    viewedSections.clear()
    formStarted = false
  },
}
