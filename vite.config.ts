import { copyFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { ROUTES } from './src/routing/routes'

const OUT_DIR = 'dist'

/**
 * GitHub Pages has no rewrites, so each page gets its own copy of index.html (served with a 200),
 * and 404.html is the app too, which renders the not-found page for any other path.
 */
function spaPages(): Plugin {
  return {
    name: 'spa-pages',
    apply: 'build',
    async closeBundle() {
      const index = join(OUT_DIR, 'index.html')
      for (const { path } of ROUTES) {
        if (path === '/') continue
        await mkdir(join(OUT_DIR, path), { recursive: true })
        await copyFile(index, join(OUT_DIR, path, 'index.html'))
      }
      await copyFile(index, join(OUT_DIR, '404.html'))
    },
  }
}

/** Pinned so it never collides with other local projects; 5173 belongs to library-walk. */
const DEV_PORT = 5174

export default defineConfig({
  plugins: [react(), spaPages()],
  base: '/',
  server: { port: DEV_PORT, strictPort: true },
  preview: { port: DEV_PORT, strictPort: true },
  build: {
    outDir: OUT_DIR,
    // three.js alone is ~560 kB and only downloads when the 3D demo opens; anything else this big should warn.
    chunkSizeWarningLimit: 600,
  },
})
