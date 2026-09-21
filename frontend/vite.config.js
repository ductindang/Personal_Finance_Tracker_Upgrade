import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Chuyển tiếp các request gọi API (/api/...) sang cổng 5051
      // Chuyển tiếp các request gọi API
      '/api': {
        target: 'https://personal.finance.backend.com.vn',
        // target: 'http://localhost:5051',
        changeOrigin: true,
        secure: false,
      },
      // Chuyển tiếp các request gọi Account (/Account/...) sang cổng 5051
      // Chuyển tiếp các request gọi Account (Login Google, Logout,...)
      '/Account': {
        target: 'https://personal.finance.backend.com.vn',
        // target: 'http://localhost:5051',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})