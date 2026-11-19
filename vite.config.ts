import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/ws-grocery': {
        target: 'http://localhost:8080',
        ws: true,
      },
      '/images': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
    }
  }
})