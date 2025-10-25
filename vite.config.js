// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 💡 AJOUTEZ CE BLOC :
  server: {
    watch: {
      usePolling: true, // Ceci résout les problèmes HMR sur les systèmes de fichiers non natifs (WSL, VM, Docker, etc.)
    }
  }
});