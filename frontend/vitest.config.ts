import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    // Los tests de lógica pura viven en test/ (node). Los de componentes
    // (jsdom vía docblock // @vitest-environment jsdom) viven junto al
    // código en src/, como define la sección test de vite.config.ts.
    include: ['test/**/*.test.ts', 'src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
});
