import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill navigator.onLine para jsdom
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  get: () => mockOnline,
});

let mockOnline = true;
export const setOnline = (v: boolean) => { mockOnline = v; };

// Stub window.addEventListener para evitar errores en SyncManager.init()
vi.stubGlobal('addEventListener', vi.fn());
