import { chromium, devices } from '@playwright/test';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4174 } });
const address = server.httpServer.address();
if (!address || typeof address === 'string') throw new Error('No se pudo iniciar Vite preview');
const url = `http://127.0.0.1:${address.port}/app`;
let browser;

try {
  browser = await chromium.launch();
  for (const [name, device] of [
    ['escritorio', devices['Desktop Chrome']],
    ['móvil emulado', devices['Pixel 7']],
  ]) {
    const samples = [];
    for (let run = 0; run < 3; run += 1) {
      const context = await browser.newContext({ ...device, serviceWorkers: 'block' });
      const page = await context.newPage();
      await page.route('**/auth/v1/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
      );
      await page.route('https://fonts.googleapis.com/**', (route) =>
        route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
      );
      await page.addInitScript(() => {
        localStorage.setItem('fe_onboarded_user_local', '1');
        window.__lastLcp = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          window.__lastLcp = entries.at(-1)?.startTime ?? window.__lastLcp;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: (1.6 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
      });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      const started = Date.now();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('main').waitFor({ state: 'visible', timeout: 30000 });
      const mainMs = Date.now() - started;
      await page.waitForTimeout(500);
      const paint = await page.evaluate(() => ({
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
        lcp: window.__lastLcp || null,
      }));
      samples.push({ mainMs, fcpMs: paint.fcp, lcpMs: paint.lcp });
      await context.close();
    }
    const median = (key) => {
      const values = samples.map((sample) => sample[key]).filter((value) => value != null);
      return values.length ? Math.round(values.sort((a, b) => a - b)[Math.floor(values.length / 2)]) : null;
    };
    console.log(JSON.stringify({ profile: name, runs: 3, mainMs: median('mainMs'), fcpMs: median('fcpMs'), lcpMs: median('lcpMs') }));
  }
} finally {
  await browser?.close();
  await new Promise((resolve, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : resolve())),
  );
}
