import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/frankfurter': {
        target: 'https://api.frankfurter.app',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/frankfurter/, ''),
      },
      '/api/coincap': {
        target: 'https://api.coincap.io/v2',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/coincap/, ''),
      },
    },
  },
})
