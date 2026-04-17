import { test, expect } from '@playwright/test';

// Intercepts Supabase auth requests so the app hydrates (onAuthStateChange fires)
// without needing real credentials in CI.
async function mockSupabaseAuth(page: import('@playwright/test').Page) {
  await page.route('https://placeholder.supabase.co/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  );
}

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAuth(page);
    await page.goto('/login');
  });

  test('renders the login form', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByText('Correo inválido')).toBeVisible();
    await expect(page.getByText('Mínimo 8 caracteres')).toBeVisible();
  });
});

test.describe('Signup page', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAuth(page);
    await page.goto('/signup');
  });

  test('renders the signup form', async ({ page }) => {
    await expect(page.getByLabel('Nombre completo')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear Cuenta' })).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('root redirects to login when unauthenticated', async ({ page }) => {
    await mockSupabaseAuth(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('protected /app redirects to login when unauthenticated', async ({ page }) => {
    await mockSupabaseAuth(page);
    await page.goto('/app');
    await expect(page).toHaveURL(/\/login/);
  });
});
