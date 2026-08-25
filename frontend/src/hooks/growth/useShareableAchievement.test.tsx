// @vitest-environment jsdom
/** Hook de compartir logros con html-to-image mockeado (F3-CRECIMIENTO):
 *  flujo nativo → fallback de descarga + mensaje limpio para wa.me. */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toPng } from 'html-to-image';
import { BADGES } from '../../data/badges';
import { useShareableAchievement } from './useShareableAchievement';

vi.mock('html-to-image', () => ({
  toPng: vi.fn(async () => 'data:image/png;base64,AAAA'),
}));

const STATS = {
  totalCompleted: 12,
  presupuestoProgress: 40,
  ahorroProgress: 40,
  inversionProgress: 0,
  streakBest: 1,
  streakCurrent: 1,
};

const EMOJI_RE = /[\p{Extended_Pictographic}\u{FE0F}]/u;
const LONG_DASH_RE = /[—–]/;

describe('useShareableAchievement', () => {
  beforeEach(() => {
    vi.mocked(toPng).mockClear();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ blob: async () => new Blob(['png'], { type: 'image/png' }) })),
    );
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:mock'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('genera el PNG y cae al fallback cuando no hay share nativo', async () => {
    const serie = BADGES.find((s) => s.id === 'lecciones')!;
    const { result } = renderHook(() => useShareableAchievement(serie, 1, STATS));
    result.current.cardRef.current = document.createElement('div');

    let status: string;
    await act(async () => {
      status = await result.current.share();
    });

    expect(status!).toBe('fallback');
    expect(vi.mocked(toPng)).toHaveBeenCalledWith(result.current.cardRef.current, {
      width: 1080,
      height: 1080,
      pixelRatio: 1,
    });
    expect(result.current.pngUrl).toBe('blob:mock');
    expect(result.current.message).toContain('Lecciones completadas · Bronce');
    expect(result.current.message).not.toMatch(EMOJI_RE);
    expect(result.current.message).not.toMatch(LONG_DASH_RE);
  });

  it('usa el share nativo cuando el dispositivo lo soporta', async () => {
    const shareSpy = vi.fn(async () => {});
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: shareSpy });

    const serie = BADGES.find((s) => s.id === 'racha')!;
    const { result } = renderHook(() => useShareableAchievement(serie, 2, STATS));
    result.current.cardRef.current = document.createElement('div');

    let status: string;
    await act(async () => {
      status = await result.current.share();
    });

    expect(status!).toBe('shared');
    expect(shareSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [expect.any(File)],
        title: result.current.message,
        text: result.current.message,
      }),
    );
    expect(result.current.pngUrl).toBeNull();
  });

  it('si el share nativo falla, cae al fallback de descarga', async () => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn(async () => {
        throw new DOMException('Permission denied', 'NotAllowedError');
      }),
    });

    const serie = BADGES.find((s) => s.id === 'presupuesto')!;
    const { result } = renderHook(() => useShareableAchievement(serie, 3, STATS));
    result.current.cardRef.current = document.createElement('div');

    let status: string;
    await act(async () => {
      status = await result.current.share();
    });

    expect(status!).toBe('fallback');
    expect(result.current.pngUrl).toBe('blob:mock');
  });
});
