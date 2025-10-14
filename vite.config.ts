import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { Buffer } from 'buffer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: 'buffer',
      stream: 'stream-browserify',
    },
  },
  define: {
    'global': 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})

