// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

// F5-PROMESAS: compuerta para pausar persistCompletion en el await de
// setCompleted y poder desmontar ANTES de que termine (escenario de Lupa).
const persistGate = vi.hoisted(() => {
  let resolveFn: (() => void) | null = null;
  return {
    hold(): Promise<void> {
      return new Promise<void>((resolve) => {
        resolveFn = resolve;
      });
    },
    open(): void {
      resolveFn?.();
      resolveFn = null;
    },
    reset(): void {
      resolveFn = null;
    },
  };
});

vi.mock('../../db/lessonProgress.repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../db/lessonProgress.repository')>();
  const realRepo = actual.lessonProgressRepository;
  const realSetCompleted = realRepo.setCompleted.bind(realRepo);
  return {
    ...actual,
    lessonProgressRepository: {
      ...realRepo,
      // Por defecto delega en la implementación real; la prueba H1 la
      // reemplaza puntualmente con la compuerta vía mockImplementationOnce.
      setCompleted: vi.fn((...args: Parameters<typeof realSetCompleted>) =>
        realSetCompleted(...args)
      ),
    },
  };
});

import confetti from 'canvas-confetti';
import { db } from '../../db/finempoderDb';
import { lessonProgressRepository } from '../../db/lessonProgress.repository';
import { useAuth } from '../../store/auth';
import { useLessons } from '../../store/lessons';
import { useProgress } from '../../store/progress';
import type { ModuleFlowConfig } from '../moduleFlow';
import { LessonShell, type LessonShellProps } from './LessonShell';
import { COMPLETION_MESSAGES } from './lessonCompletionMessages';

const confettiMock = confetti as unknown as ReturnType<typeof vi.fn>;

const TEST_CONFIG: ModuleFlowConfig = {
  moduleId: 'presupuesto',
  lessonPathPrefix: '/app/presupuesto/lesson',
  overviewPath: '/app/presupuesto',
  lessons: [
    { id: 'L01', title: 'Lección uno', kind: 'content' },
    { id: 'L02', title: 'Lección dos', kind: 'content' },
  ],
};

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderShell(props: Partial<LessonShellProps> = {}) {
  return render(
    <MemoryRouter>
      <LessonShell
        moduleId="presupuesto"
        config={TEST_CONFIG}
        id="L01"
        title="Lección de prueba"
        completion={{ ready: true, score: 120 }}
        {...props}
      >
        <p>Contenido de la lección</p>
      </LessonShell>
    </MemoryRouter>
  );
}

beforeEach(async () => {
  vi.clearAllMocks();
  persistGate.reset();
  // El flujo de completar lección emite console.info al final de una cadena
  // async que puede resolverse DESPUÉS del afterEach; en suites paralelas eso
  // llega al teardown del worker como "onUserConsoleLog pending" (race de
  // vitest, no falla aserciones). El spy queda instalado toda la vida del
  // archivo para silenciar también ese log post-test.
  vi.spyOn(console, 'info').mockImplementation(() => {});
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await db.lessonProgress.clear();
  await db.userLessonData.clear();
});

afterEach(() => {
  cleanup();
});

describe('LessonShell — celebración al completar', () => {
  it('dispara confetti y anima el XP hasta el score al completar', async () => {
    mockMatchMedia(false);
    renderShell();

    await waitFor(() => expect(confettiMock).toHaveBeenCalledTimes(1));
    expect(confettiMock).toHaveBeenCalledWith(
      expect.objectContaining({ particleCount: 120, spread: 70, origin: { y: 0.7 } })
    );

    await waitFor(
      () => expect(screen.getByTestId('xp-counter')).toHaveTextContent('+120 XP'),
      { timeout: 3000 }
    );
    expect(screen.getByTestId('xp-float')).toBeInTheDocument();
  });

  it('respeta prefers-reduced-motion: sin confetti y XP estático directo', async () => {
    mockMatchMedia(true);
    renderShell();

    await waitFor(() => expect(screen.getByTestId('xp-counter')).toHaveTextContent('+120 XP'));
    expect(confettiMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId('xp-float')).not.toBeInTheDocument();
  });

  it('muestra un mensaje de Finni de la lista de celebración y mantiene la info de desbloqueo', async () => {
    mockMatchMedia(true);
    renderShell();

    await waitFor(() => expect(screen.getByText('Lección completada')).toBeInTheDocument());
    const status = screen.getByRole('status');
    const message = status.querySelector('p')?.textContent ?? '';
    expect(COMPLETION_MESSAGES).toContain(message);
    expect(screen.getByText(/Desbloqueaste L02/)).toBeInTheDocument();
  });

  it('H1: sin unhandled rejection ni setState tras unmount si persistCompletion termina después', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => {
      unhandled.push(reason);
    };
    process.on('unhandledRejection', onUnhandled);
    const setCompletedMock = vi.mocked(lessonProgressRepository.setCompleted);
    setCompletedMock.mockImplementationOnce(() => persistGate.hold());

    try {
      mockMatchMedia(true);
      const { unmount } = renderShell();

      // Espera a que persistCompletion arranque y quede detenido en el await
      // de setCompleted (compuerta), antes de desmontar.
      await waitFor(() => expect(setCompletedMock).toHaveBeenCalled());

      unmount(); // desmontar ANTES de que termine persistCompletion
      persistGate.open(); // deja continuar la cadena async restante

      // Flush: resuelve toda la cadena pendiente (Dexie real + finally).
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(unhandled).toHaveLength(0);
      // Ni la cadena de persistencia ni React deben haber reportado nada por
      // console.error (p.ej. setState sobre componente desmontado / act).
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    } finally {
      process.removeListener('unhandledRejection', onUnhandled);
      consoleErrorSpy.mockRestore();
    }
  });
});
