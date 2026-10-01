import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { test, expect, type Page } from '@playwright/test';
import sharp from 'sharp';
import { CAPTURE_CLONE_STYLE } from '../src/lib/shareAchievement';

// F3-01/F3-02 — Regresión real de la tarjeta compartible:
// - F3-01: el PNG que genera la app tiene contenido (alpha > 0, no uniforme)
//   y el clon capturado con CAPTURE_CLONE_STYLE queda 1080x1080 en left:0.
// - F3-02: sin navigator.share el popover ofrece Descargar/WhatsApp/Copiar.
// La verificación de píxeles usa sharp (devDependency del frontend) sobre el
// blob REAL producido por html-to-image en Chromium.

const here = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE_DIR = path.join(here, '..', 'test-results', 'f3-01');
mkdirSync(EVIDENCE_DIR, { recursive: true });

// Intercepts Supabase auth requests so the app hydrates as guest.
async function mockSupabaseAuth(page: Page) {
  await page.route('**/auth/v1/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
}

// Guest con progreso real sembrado (40% presupuesto → tier Bronce) y captura
// del blob que la app pasa a URL.createObjectURL al descargar.
async function seedGuestWithUnlockedTier(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'fe_progress',
      JSON.stringify({
        state: {
          modules: {
            presupuesto: { progress: 40 },
            ahorro: { progress: 0 },
            inversion: { progress: 0 },
          },
          streak: { current: 1, best: 1, shields: 0, metaDaysStreak: 0 },
          todayDone: false,
        },
        version: 0,
      }),
    );
    const originalCreateObjectURL = URL.createObjectURL.bind(URL);
    (window as unknown as { __capturedBlob: Blob | null }).__capturedBlob = null;
    URL.createObjectURL = (blob: Blob) => {
      (window as unknown as { __capturedBlob: Blob | null }).__capturedBlob = blob;
      return originalCreateObjectURL(blob);
    };
  });
}

async function openAchievementsWithShareButton(page: Page) {
  await mockSupabaseAuth(page);
  await seedGuestWithUnlockedTier(page);
  await page.goto('/app/achievements');
  const shareButton = page.getByRole('button', { name: 'Compartir logro Presupuestación' });
  await expect(shareButton).toBeVisible();
  await shareButton.click();
}

test.describe('F3-01: PNG con contenido real', () => {
  test('la descarga genera un PNG 1080x1080 con alpha > 0 y contenido no uniforme', async ({
    page,
  }) => {
    await openAchievementsWithShareButton(page);

    await page.getByRole('button', { name: 'Descargar imagen' }).click();
    await expect(page.getByText('La imagen del logro se descargó.')).toBeVisible();

    const base64 = await page.evaluate(async () => {
      const blob = (window as unknown as { __capturedBlob: Blob | null }).__capturedBlob;
      if (!blob) return null;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let bin = '';
      const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
      }
      return btoa(bin);
    });
    expect(base64).not.toBeNull();

    const buffer = Buffer.from(base64!, 'base64');
    const evidencePath = path.join(EVIDENCE_DIR, 'png-capturado.png');
    writeFileSync(evidencePath, buffer);

    const meta = await sharp(buffer).metadata();
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1080);
    expect(meta.channels).toBe(4);

    const stats = await sharp(buffer).stats();
    const alpha = stats.channels[3];
    const red = stats.channels[0];
    // Regresión F3-01: un PNG vacío (left:-9999 clonado) tiene alpha mean 0.
    expect(alpha.mean).toBeGreaterThan(200);
    expect(alpha.max).toBe(255);
    // No uniforme: hay contenido real (texto, icono, pastilla) sobre el fondo.
    expect(red.stdev).toBeGreaterThan(0);

    // Evidencia numérica en el reporte del test.
    console.log(
      `PNG evidencia: ${evidencePath} (${buffer.length} B) alpha mean=${alpha.mean} ` +
        `alpha min=${alpha.min} alpha max=${alpha.max} red stdev=${red.stdev}`,
    );
  });

  test('el clon con CAPTURE_CLONE_STYLE queda 1080x1080 en left:0; el original sigue offscreen', async ({
    page,
  }) => {
    await openAchievementsWithShareButton(page);
    // 40% de presupuesto también deriva lecciones Bronce: hay 2 tarjetas
    // (presupuesto y lecciones); la primera en DOM es presupuesto.
    await expect(page.getByTestId('shareable-achievement-card')).toHaveCount(2);
    const card = page.getByTestId('shareable-achievement-card').first();
    await expect(card).toBeVisible();
    // Sincroniza con el re-render del popover (estado `open` tras el click)
    // antes de medir el clon: evita carreras con React.
    await expect(page.getByRole('button', { name: 'Descargar imagen' })).toBeVisible();

    const geo = await page.evaluate((style: Record<string, string>) => {
      const node = document.querySelector(
        '[data-testid="shareable-achievement-card"]',
      ) as HTMLElement;
      const original = node.getBoundingClientRect();
      const clone = node.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, style);
      document.body.appendChild(clone);
      const rect = clone.getBoundingClientRect();
      const computed = getComputedStyle(clone);
      // getComputedStyle es una declaración VIVA: se leen los valores ANTES
      // de desmontar el clon (al removerlo, Chromium vacía el objeto).
      const result = {
        originalLeft: original.left,
        cloneWidth: rect.width,
        cloneHeight: rect.height,
        cloneLeft: rect.left,
        computedLeft: computed.left,
        computedRight: computed.right,
        computedBottom: computed.bottom,
        computedPosition: computed.position,
        computedOpacity: computed.opacity,
      };
      clone.remove();
      return result;
    }, CAPTURE_CLONE_STYLE);

    expect(geo.originalLeft).toBe(-9999);
    expect(geo.cloneWidth).toBe(1080);
    expect(geo.cloneHeight).toBe(1080);
    expect(geo.cloneLeft).toBe(0);
    expect(geo.computedLeft).toBe('0px');
    expect(geo.computedPosition).toBe('fixed');
    expect(geo.computedOpacity).toBe('1');
  });
});

test.describe('F3-02: sin Web Share API', () => {
  test('el popover ofrece Descargar imagen / WhatsApp / Copiar sin botón "Compartir"', async ({
    page,
  }) => {
    // Headless Chromium no expone navigator.share: desktop real.
    await openAchievementsWithShareButton(page);

    await expect(page.getByRole('button', { name: 'Descargar imagen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar por WhatsApp' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copiar mensaje' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compartir', exact: true })).toHaveCount(0);
  });
});
