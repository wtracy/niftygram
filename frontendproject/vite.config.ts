import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, {resolve} from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      entries: {
        "goldrush-kit": resolve(__dirname, '../../../../goldrush-kit/src')
      }
    }
  }
})
