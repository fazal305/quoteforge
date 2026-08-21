import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Dev-only: forwards to `netlify functions:serve` (see root
      // package.json `functions:serve` script), which honors each
      // function's `config.path` directly. Production doesn't use this —
      // Netlify's own redirect in netlify.toml handles /api/* there.
      '/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
      },
    },
  },
})
