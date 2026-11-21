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
  /**
   * Absolute origin for the Ubuntu storage API in production.
   * Example: https://storage-api.ebonvaults.com
   * Leave empty in local dev to use the Vite `/api` proxy → 127.0.0.1:8788.
   */
  readonly VITE_STORAGE_API_BASE?: string
  /**
   * When `true` in Vite DEV only, use labeled mock auth/storage data.
   * Ignored (always off) in production builds.
   */
  readonly VITE_STORAGE_USE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
