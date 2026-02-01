import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok-free.dev',
      '.ngrok.io'
    ],
    proxy: {
      '/apples': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/orders': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/content': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/upload': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
