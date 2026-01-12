// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optional: resolve path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // Optional: server configuration for development
  server: {
    port: 5173, // change if needed
    open: true, // open browser automatically
  },

  // Optional: build configuration for production
  build: {
    outDir: 'dist', // default is 'dist'
    sourcemap: true, // optional, generate source maps
  },
});
