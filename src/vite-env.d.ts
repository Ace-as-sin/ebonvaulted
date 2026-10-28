/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_WAITLIST_ENDPOINT?: string
  readonly VITE_ANALYTICS_ENABLED?: string
  readonly VITE_ANALYTICS_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
