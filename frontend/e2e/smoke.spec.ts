import { test, expect } from '@playwright/test';

// Intercepts Supabase auth requests so the app hydrates (onAuthStateChange fires)
// without needing real credentials in CI. Sin sesión = modo invitado (guest).
async function mockSupabaseAuth(page: import('@playwright/test').Page) {
  await page.route('**/auth/v1/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  );
}

test.describe('Guest flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAuth(page);
  });

  test('la raíz redirige a /app y la Home renderiza en modo invitado', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/app/);
    await expect(page.getByRole('heading', { name: /Hola/ })).toBeVisible();
    await expect(page.getByLabel('Continúa aprendiendo')).toBeVisible();
  });

  test('muestra el GuestBanner sin sesión', async ({ page }) => {
    await page.goto('/app');
    await expect(page.getByText('Estás explorando sin cuenta')).toBeVisible();
  });
});

test.describe('Auth', () => {
  test('/login redirige a /auth', async ({ page }) => {
    await mockSupabaseAuth(page);
    await page.goto('/login');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('/auth muestra el botón de Google', async ({ page }) => {
    await mockSupabaseAuth(page);
    await page.goto('/auth');
    await expect(page.getByText('Continuar con Google')).toBeVisible();
  });
});

test.describe('Admin', () => {
  test('/admin muestra el input PIN', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByLabel('PIN')).toBeVisible();
  });
});
