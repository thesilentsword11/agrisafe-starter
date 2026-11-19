import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/agrisafe-starter/',
  server: { port: 5173 }
})
