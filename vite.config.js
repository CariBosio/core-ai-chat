import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Esto es lo que permite que el túnel llegue sin error 400
    allowedHosts: true, 
    host: '0.0.0.0',
    port: 5173
  }
})

