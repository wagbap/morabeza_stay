import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    proxy: {
      '/api': {
        target: 'https://welovepalop.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://welovepalop.com/api'
        : '/api'
    )
  }
})