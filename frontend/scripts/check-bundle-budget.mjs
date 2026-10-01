import { readdir, readFile } from 'node:fs/promises';
import { brotliCompressSync } from 'node:zlib';
import { JSDOM } from 'jsdom';

const assetDir = new URL('../dist/assets/', import.meta.url);
const maxCompressedBytes = 100 * 1024;
const maxInitialBytes = 220 * 1024;
const scripts = (await readdir(assetDir)).filter((name) => name.endsWith('.js'));
const failures = [];
const compressedBytes = async (name) => {
  const source = await readFile(new URL(name, assetDir));
  return brotliCompressSync(source).byteLength;
};

for (const name of scripts) {
  const bytes = await compressedBytes(name);
  if (bytes > maxCompressedBytes) failures.push(`${name}: ${(bytes / 1024).toFixed(1)} KiB`);
}

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const document = new JSDOM(html).window.document;
const initialAssetUrls = [
  ...document.querySelectorAll('script[type="module"][src]'),
  ...document.querySelectorAll('link[rel="modulepreload"][href]'),
  ...document.querySelectorAll('link[rel="stylesheet"][href]'),
]
  .map((element) => element.getAttribute('src') ?? element.getAttribute('href'))
  .filter((value) => value?.startsWith('/assets/'));
const initialAssets = [...new Set(initialAssetUrls.map((value) => value.slice('/assets/'.length)))];
const initialBytes = (await Promise.all(initialAssets.map(compressedBytes))).reduce(
  (total, bytes) => total + bytes,
  0,
);
if (initialBytes > maxInitialBytes) {
  failures.push(`Carga inicial JS/CSS: ${(initialBytes / 1024).toFixed(1)} KiB Brotli`);
}

if (failures.length > 0) {
  console.error(`Presupuesto de bundle excedido:\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(
    `Presupuesto de bundle OK: ${scripts.length} chunks JS bajo 100 KiB; carga inicial ${(initialBytes / 1024).toFixed(1)} KiB Brotli (máximo 220 KiB)`,
  );
}
