// @vitest-environment node
// Tests del wrapper analytics: sin clave todo es no-op y posthog-js nunca se
// importa; con clave se inicializa una sola vez y los eventos llegan con sus
// props. El módulo se recarga (vi.resetModules) para re-leer las env vars.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const posthogSpy = vi.hoisted(() => {
  const init = vi.fn();
  const identify = vi.fn();
  const capture = vi.fn();
  const reset = vi.fn();
  return {
    init,
    identify,
    capture,
    reset,
    state: { imports: 0 },
  };
});

vi.mock('posthog-js', () => {
  posthogSpy.state.imports += 1;
  return {
    default: {
      init: posthogSpy.init,
      identify: posthogSpy.identify,
      capture: posthogSpy.capture,
      reset: posthogSpy.reset,
    },
  };
});

// Instancia sin clave (env por defecto: VITE_POSTHOG_KEY undefined).
import { analyticsEnabled, EVENTOS, identify, track } from './analytics';

const EVENTOS_ESPERADOS = [
  'LESSON_STARTED',
  'LESSON_COMPLETED',
  'LESSON_RESUMED',
  'META_DAILY_COMPLETED',
  'STREAK_LOST',
  'ACHIEVEMENT_UNLOCKED',
  'SHARE_CLICKED',
  'NEWSLETTER_SUBSCRIBED',
  'LEAGUE_CREATED',
  'LEAGUE_JOINED',
  'LEAGUE_RANKING_VIEWED',
  'SIGNIN_MAGIC_LINK',
  'SIGNIN_GOOGLE',
];

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  posthogSpy.init.mockClear();
  posthogSpy.identify.mockClear();
  posthogSpy.capture.mockClear();
  posthogSpy.reset.mockClear();
});

describe('sin clave (VITE_POSTHOG_KEY undefined)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_POSTHOG_KEY', undefined);
    vi.stubEnv('VITE_ANALYTICS_DEBUG', undefined);
  });

  it('expone los 13 eventos del producto', () => {
    expect(Object.keys(EVENTOS).sort()).toEqual([...EVENTOS_ESPERADOS].sort());
  });

  it('analyticsEnabled es false', () => {
    expect(analyticsEnabled).toBe(false);
  });

  it('track no lanza con varios eventos y props random (incluye llamadas dobles)', () => {
    expect(() => {
      track(EVENTOS.LESSON_STARTED, { moduleId: 'ahorro', lessonId: 'L01' });
      track(EVENTOS.LESSON_COMPLETED, { moduleId: 'ahorro', lessonId: 'L01', xp: 100 });
      track(EVENTOS.LESSON_STARTED, { moduleId: 'ahorro', lessonId: 'L01' });
      track(EVENTOS.META_DAILY_COMPLETED, { goal: 'Regular', xp: 200 });
      track(EVENTOS.STREAK_LOST, { best: 7 });
      track(EVENTOS.ACHIEVEMENT_UNLOCKED, { serie: 'primeros-pasos', tier: 1 });
      track(EVENTOS.SHARE_CLICKED, { target: 'card' });
      track(EVENTOS.NEWSLETTER_SUBSCRIBED, { source: 'app' });
      track(EVENTOS.LEAGUE_CREATED, { metric: 'xp' });
      track(EVENTOS.LEAGUE_JOINED, { via: 'code' });
      track(EVENTOS.LEAGUE_RANKING_VIEWED);
      track(EVENTOS.SIGNIN_MAGIC_LINK);
      track(EVENTOS.SIGNIN_GOOGLE);
      track(EVENTOS.SIGNIN_GOOGLE);
    }).not.toThrow();
  });

  it('identify con y sin userId no lanza y no toca posthog', () => {
    expect(() => {
      identify('user-1');
      identify();
      identify(undefined);
    }).not.toThrow();
    expect(posthogSpy.init).not.toHaveBeenCalled();
    expect(posthogSpy.identify).not.toHaveBeenCalled();
    expect(posthogSpy.reset).not.toHaveBeenCalled();
  });

  it('posthog-js NUNCA se importa ni se inicializa', () => {
    track(EVENTOS.LESSON_STARTED, { moduleId: 'presupuesto', lessonId: 'L01' });
    track(EVENTOS.SIGNIN_MAGIC_LINK);
    expect(posthogSpy.state.imports).toBe(0);
    expect(posthogSpy.init).not.toHaveBeenCalled();
    expect(posthogSpy.capture).not.toHaveBeenCalled();
  });

  it('debug log visible con VITE_ANALYTICS_DEBUG=1 aunque no haya clave', () => {
    vi.stubEnv('VITE_ANALYTICS_DEBUG', '1');
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    track(EVENTOS.LESSON_STARTED, { moduleId: 'ahorro', lessonId: 'L03' });
    expect(info).toHaveBeenCalledWith('[analytics]', 'lesson_started', {
      moduleId: 'ahorro',
      lessonId: 'L03',
    });
  });
});

describe('con clave (VITE_POSTHOG_KEY phc_x)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_x');
    vi.stubEnv('VITE_ANALYTICS_DEBUG', undefined);
    vi.resetModules();
  });

  it('analyticsEnabled es true y init corre UNA sola vez con key y api_host', async () => {
    const analytics = await import('./analytics');
    expect(analytics.analyticsEnabled).toBe(true);

    analytics.track(analytics.EVENTOS.LESSON_STARTED, { moduleId: 'ahorro', lessonId: 'L01' });
    analytics.track(analytics.EVENTOS.LESSON_STARTED, { moduleId: 'ahorro', lessonId: 'L01' });

    await vi.waitFor(() => expect(posthogSpy.init).toHaveBeenCalledTimes(1));
    expect(posthogSpy.init).toHaveBeenCalledWith('phc_x', {
      api_host: 'https://us.i.posthog.com',
      persistence: 'localStorage+cookie',
    });
  });

  it('la captura llega con las props por evento', async () => {
    const analytics = await import('./analytics');
    analytics.track(analytics.EVENTOS.LESSON_COMPLETED, {
      moduleId: 'presupuesto',
      lessonId: 'L05',
      xp: 120,
    });
    analytics.track(analytics.EVENTOS.LEAGUE_JOINED, { via: 'code' });
    analytics.track(analytics.EVENTOS.SIGNIN_MAGIC_LINK);

    await vi.waitFor(() => {
      expect(posthogSpy.capture).toHaveBeenCalledWith('lesson_completed', {
        moduleId: 'presupuesto',
        lessonId: 'L05',
        xp: 120,
      });
      expect(posthogSpy.capture).toHaveBeenCalledWith('league_joined', { via: 'code' });
      expect(posthogSpy.capture).toHaveBeenCalledWith('signin_magic_link', {});
    });
  });

  it('identify con userId identifica; el mismo id no re-identifica; reset al cerrar', async () => {
    const analytics = await import('./analytics');
    analytics.identify('user-abc');
    await vi.waitFor(() => expect(posthogSpy.identify).toHaveBeenCalledWith('user-abc'));

    // F6-1 (dedupe): el mismo id repetido (TOKEN_REFRESHED) no re-identifica.
    analytics.identify('user-abc');
    await Promise.resolve();
    expect(posthogSpy.identify).toHaveBeenCalledTimes(1);

    // Otro id sí vuelve a identificar.
    analytics.identify('user-def');
    await vi.waitFor(() => expect(posthogSpy.identify).toHaveBeenCalledTimes(2));
    expect(posthogSpy.identify).toHaveBeenLastCalledWith('user-def');

    analytics.identify();
    await vi.waitFor(() => expect(posthogSpy.reset).toHaveBeenCalledTimes(1));

    // Sin usuario identificado: no-op, sin reset extra.
    analytics.identify(undefined);
    await Promise.resolve();
    expect(posthogSpy.reset).toHaveBeenCalledTimes(1);
  });

  it('debug log visible con VITE_ANALYTICS_DEBUG=1 y clave', async () => {
    vi.stubEnv('VITE_ANALYTICS_DEBUG', '1');
    const analytics = await import('./analytics');
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    analytics.track(analytics.EVENTOS.STREAK_LOST, { best: 5 });

    expect(info).toHaveBeenCalledWith('[analytics]', 'streak_lost', { best: 5 });
    await vi.waitFor(() => expect(posthogSpy.init).toHaveBeenCalledTimes(1));
  });
});
