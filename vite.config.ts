import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Deployed as a GitHub Pages *project* site, which serves from
  // /<repo>/ rather than the domain root. Everything that points at an
  // asset — index.html, the manifest, the service worker — has to agree
  // with this value, so it is the single place the deploy path is written.
  base: '/aquaen-web/',
  plugins: [react()],
})
