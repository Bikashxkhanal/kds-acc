import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        // This is the local Express API only; Express connects to the configured
        // remote MongoDB URI from bs/.env.
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
