// FinEmpoder — Wrapper de analytics con adaptador PostHog opcional.
// Sin VITE_POSTHOG_KEY todo es no-op: posthog-js NUNCA se importa (el import
// dinámico solo corre con clave), analyticsEnabled es false y no sale ningún
// payload. track()/identify() nunca lanzan (try/catch total).

export const EVENTOS = {
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  LESSON_RESUMED: 'lesson_resumed',
  META_DAILY_COMPLETED: 'meta_daily_completed',
  STREAK_LOST: 'streak_lost',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  SHARE_CLICKED: 'share_clicked',
  NEWSLETTER_SUBSCRIBED: 'newsletter_subscribed',
  LEAGUE_CREATED: 'league_created',
  LEAGUE_JOINED: 'league_joined',
  LEAGUE_RANKING_VIEWED: 'league_ranking_viewed',
  SIGNIN_MAGIC_LINK: 'signin_magic_link',
  SIGNIN_GOOGLE: 'signin_google',
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP: 'onboarding_step',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

/** Evento de producto (valores de EVENTOS, p.ej. 'lesson_started'). */
export type AnalyticsEvent = (typeof EVENTOS)[keyof typeof EVENTOS];

/** Props tipadas por evento (llave = valor del evento). */
export type AnalyticsProps = {
  lesson_started: { moduleId: string; lessonId: string };
  lesson_completed: { moduleId: string; lessonId: string; xp: number };
  lesson_resumed: { moduleId: string; lessonId: string };
  meta_daily_completed: { goal: string; xp: number };
  streak_lost: { best: number };
  achievement_unlocked: { serie: string; tier: number };
  share_clicked: { target: 'card' | 'list' };
  newsletter_subscribed: { source: 'app' };
  league_created: { metric: string };
  league_joined: { via: 'code' };
  league_ranking_viewed: undefined;
  signin_magic_link: undefined;
  signin_google: undefined;
  onboarding_started: undefined;
  onboarding_step: { step: 1 | 2 | 3 };
  onboarding_completed: undefined;
};

const ANALYTICS_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

/** true solo si hay clave de PostHog configurada. */
export const analyticsEnabled = Boolean(ANALYTICS_KEY);

type PosthogLike = {
  init: (key: string, options: { api_host: string; persistence: string }) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string) => void;
  reset: () => void;
};

let posthogRef: PosthogLike | null = null;
let initPromise: Promise<void> | null = null;
let identified = false;

/** Importa e inicializa posthog-js UNA sola vez (guard idempotente). */
function ensurePostHog(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(ANALYTICS_KEY as string, {
        api_host: 'https://us.i.posthog.com',
        persistence: 'localStorage+cookie',
      });
      posthogRef = posthog as unknown as PosthogLike;
    })
    .catch((err: unknown) => {
      // Si el chunk falla al cargar, el siguiente track reintenta.
      initPromise = null;
      throw err;
    });
  return initPromise;
}

/**
 * Emite un evento de producto. Sin clave solo loguea en debug; con clave
 * inicializa PostHog bajo demanda y captura. Nunca lanza.
 */
export function track<E extends AnalyticsEvent>(
  event: E,
  ...props: AnalyticsProps[E] extends undefined ? [] : [props: AnalyticsProps[E]]
): void {
  const eventProps = props[0];
  try {
    if (import.meta.env.VITE_ANALYTICS_DEBUG === '1') {
      console.info('[analytics]', event, eventProps);
    }
    if (!analyticsEnabled) return;
    void ensurePostHog()
      .then(() => posthogRef?.capture(event, (eventProps ?? {}) as Record<string, unknown>))
      .catch(() => {
        // El evento se descarta en silencio: analytics nunca rompe la app.
      });
  } catch {
    // track nunca lanza, pase lo que pase.
  }
}

/**
 * Identifica al usuario (PostHog). identify() sin userId hace reset si había
 * un usuario identificado (cierre de sesión); si nunca se identificó, no-op.
 * Con userId: deduplica por id (el mismo id repetido no re-identifica —
 * Supabase dispara TOKEN_REFRESHED con la misma sesión cada hora).
 */
let identifiedId: string | null = null;

export function identify(userId?: string): void {
  try {
    if (!analyticsEnabled) return;
    if (!userId) {
      if (!identified) return;
      identified = false;
      identifiedId = null;
      void ensurePostHog()
        .then(() => posthogRef?.reset())
        .catch(() => {
          // Silencioso: identify nunca lanza.
        });
      return;
    }
    if (identified && identifiedId === userId) return; // mismo id ya identificado
    identified = true;
    identifiedId = userId;
    void ensurePostHog()
      .then(() => posthogRef?.identify(userId))
      .catch(() => {
        // Silencioso: identify nunca lanza.
      });
  } catch {
    // identify nunca lanza, pase lo que pase.
  }
}
