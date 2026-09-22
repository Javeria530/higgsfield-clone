import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: 'frontend',
  envDir: '..',
  publicDir: '../public',
  build: {
    outDir: '../dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend'),
      '@components': path.resolve(__dirname, './frontend/components'),
      '@views': path.resolve(__dirname, './frontend/views'),
      '@utils': path.resolve(__dirname, './frontend/utils'),
      '@context': path.resolve(__dirname, './frontend/context'),
      '@hooks': path.resolve(__dirname, './frontend/hooks'),
      '@services': path.resolve(__dirname, './frontend/services'),
      '@styles': path.resolve(__dirname, './frontend/styles'),
      '@assets': path.resolve(__dirname, './frontend/assets'),
    },
  },
})
