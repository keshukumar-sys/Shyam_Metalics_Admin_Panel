import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // This ensures all unknown routes fallback to index.html
    historyApiFallback: true
  }
})
