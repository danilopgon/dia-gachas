import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'frontend/public/assets/images/experimental');
const manifestPath = path.join(output, 'manifest.json');
const mobileSource = path.join(root, 'assets-src/home-mobile.png');
const scriptSource = fileURLToPath(import.meta.url);
const segmentSource = path.join(root, 'scripts/assets/segment-master.mjs');
const desktopSource = path.join(root, 'assets-src/home-desktop-master.png');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

const definitions = {
  'fondo-main-v2.webp': { width: 1080, height: 1920, hasAlpha: false },
  'fondo-cielo-textured.webp': { width: 2912, height: 1632, hasAlpha: false },
  'fondo-colinas-textured.webp': { width: 2912, height: 1632, hasAlpha: true },
  'fondo-colinas-frente-textured.webp': { width: 2912, height: 1632, hasAlpha: true },
};

async function sourceHash() {
  const bytes = await Promise.all([
    mobileSource, desktopSource, scriptSource, segmentSource,
  ].map(file => readFile(file)));
  return digest(Buffer.concat(bytes));
}

async function build() {
  // Preserve the original generated artwork and its print texture: no SVG
  // tracing and no extra synthetic noise on the mobile raster.
  await sharp(await readFile(mobileSource))
    .resize(1080, 1920, { kernel: 'lanczos3' })
    .webp({ quality: 94, effort: 5 })
    .toFile(path.join(output, 'fondo-main-v2.webp'));

  // Semantic masks export three matching full-canvas desktop layers.
  await import('./segment-master.mjs');

  const files = {};
  for (const [name, expected] of Object.entries(definitions)) {
    const bytes = await readFile(path.join(output, name));
    files[name] = { ...expected, bytes: bytes.length, sha256: digest(bytes) };
  }
  await writeFile(manifestPath, JSON.stringify({ sourceSha256: await sourceHash(), files }, null, 2) + '\n');
  process.stdout.write('4 textured WebP assets generated.\n');
}

async function check() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.sourceSha256 !== await sourceHash()) {
    throw new Error('The artwork or generator changed: run pnpm assets:build');
  }
  if (Object.keys(manifest.files).length !== Object.keys(definitions).length) {
    throw new Error('Missing expected files in asset manifest');
  }
  for (const [name, expected] of Object.entries(definitions)) {
    const filename = path.join(output, name);
    const bytes = await readFile(filename);
    const metadata = await sharp(filename).metadata();
    const entry = manifest.files[name];
    if (!entry || metadata.format !== 'webp' || metadata.width !== expected.width ||
        metadata.height !== expected.height || metadata.hasAlpha !== expected.hasAlpha ||
        bytes.length !== entry.bytes || digest(bytes) !== entry.sha256) {
      throw new Error(`Invalid or stale WebP: ${name}`);
    }
  }
  process.stdout.write('4 textured WebP assets validated.\n');
}

try {
  if (process.argv.includes('--check')) await check();
  else await build();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
