import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves a project site from /<repo-name>/. CI sets BASE_PATH;
  // local dev and other hosts default to the root.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
