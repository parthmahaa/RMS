import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [
    react(),
  tailwindcss(),
],
  resolve: {
    alias: {
      '@Components': './src/Components',
      '@Utils': './src/utils',
      '@Pages': './src/Pages',
      '@Types': './src/Types',
      '@Store': './src/Store',
      '@Stores': './src/Stores',
    },
  },
})