import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cspPlugin } from './cspPlugin.js'
import { resolveApiBaseUrl } from './src/api/apiBaseUrl.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages serves a project site from /<repo-name>/. CI sets BASE_PATH;
  // local dev and other hosts default to the root.
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    cspPlugin({ apiBaseUrl: resolveApiBaseUrl(loadEnv(mode, process.cwd())) }),
  ],
}))
