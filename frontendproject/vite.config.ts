import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, {resolve} from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    cssMinify: true,
    minify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app.html')
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
    }
  }
})
