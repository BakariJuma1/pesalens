import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/analyze': 'https://pesalens-ghto.onrender.com',
      '/health': 'https://pesalens-ghto.onrender.com',
      '/debug-pdf': 'https://pesalens-ghto.onrender.com',
    },
  },
})
