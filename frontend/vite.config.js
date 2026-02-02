import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    allowedHosts: ["enterprising-teri-symbiotically.ngrok-free.dev", "localhost"],
    hmr: {
      host: "enterprising-teri-symbiotically.ngrok-free.dev",
      protocol: "wss",
    },
  },
})
