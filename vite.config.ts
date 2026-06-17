import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CRA -> Vite. outDir 'build' keeps the deploy step (copy frontend/build ->
// backend/api/static) unchanged. Dev server on 3000 (CRA default).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
  },
})
