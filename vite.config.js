import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  build: {
    lib: {
      entry: 'src/header-webcomponent.jsx',
      name: 'CustomHeader',
      fileName: () => 'header-webcomponent.js',
      formats: ['iife']
    },
    outDir: 'public',
    emptyOutDir: false,
    minify: 'terser',
    rollupOptions: {
      external: [],
    },
  },
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  }
})
