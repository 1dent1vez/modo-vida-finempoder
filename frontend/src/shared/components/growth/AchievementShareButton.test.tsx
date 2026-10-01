// @vitest-environment jsdom
/** Botón de compartir logros (F3-02): la acción SIEMPRE está disponible;
 *  sin navigator.share las opciones (Descargar/WhatsApp/Copiar) quedan
 *  visibles de inmediato y la descarga directa no espera al share nativo. */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BADGES, type BadgeStats } from '../../../data/badges';
import { AchievementShareButton } from './AchievementShareButton';

vi.mock('html-to-image', () => ({
  toBlob: vi.fn(async () => new Blob(['png'], { type: 'image/png' })),
}));

const STATS: BadgeStats = {
  totalCompleted: 12,
  presupuestoProgress: 40,
  ahorroProgress: 40,
  inversionProgress: 0,
  streakBest: 1,
  streakCurrent: 1,
};

const serie = BADGES.find((s) => s.id === 'presupuesto')!;

/** Quita navigator.share/canShare para simular desktop sin Web Share API. */
function deleteWebShare() {
  delete (navigator as unknown as Record<string, unknown>).share;
  delete (navigator as unknown as Record<string, unknown>).canShare;
}

function openPopover() {
  fireEvent.click(screen.getByRole('button', { name: 'Compartir logro Presupuestación' }));
}

describe('AchievementShareButton', () => {
  beforeEach(() => {
    deleteWebShare();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:mock'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.spyOn(window, 'open').mockImplementation(() => null);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn(async () => {}) },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('SIN navigator.share el botón "Compartir logro" existe y el popover muestra las opciones', () => {
    render(<AchievementShareButton serie={serie} nivel={1} stats={STATS} />);

    expect(screen.getByRole('button', { name: 'Compartir logro Presupuestación' })).toBeVisible();

    openPopover();
    expect(screen.getByRole('button', { name: 'Descargar imagen' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Enviar por WhatsApp' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Copiar mensaje' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /^Compartir$/ })).not.toBeInTheDocument();
  });

  it('CON navigator.share el popover muestra el botón primario "Compartir"', async () => {
    const shareSpy = vi.fn(async () => {});
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: shareSpy });

    render(<AchievementShareButton serie={serie} nivel={1} stats={STATS} />);
    openPopover();

    const nativeButton = screen.getByRole('button', { name: /^Compartir$/ });
    expect(nativeButton).toBeVisible();
    await act(async () => {
      fireEvent.click(nativeButton);
    });
    expect(shareSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [expect.any(File)],
        text: expect.stringContaining('Presupuestación · Bronce'),
      }),
    );
  });

  it('si el share nativo falla, las opciones siguen visibles y la descarga responde', async () => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn(async () => {
        throw new DOMException('AbortError');
      }),
    });

    render(<AchievementShareButton serie={serie} nivel={1} stats={STATS} />);
    openPopover();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Compartir$/ }));
    });
    expect(screen.queryByText('No se pudo generar la imagen.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descargar imagen' })).toBeVisible();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Descargar imagen' }));
    });
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(screen.getByText('La imagen del logro se descargó.')).toBeVisible();
  });

  it('Descargar imagen sin share: a[download] con blob URL y nombre correcto', async () => {
    render(<AchievementShareButton serie={serie} nivel={1} stats={STATS} />);
    openPopover();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Descargar imagen' }));
    });

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    const anchor = vi.mocked(HTMLAnchorElement.prototype.click).mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('finempoder-logro-presupuesto.png');
    expect(anchor.href).toBe('blob:mock');
    expect(screen.getByText('La imagen del logro se descargó.')).toBeVisible();
  });

  it('Enviar por WhatsApp sin share abre wa.me con el mensaje codificado', async () => {
    render(<AchievementShareButton serie={serie} nivel={1} stats={STATS} />);
    openPopover();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }));

    expect(window.open).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/wa\.me\/\?text=/),
      '_blank',
      'noopener,noreferrer',
    );
    const url = vi.mocked(window.open).mock.calls[0][0] as string;
    expect(decodeURIComponent(url.split('text=')[1])).toContain('Presupuestación · Bronce');
  });

  it('Copiar mensaje sin share usa clipboard y muestra "Mensaje copiado"', async () => {
    render(<AchievementShareButton serie={serie} nivel={1} stats={STATS} />);
    openPopover();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copiar mensaje' }));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Presupuestación · Bronce'),
    );
    expect(screen.getByRole('button', { name: 'Mensaje copiado' })).toBeVisible();
  });
});
