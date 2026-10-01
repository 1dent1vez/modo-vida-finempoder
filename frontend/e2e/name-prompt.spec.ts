// E2E F4-NOMBRE-PERFIL — Gate Lupa.
// Simula sesiones de Supabase sembrando localStorage (sb-<ref>-auth-token) y
// intercepta auth/v1 para el PUT de updateUser. El código de la app corre real.
import { test, expect, type Page, type Route } from '@playwright/test';

const SB_KEY = 'sb-pxjxktpdxnqiulfyskuk-auth-token';
// Locator exclusivo del NamePromptDialog (aria-label en el overlay).
// Hay OTROS role=dialog legítimos en la app (p.ej. el modal "Tu meta diaria").
const NAME_DIALOG = '¿Cómo te llamas?';

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

/** Siembra la sesión antes de que corra el JS de la app (INITIAL_SESSION).
 *  NO sobrescribe una sesión ya existente: tras el PUT de updateUser,
 *  supabase-js persiste en el storage el user CON name; re-sembrar la versión
 *  sin name en un reload anularía el guardado real (falso negativo del e2e).
 *  También marca onboarding completo (ResearchGate). */
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

/** Stub del backend local (ResearchGate): status/me con preDone para no redirigir. */
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

/** Intercepta auth/v1: PUT /user devuelve el user con el name guardado; el resto {}. */
async function routeAuth(
  page: Page,
  opts: { savedName: string | null }
) {
  await page.route('**/auth/v1/**', async (route: Route) => {
    const req = route.request();
    if (req.method() === 'PUT' && req.url().endsWith('/user')) {
      const now = Math.floor(Date.now() / 1000);
      const iso = new Date().toISOString();
      const name = opts.savedName;
      const userMeta = name ? { name } : {};
      const body = {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LW90cC0xMjMiLCJleHAiOjk5OTk5OTk5OTl9.firma-local',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: now + 3600,
        refresh_token: 'rt-local-falso',
        user: {
          id: 'u-otp-123',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'otp@finempoder.com',
          email_confirmed_at: iso,
          app_metadata: { provider: 'email', providers: ['email'] },
          user_metadata: userMeta,
          identities: [],
          created_at: iso,
          updated_at: iso,
        },
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

function nameDialog(page: Page) {
  return page.getByRole('dialog', { name: NAME_DIALOG });
}

test.describe('F4 nombre — sin nombre (Magic Link)', () => {
  test('sesión sin user_metadata.name → el diálogo aparece con el copy exacto', async ({ page }) => {
    await seedSession(page, {});
    await routeApi(page);
    await routeAuth(page, { savedName: null });
    await page.goto('/app');
    const dialog = nameDialog(page);
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('heading', { name: '¿Cómo te llamas?' })).toBeVisible();
    await expect(page.getByText('Así te saludamos en la app. Puedes omitirlo si prefieres.')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Guardar' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Omitir' })).toBeVisible();
    await expect(dialog.getByLabel('Tu nombre')).toBeVisible();
  });

  test('el área del diálogo es no bloqueante: overlay pointer-events-none, scroll libre, sin foco secuestrado, clic fuera no cierra', async ({ page }) => {
    await seedSession(page, {});
    await routeApi(page);
    await routeAuth(page, { savedName: null });
    await page.goto('/app');
    const dialog = nameDialog(page);
    await expect(dialog).toBeVisible();

    const styles = await dialog.evaluate((el) => {
      const card = el.querySelector('.pointer-events-auto') as HTMLElement;
      return {
        overlayPointerEvents: getComputedStyle(el).pointerEvents,
        cardPointerEvents: getComputedStyle(card).pointerEvents,
        overlayZ: getComputedStyle(el).zIndex,
        ariaModal: el.getAttribute('aria-modal'),
      };
    });
    expect(styles.overlayPointerEvents).toBe('none');
    expect(styles.cardPointerEvents).toBe('auto');
    expect(styles.overlayZ).toBe('1500');
    expect(styles.ariaModal).toBe('false');

    // Sin foco secuestrado: activeElement no está dentro del diálogo.
    const focusInside = await page.evaluate((label) => {
      const d = document.querySelector(`[role="dialog"][aria-label="${label}"]`);
      return d ? d.contains(document.activeElement) : false;
    }, NAME_DIALOG);
    expect(focusInside).toBe(false);

    // Scroll del documento NO bloqueado con el diálogo abierto (Home ya cargada).
    await expect(page.getByTestId('home-header')).toBeVisible();
    const scrollY = await page.evaluate(() => {
      window.scrollTo(0, 400);
      return window.scrollY;
    });
    expect(scrollY).toBeGreaterThan(0);

    // Clic fuera de la tarjeta (esquina del viewport): atraviesa el overlay
    // del nombre (pointer-events-none) y llega a lo que hay debajo; el
    // diálogo de nombre NO se cierra (sin handler de fondo).
    await page.mouse.click(12, 12);
    await expect(dialog).toBeVisible();
  });

  test('maxLength 60: pegar 70 caracteres trunca a 60; emojis deshabilitan Guardar', async ({ page }) => {
    await seedSession(page, {});
    await routeApi(page);
    await routeAuth(page, { savedName: null });
    await page.goto('/app');
    const input = page.getByLabel('Tu nombre');
    await expect(input).toBeVisible();

    const long = 'A'.repeat(70);
    await input.fill(long);
    const len = await input.inputValue();
    expect(len.length).toBe(60);

    await input.fill('Ana 😀');
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeDisabled();
    await expect(page.getByText('Usa solo letras, espacios, guiones y apóstrofos.')).toBeVisible();
  });

  test('Guardar "Ana María de la O" → PUT con trim, saludo "Hola, Ana", Perfil con nombre completo', async ({ page }) => {
    await seedSession(page, {});
    let putBody: unknown = null;
    await routeApi(page);
    await page.route('**/auth/v1/**', async (route: Route) => {
      const req = route.request();
      if (req.method() === 'PUT' && req.url().endsWith('/user')) {
        putBody = req.postDataJSON();
        const now = Math.floor(Date.now() / 1000);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LW90cC0xMjMiLCJleHAiOjk5OTk5OTk5OTl9.firma-local',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: now + 3600,
            refresh_token: 'rt-local-falso',
            user: {
              id: 'u-otp-123',
              aud: 'authenticated',
              role: 'authenticated',
              email: 'otp@finempoder.com',
              app_metadata: { provider: 'email', providers: ['email'] },
              user_metadata: { name: 'Ana María de la O' },
              identities: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          }),
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/app');
    const input = page.getByLabel('Tu nombre');
    await expect(nameDialog(page)).toBeVisible();
    await expect(input).toBeVisible();

    // Con espacios alrededor → el PUT debe llevar el nombre recortado.
    await input.fill('  Ana María de la O  ');
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(nameDialog(page)).not.toBeVisible({ timeout: 10_000 });
    expect((putBody as { data: { name: string } }).data).toEqual({ name: 'Ana María de la O' });

    // Flag marcado y saludo en Home con el primer nombre.
    const flag = await page.evaluate(() => localStorage.getItem('fe_name_asked'));
    expect(flag).toBe('1');
    await expect(page.getByText('Hola, Ana')).toBeVisible();

    // Reload (con la sesión ya guardada en storage) → Perfil muestra el nombre
    // completo en 2 lugares: header (h2) y fila "Nombre" del InfoRow.
    await page.goto('/app/profile');
    await expect(page.getByRole('heading', { name: 'Ana María de la O' })).toBeVisible();
    await expect(page.getByText('Ana María de la O').nth(1)).toBeVisible();
    // Y el diálogo de nombre no reaparece tras el reload.
    await expect(nameDialog(page)).toHaveCount(0);
  });

  test('Omitir → flag fe_name_asked, no reaparece al recargar ni en nueva sesión sin nombre', async ({ page }) => {
    await seedSession(page, {});
    await routeApi(page);
    await routeAuth(page, { savedName: null });
    await page.goto('/app');
    const dialog = nameDialog(page);
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Omitir' }).click();
    await expect(dialog).toHaveCount(0);
    const flag = await page.evaluate(() => localStorage.getItem('fe_name_asked'));
    expect(flag).toBe('1');

    // Recarga con la MISMA sesión (sigue sin nombre): no reaparece.
    await page.reload();
    await expect(nameDialog(page)).toHaveCount(0);

    // Nueva sesión sin nombre (otro storage simulado): el flag persiste.
    await page.evaluate(() => localStorage.setItem('fe_name_asked', '1'));
    await page.reload();
    await expect(nameDialog(page)).toHaveCount(0);
    await expect(page.getByText('Hola')).toBeVisible();
  });

  test('error de red en Guardar → mensaje suave, diálogo sigue, reintento funciona', async ({ page }) => {
    await seedSession(page, {});
    let fail = true;
    await routeApi(page);
    await page.route('**/auth/v1/**', async (route: Route) => {
      const req = route.request();
      if (req.method() === 'PUT' && req.url().endsWith('/user')) {
        if (fail) {
          fail = false;
          // Red caída REAL: la request se aborta; el fetch de supabase-js
          // lanza y el catch del componente muestra el error suave.
          await route.abort('connectionrefused');
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LW90cC0xMjMiLCJleHAiOjk5OTk5OTk5OTl9.firma-local',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            refresh_token: 'rt-local-falso',
            user: {
              id: 'u-otp-123', aud: 'authenticated', role: 'authenticated',
              email: 'otp@finempoder.com',
              user_metadata: { name: 'Ana' }, identities: [],
              created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            },
          }),
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/app');
    const input = page.getByLabel('Tu nombre');
    await expect(input).toBeVisible();
    await input.fill('Ana');
    await page.getByRole('button', { name: 'Guardar' }).click();

    // El diálogo persiste con error suave y sin flag.
    await expect(nameDialog(page)).toBeVisible({ timeout: 10_000 });
    const flagAfterFail = await page.evaluate(() => localStorage.getItem('fe_name_asked'));
    expect(flagAfterFail).toBeNull();

    // Reintento con respuesta buena.
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(nameDialog(page)).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Hola, Ana')).toBeVisible();
  });
});

test.describe('F4 nombre — con nombre (Google)', () => {
  test('sesión con user_metadata.name → el diálogo NO aparece', async ({ page }) => {
    await seedSession(page, { name: 'Ana García' });
    await routeApi(page);
    await routeAuth(page, { savedName: null });
    await page.goto('/app');
    await expect(page.getByText('Hola, Ana')).toBeVisible();
    await expect(nameDialog(page)).toHaveCount(0);
  });
});

test.describe('F4 nombre — flag previo', () => {
  test('fe_name_asked=1 sin nombre → el diálogo NO aparece al cargar', async ({ page }) => {
    await seedSession(page, {});
    await page.addInitScript(() => localStorage.setItem('fe_name_asked', '1'));
    await routeApi(page);
    await routeAuth(page, { savedName: null });
    await page.goto('/app');
    await expect(page.getByText('Hola')).toBeVisible();
    await expect(nameDialog(page)).toHaveCount(0);
  });
});