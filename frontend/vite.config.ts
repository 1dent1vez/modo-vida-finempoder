import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    // MDX must come before react() so JSX transform applies correctly
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }) },
    react(),
    tailwindcss(),
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
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'FinEmpoder',
        short_name: 'FinEmpoder',
        description:
          'PWA de educación financiera gamificada para estudiantes del Instituto Tecnológico de Toluca',
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
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}'],
        runtimeCaching: [
          {
            // Paid content and membership responses must never enter the PWA cache.
            urlPattern: ({ url }) => /\/(?:api\/)?newsletter(?:\/|$)/.test(url.pathname),
            handler: 'NetworkOnly',
          },
          {
            // Assets estáticos (JS, CSS, fonts) — cache-first tras precache
            urlPattern: /\.(?:js|css|woff2?|ttf|otf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'finempoder-static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Las respuestas de API pueden contener datos personales. Nunca se
            // guardan en Cache Storage ni se comparten entre sesiones del equipo.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
          {
            // Navegación (rutas React)
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'finempoder-pages',
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Rutas clave para experiencia offline
            urlPattern: ({ url }) =>
              [
                '/app',
                '/app/presupuesto',
                '/app/ahorro',
                '/app/inversion',
                '/login',
                '/signup',
              ].includes(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'finempoder-core-pages',
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-dexie': ['dexie'],
          'vendor-ui': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
  server: {
    host: true, // Permite acceso desde red local (móvil)
    port: 5173,
    allowedHosts: true, // Permite hosts del túnel (cloudflared) en dev; solo afecta dev server
    proxy: {
      '/api': {
        target: process.env.LOCAL_API_TARGET ?? 'http://127.0.0.1:4000', // Backend express
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.LOCAL_API_TARGET ?? 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
