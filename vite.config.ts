import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      }
    ],
    extensions: ['.msj', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    host: 'localhost',
    port: 80
  }
})
