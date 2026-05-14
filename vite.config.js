import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In local development, Vite proxies /api/* to a local serverless function runner.
// In production on Vercel, files inside the /api directory are deployed as
// serverless functions automatically — no proxy needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
