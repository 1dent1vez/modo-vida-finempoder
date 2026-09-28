import { readdir, readFile } from 'node:fs/promises';
import { brotliCompressSync } from 'node:zlib';

const assetDir = new URL('../dist/assets/', import.meta.url);
const maxCompressedBytes = 100 * 1024;
const scripts = (await readdir(assetDir)).filter((name) => name.endsWith('.js'));
const failures = [];

for (const name of scripts) {
  const source = await readFile(new URL(name, assetDir));
  const bytes = brotliCompressSync(source).byteLength;
  if (bytes > maxCompressedBytes) failures.push(`${name}: ${(bytes / 1024).toFixed(1)} KiB`);
}

if (failures.length > 0) {
  console.error(`Chunks JS mayores a 100 KiB Brotli:\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Presupuesto de chunks OK: ${scripts.length} archivos JS bajo 100 KiB Brotli`);
}
