import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  preview: {
    port: 4174,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg', 'icons/*.ico'],
      manifest: {
        name: 'Organ Systems',
        short_name: 'OrganSys',
        description: 'Interactive educational app about 5 human organ systems',
        theme_color: '#1e3a8a',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 60 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,glb}'],
        runtimeCaching: [
          {
            urlPattern: /\.glb$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'glb-models',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' }
          }
        ]
      }
    })
  ]
})