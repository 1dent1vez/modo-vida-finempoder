import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'pilot-html-fallback',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, _res, next) => {
            if (req.url?.split('?')[0] === '/index.html') req.url = '/piloto.html';
            next();
          });
        };
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5174, strictPort: true },
  build: { outDir: 'dist-pilot', rollupOptions: { input: 'piloto.html' } },
  test: { environment: 'jsdom', include: ['src/prototypes/lessons/*.test.tsx'] },
});
