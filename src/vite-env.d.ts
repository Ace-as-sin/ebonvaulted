/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_WAITLIST_ENDPOINT?: string
  readonly VITE_WAITLIST_HEALTH_ENDPOINT?: string
  readonly VITE_WAITLIST_LIVE_ENDPOINT?: string
  readonly VITE_ANALYTICS_ENABLED?: string
  readonly VITE_ANALYTICS_ENDPOINT?: string
  /** Meta Pixel ID (Events Manager dataset). Leave unset to disable Pixel. */
  readonly VITE_META_PIXEL_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
