import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',  // '/binshad/' എന്നത് മാറ്റി '/' എന്ന് കൊടുക്കുക
  plugins: [react()],
  resolve: {
    // Force every package to use the same single copy of React
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
})