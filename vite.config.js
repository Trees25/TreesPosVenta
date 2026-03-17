import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  externals: {
    pdfmake: 'pdfMake'
  },
  build: {
    rollupOptions: {
      external: ['pdfmake'],
    },
  },
  server: {
    allowedHosts: [
      'ze16ku-ip-181-21-139-68.tunnelmole.net',
      '.tunnelmole.net' // Para permitir cualquier host de tunnelmole
    ]
  },
})
