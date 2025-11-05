import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { 
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
          'xlsx': ['xlsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
    sourcemap: false // Disable sourcemaps for smaller build size
  },
  server: { 
    historyApiFallback: true 
  }
})



