import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
