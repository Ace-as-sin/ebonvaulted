const STORAGE_KEY = 'ebonvaults_tracking_consent'

export type TrackingConsent = 'granted' | 'denied'

/** Opt-out model: tracking is allowed until the visitor declines. */
export function getTrackingConsent(): TrackingConsent {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'denied') return 'denied'
    if (value === 'granted') return 'granted'
  } catch {
    // private mode / blocked storage
  }
  return 'granted'
}

export function setTrackingConsent(value: TrackingConsent): void {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // ignore
  }
  window.dispatchEvent(
    new CustomEvent('ebonvaults:tracking-consent', { detail: value }),
  )
}

export function isTrackingAllowed(): boolean {
  return getTrackingConsent() === 'granted'
}
