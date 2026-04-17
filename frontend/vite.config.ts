import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    // Optimiza imágenes PNG/WebP en build time (reduce Logo.png y onb*.png)
    ViteImageOptimizer({
      png: { quality: 80 },
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { lossless: false, quality: 80 },
    }),
    // Genera .br (brotli) y .gz (gzip) para que el servidor los sirva
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png'
      ],
      manifest: {
        name: 'FinEmpoder',
        short_name: 'FinEmpoder',
        description: 'PWA de educación financiera gamificada para estudiantes del Instituto Tecnológico de Toluca',
        lang: 'es-MX',
        start_url: '/app',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#ff8a3d',
        background_color: '#ffffff',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}'],
        runtimeCaching: [
          {
            // Assets estáticos (JS, CSS, fonts) — cache-first tras precache
            urlPattern: /\.(?:js|css|woff2?|ttf|otf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'finempoder-static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              },
              cacheableResponse: { statuses: [200] }
            }
          },
          {
            // API FinEmpoder
            // Intercepta las llamadas que empiezan con /api/
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'finempoder-api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            // Navegación (rutas React)
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'finempoder-pages',
              networkTimeoutSeconds: 10
            }
          },
          {
            // Rutas clave para experiencia offline
            urlPattern: ({ url }) =>
              ['/app', '/app/presupuesto', '/app/ahorro', '/app/inversion', '/login', '/signup'].includes(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'finempoder-core-pages',
              cacheableResponse: { statuses: [200] }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,              // Permite acceso desde red local (móvil)
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000', // Backend express
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
