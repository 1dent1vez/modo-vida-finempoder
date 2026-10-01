import { expect, test, type Page } from '@playwright/test';

const modules = ['presupuesto', 'ahorro', 'inversion'] as const;
const lessonIds = Array.from(
  { length: 15 },
  (_, index) => `L${String(index + 1).padStart(2, '0')}`,
);

async function prepareGuest(page: Page) {
  await page.route('**/auth/v1/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
  await page.addInitScript(() => {
    localStorage.setItem('fe_admin_mode', '1');
    localStorage.setItem('fe_onboarded_user_local', '1');
  });
}

test.describe('catálogo completo de lecciones', () => {
  test.beforeEach(async ({ page }) => prepareGuest(page));

  for (const moduleId of modules) {
    test(`${moduleId}: sus 15 lecciones cargan en la ruta canónica`, async ({ page }) => {
      for (const lessonId of lessonIds) {
        await page.goto(`/app/${moduleId}/lesson/${lessonId}`);
        await expect(page).toHaveURL(new RegExp(`/app/${moduleId}/lesson/${lessonId}$`));
        await expect(page.locator('main')).toBeVisible();
        await expect(page.getByText('Algo salió mal')).toHaveCount(0);
        await expect(page.getByText('Página no encontrada')).toHaveCount(0);
      }
    });
  }
});
