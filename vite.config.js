import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Adjust base to new repository name for GitHub Pages deployment
export default defineConfig({
  base: '/StateRollout/',
  build: {
    outDir: 'docs'
  },
  plugins: [react()],
})
