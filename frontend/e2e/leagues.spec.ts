// E2E F4-LIGAS — crear liga con código, listarla, ranking y unirse con código.
// Mockea Supabase (auth/v1 + rest/v1 + rpc) como en name-prompt.spec.ts: el
// código de la app corre real contra rutas interceptadas.
import { test, expect, type Page, type Route } from '@playwright/test';

const SB_KEY = 'sb-pxjxktpdxnqiulfyskuk-auth-token';

function b64url(o: unknown): string {
  return Buffer.from(JSON.stringify(o))
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sessionJson(userMeta: Record<string, unknown>): string {
  const now = Math.floor(Date.now() / 1000);
  const iso = new Date().toISOString();
  const user = {
    id: 'u-otp-123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'otp@finempoder.com',
    email_confirmed_at: iso,
    phone: '',
    confirmed_at: iso,
    last_sign_in_at: iso,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: userMeta,
    identities: [
      {
        id: 'u-otp-123',
        user_id: 'u-otp-123',
        identity_data: { email: 'otp@finempoder.com', email_verified: true },
        provider: 'email',
        last_sign_in_at: iso,
        created_at: iso,
      },
    ],
    created_at: iso,
    updated_at: iso,
  };
  const access_token = `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({
    sub: 'u-otp-123',
    email: 'otp@finempoder.com',
    aud: 'authenticated',
    role: 'authenticated',
    exp: now + 3600,
    iat: now,
    user_metadata: userMeta,
  })}.firma-falsa-local`;
  return JSON.stringify({
    access_token,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: 'rt-local-falso',
    user,
  });
}

/** Siembra la sesión antes de que corra el JS (INITIAL_SESSION) + onboarding listo. */
async function seedSession(page: Page, userMeta: Record<string, unknown>) {
  await page.addInitScript(
    ([key, value]) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, value);
      }
      localStorage.setItem('fe_onboarded_user_u-otp-123', '1');
    },
    [SB_KEY, sessionJson(userMeta)] as const
  );
}

/** Stub del backend local (ResearchGate): preDone para no redirigir. */
async function routeApi(page: Page) {
  await page.route('/api/**', (route: Route) => {
    const u = route.request().url();
    if (u.endsWith('/api/research/status/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          preDone: true,
          postDone: false,
          preScore: null,
          postScore: null,
          moduleProgress: {},
          allModulesDone: false,
        }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

type LeagueRow = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  metric: string;
  created_at: string;
};

/**
 * Mock de Supabase REST (rest/v1) + RPC:
 * - GET league_members → la liga creada (o lista vacía).
 * - POST leagues → guarda la liga creada y la devuelve.
 * - GET leagues?id= → devuelve la liga creada (fetch tras join_league).
 * - rpc/join_league → el id de la liga si el código coincide, null si no.
 * - rpc/upsert_league_entry → 204.
 * - rpc/get_league_ranking → ranking fijo con "Ana" en 1º.
 */
async function routeSupabase(page: Page, state: { createdLeague: LeagueRow | null }) {
  await page.route('**/auth/v1/**', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  );

  await page.route('**/rest/v1/**', async (route: Route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    if (url.includes('/rpc/join_league')) {
      const body = req.postDataJSON() as { p_invite_code: string };
      const league = state.createdLeague;
      const valid = !!league && body.p_invite_code === league.invite_code;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: valid && league ? JSON.stringify(league.id) : 'null',
      });
    }
    if (url.includes('/rpc/upsert_league_entry')) {
      return route.fulfill({ status: 204, body: '' });
    }
    if (url.includes('/rpc/get_league_ranking')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { user_id: 'u-otp-123', name: 'Ana', metric_value: 3, pos: 1 },
          { user_id: 'u-9', name: 'Luis', metric_value: 1, pos: 2 },
        ]),
      });
    }
    if (url.includes('/rest/v1/league_members')) {
      const rows = state.createdLeague ? [{ leagues: state.createdLeague }] : [];
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rows) });
    }
    if (method === 'POST' && url.includes('/rest/v1/leagues')) {
      const body = req.postDataJSON() as {
        name: string;
        invite_code: string;
        owner_id: string;
        metric: string;
      };
      state.createdLeague = {
        id: 'l1',
        name: body.name,
        invite_code: body.invite_code,
        owner_id: body.owner_id,
        metric: body.metric,
        created_at: new Date().toISOString(),
      };
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(state.createdLeague),
      });
    }
    if (method === 'GET' && url.includes('/rest/v1/leagues') && state.createdLeague) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(state.createdLeague),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

async function createLeague(page: Page, name: string, metricLabel: string) {
  await page.getByRole('button', { name: 'Crear liga' }).click();
  await page.getByLabel('Nombre de la liga').fill(name);
  await page.getByRole('button', { name: metricLabel }).click();
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Liga creada' })).toBeVisible();
  const code = (await page.locator('.tracking-widest').textContent())?.trim() ?? '';
  expect(code).toMatch(/^[A-Z0-9]{6}$/);
  return code;
}

test.describe('Ligas — con sesión mockeada', () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, { name: 'Ana' });
    await routeApi(page);
  });

  test('guardar liga creada con código, listarla y mostrar el ranking', async ({ page }) => {
    const state: { createdLeague: LeagueRow | null } = { createdLeague: null };
    await routeSupabase(page, state);

    await page.goto('/app/ligas');
    await expect(page.getByText('Aún no estás en una liga')).toBeVisible();

    const code = await createLeague(page, 'Ahorro juntos', 'Lecciones');
    expect(state.createdLeague?.invite_code).toBe(code);
    expect(state.createdLeague?.owner_id).toBe('u-otp-123');
    expect(state.createdLeague?.metric).toBe('lessons');

    // copiar con feedback "Copiado"
    await page.getByRole('button', { name: 'Copiar código', exact: true }).click();
    await expect(page.getByText('Copiado')).toBeVisible();

    // ver la liga: tarjeta con reto semanal y ranking
    await page.getByRole('button', { name: 'Ver liga' }).click();
    await expect(page.getByText('Ahorro juntos')).toBeVisible();
    await expect(page.getByText('Reto de la semana: Lecciones')).toBeVisible();

    // "Ver liga" deja la tarjeta expandida: ranking visible de inmediato
    await expect(page.getByRole('cell', { name: '1º' })).toBeVisible();
    await expect(page.getByText('3 lecciones')).toBeVisible();
    await expect(page.getByText('Tu posición: 1º')).toBeVisible();
  });

  test('flujo crear → código → unirme (y código inválido con error claro)', async ({ page }) => {
    const state: { createdLeague: LeagueRow | null } = { createdLeague: null };
    await routeSupabase(page, state);

    await page.goto('/app/ligas');
    const code = await createLeague(page, 'Club de ahorro', 'Racha');
    expect(state.createdLeague?.metric).toBe('streak');
    await page.getByRole('button', { name: 'Ver liga' }).click();
    await expect(page.getByText('Reto de la semana: Racha')).toBeVisible();

    // unirme con el código de la liga creada (RPC devuelve la liga)
    await page.getByRole('button', { name: 'Unirme con código' }).click();
    await page.getByRole('textbox', { name: 'Código', exact: true }).fill(code);
    await page.getByRole('button', { name: 'Unirme', exact: true }).click();
    await expect(page.getByText('Te uniste a la liga')).toBeVisible();

    // código con formato válido pero inexistente → "Ese código no es válido"
    await page.getByRole('button', { name: 'Unirme con código' }).click();
    await page.getByRole('textbox', { name: 'Código', exact: true }).fill('ZZZZZZ');
    await page.getByRole('button', { name: 'Unirme', exact: true }).click();
    await expect(page.getByText('Ese código no es válido')).toBeVisible();
  });
});
