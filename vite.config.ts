import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'og-image.svg'],
      manifest: {
        name: 'Ebon Vaults',
        short_name: 'Ebon Vaults',
        description:
          'Private, encrypted cloud storage and backup. No AI training. No advertising profiles.',
        theme_color: '#060a12',
        background_color: '#060a12',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['productivity', 'utilities'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) return 'react-dom'
          if (id.includes('node_modules/react-router')) return 'react-router'
          if (id.includes('node_modules/react/')) return 'react'
          if (id.includes('node_modules/lucide-react')) return 'lucide'
        },
      },
    },
  },
  server: {
    // Bind IPv4 + IPv6 so both http://127.0.0.1:5173 and http://localhost:5173 work.
    host: true,
    proxy: {
      // Dev-only: Windows SSH tunnel to the Ubuntu Fastify API (127.0.0.1:8788).
      // Production uses VITE_STORAGE_API_BASE (e.g. https://storage-api.ebonvaults.com).
      '/api': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
