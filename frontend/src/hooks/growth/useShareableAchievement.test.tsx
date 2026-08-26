// @vitest-environment jsdom
/** Hook de compartir logros con html-to-image mockeado (F3-CRECIMIENTO):
 *  flujo nativo → fallback de opciones visibles + descarga directa (F3-02),
 *  y captura del PNG con el override de estilo del clon (F3-01). */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toBlob } from 'html-to-image';
import { BADGES } from '../../data/badges';
import { CARD_SIZE } from '../../lib/shareAchievement';
import { useShareableAchievement } from './useShareableAchievement';

vi.mock('html-to-image', () => ({
  toBlob: vi.fn(async () => new Blob(['png'], { type: 'image/png' })),
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
    vi.mocked(toBlob).mockClear();
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

  it('genera el PNG y queda en fallback cuando no hay share nativo (sin descarga automática)', async () => {
    const serie = BADGES.find((s) => s.id === 'lecciones')!;
    const { result } = renderHook(() => useShareableAchievement(serie, 1, STATS));
    result.current.cardRef.current = document.createElement('div');

    let status: string;
    await act(async () => {
      status = await result.current.share();
    });

    expect(status!).toBe('fallback');
    expect(vi.mocked(toBlob)).toHaveBeenCalledWith(result.current.cardRef.current, {
      width: CARD_SIZE.width,
      height: CARD_SIZE.height,
      pixelRatio: CARD_SIZE.pixelRatio,
      style: expect.objectContaining({
        position: 'fixed',
        left: '0',
        top: '0',
        right: 'auto',
        bottom: 'auto',
        opacity: '1',
      }),
    });
    expect(result.current.pngUrl).toBeNull();
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
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
    const calls = shareSpy.mock.calls as unknown as Array<
      [{ files: File[]; title: string; text: string }]
    >;
    const file = calls[0][0].files[0];
    expect(file.name).toBe('finempoder-logro-racha.png');
    expect(file.type).toBe('image/png');
    expect(result.current.pngUrl).toBeNull();
  });

  it('si el share nativo falla, queda en fallback sin descarga automática', async () => {
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
    expect(result.current.pngUrl).toBeNull();
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
  });

  it('descarga directa: genera el PNG, crea blob URL y dispara a[download]', async () => {
    const serie = BADGES.find((s) => s.id === 'presupuesto')!;
    const { result } = renderHook(() => useShareableAchievement(serie, 1, STATS));
    result.current.cardRef.current = document.createElement('div');

    let status: string;
    await act(async () => {
      status = await result.current.download();
    });

    expect(status!).toBe('downloaded');
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(result.current.pngUrl).toBe('blob:mock');
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    const anchor = vi.mocked(HTMLAnchorElement.prototype.click).mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('finempoder-logro-presupuesto.png');
    expect(anchor.href).toBe('blob:mock');
  });

  it('descarga reutiliza el blob URL ya generado (no captura dos veces)', async () => {
    const serie = BADGES.find((s) => s.id === 'ahorro')!;
    const { result } = renderHook(() => useShareableAchievement(serie, 2, STATS));
    result.current.cardRef.current = document.createElement('div');

    await act(async () => {
      await result.current.download();
    });
    await act(async () => {
      await result.current.download();
    });

    expect(vi.mocked(toBlob)).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(2);
  });
});
