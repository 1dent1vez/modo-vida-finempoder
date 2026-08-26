// @vitest-environment node
// Test estático de gobernanza F6-ANALYTICS: verifica que los 16 eventos del
// producto están instrumentados en los archivos esperados (patrón de
// gobernanza por fs, sin necesidad de montar la UI completa).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const frontendRoot = fileURLToPath(new URL('../../', import.meta.url));

function read(relPath: string): string {
  return readFileSync(path.join(frontendRoot, relPath), 'utf8');
}

const CASOS: Array<{ evento: string; archivo: string }> = [
  { evento: 'LESSON_STARTED', archivo: 'src/module-kit/components/LessonShell.tsx' },
  { evento: 'LESSON_COMPLETED', archivo: 'src/module-kit/components/LessonShell.tsx' },
  { evento: 'LESSON_RESUMED', archivo: 'src/features/lessons/hooks/useLessonResume.ts' },
  { evento: 'META_DAILY_COMPLETED', archivo: 'src/pages/home/Home.tsx' },
  { evento: 'STREAK_LOST', archivo: 'src/components/GlobalSnackbar.tsx' },
  { evento: 'ACHIEVEMENT_UNLOCKED', archivo: 'src/shared/components/gamification/AchievementModal.tsx' },
  { evento: 'SHARE_CLICKED', archivo: 'src/shared/components/growth/AchievementShareButton.tsx' },
  { evento: 'NEWSLETTER_SUBSCRIBED', archivo: 'src/shared/components/growth/NewsletterPrompt.tsx' },
  { evento: 'LEAGUE_CREATED', archivo: 'src/pages/ligas/LigasPage.tsx' },
  { evento: 'LEAGUE_JOINED', archivo: 'src/pages/ligas/LigasPage.tsx' },
  { evento: 'LEAGUE_RANKING_VIEWED', archivo: 'src/pages/ligas/LigasPage.tsx' },
  { evento: 'SIGNIN_MAGIC_LINK', archivo: 'src/pages/auth/AuthScreen.tsx' },
  { evento: 'SIGNIN_GOOGLE', archivo: 'src/pages/auth/AuthScreen.tsx' },
  { evento: 'ONBOARDING_STARTED', archivo: 'src/pages/onboarding/Screen1.tsx' },
  { evento: 'ONBOARDING_STEP', archivo: 'src/pages/onboarding/Screen1.tsx' },
  { evento: 'ONBOARDING_STEP', archivo: 'src/pages/onboarding/Screen2.tsx' },
  { evento: 'ONBOARDING_STEP', archivo: 'src/pages/onboarding/Screen3.tsx' },
  { evento: 'ONBOARDING_COMPLETED', archivo: 'src/pages/onboarding/Screen3.tsx' },
];

describe('gobernanza de instrumentación (16 eventos en sus puntos esperados)', () => {
  it.each(CASOS)('$evento instrumentado en $archivo', ({ evento, archivo }) => {
    const content = read(archivo);
    expect(content).toContain(`EVENTOS.${evento}`);
    expect(content).toContain(`track(EVENTOS.${evento}`);
    expect(content).toContain('lib/analytics');
  });
});
