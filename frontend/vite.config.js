import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    port: 5175,
    https: true,

    // ✅ SAME-ORIGIN SETUP (NO CORS)
    proxy: {
      '/problems': {
        target: 'https://mostly-postfemoral-xenia.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/submissions': {
        target: 'https://mostly-postfemoral-xenia.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'https://mostly-postfemoral-xenia.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
