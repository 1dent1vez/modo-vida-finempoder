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
    // Cada proceso recibe su propia fake IndexedDB. Esto evita contaminación
    // entre archivos y permite recuperar paralelismo sin compartir estado.
    pool: 'forks',
    maxWorkers: 4,
    // La instrumentación V8 puede triplicar el costo de las pruebas de UI.
    testTimeout: 15_000,
    setupFiles: ['./src/test/configure.ts'],
    include: ['test/**/*.test.ts', 'src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/db/**/*.{ts,tsx}',
        'src/lib/**/*.{ts,tsx}',
        'src/store/**/*.{ts,tsx}',
        'src/module-kit/**/*.{ts,tsx}',
        'src/shared/utils/**/*.{ts,tsx}',
      ],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/vite-env.d.ts'],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 72,
      },
    },
  },
});
