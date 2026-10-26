import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceDir = path.join(root, 'assets-src/weather-icons-v2');
const originalDir = path.join(root, 'frontend/public/assets/icons');
const outDir = path.join(originalDir, 'experimental');
const names = ['sun', 'cloud', 'rain', 'storm', 'snow'];
const descriptions = ['Sol', 'Nubes', 'Lluvia', 'Tormenta', 'Nieve'];
const fileName = name => `icon-${name}.webp`;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

async function check() {
  const manifest = JSON.parse(await readFile(path.join(outDir, 'manifest.json'), 'utf8'));
  for (const name of names) {
    const src = await readFile(path.join(sourceDir, `icon-${name}.png`));
    const asset = await readFile(path.join(outDir, fileName(name)));
    const meta = await sharp(asset).metadata();
    const entry = manifest[name];
    if (meta.format !== 'webp' || meta.width !== 400 || meta.height !== 400 ||
        !meta.hasAlpha || entry?.sourceSha256 !== sha256(src) || entry?.webpSha256 !== sha256(asset)) {
      throw new Error(`Icono desactualizado o inválido: ${name}`);
    }
  }
  console.log('Cinco iconos WebP válidos, con canal alfa y fuentes reproducibles.');
}

async function makePreview() {
  const rowHeight = 204;
  const headerHeight = 74;
  const width = 1070;
  const height = headerHeight + names.length * rowHeight;
  const labels = names.map((name, i) =>
    `<text x="30" y="${headerHeight + i * rowHeight + 105}" font-family="Arial,sans-serif" font-size="26" font-weight="bold" fill="#203c37">${descriptions[i]}</text>`).join('');
  const separators = names.map((_, i) =>
    `<line x1="0" y1="${headerHeight + (i + 1) * rowHeight}" x2="${width}" y2="${headerHeight + (i + 1) * rowHeight}" stroke="#839d8d" stroke-width="2"/>`).join('');
  const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#b5c4a7"/>
    <rect width="100%" height="${headerHeight}" fill="#203c37"/>
    <text x="215" y="45" font-family="Arial,sans-serif" font-size="24" font-weight="bold" letter-spacing="2" fill="#f8e9c4">ORIGINAL</text>
    <text x="645" y="45" font-family="Arial,sans-serif" font-size="24" font-weight="bold" letter-spacing="2" fill="#f8e9c4">PROPUESTA</text>
    ${separators}${labels}
    </svg>`);

  const overlays = [];
  for (let index = 0; index < names.length; index++) {
    const key = names[index];
    const y = headerHeight + index * rowHeight;
    for (const [dir, left] of [[originalDir, 215], [outDir, 645]]) {
      const source = path.join(dir, fileName(key));
      overlays.push({ input: await sharp(source).resize(160, 160).png().toBuffer(), left, top: y + 22 });
      overlays.push({ input: await sharp(source).resize(80, 80).png().toBuffer(), left: left + 205, top: y + 62 });
    }
  }
  const board = await sharp(background).composite(overlays).png().toBuffer();
  await writeFile(path.join(outDir, 'icons-comparison-preview.png'), board);
}

await mkdir(outDir, { recursive: true });
if (process.argv.includes('--check')) {
  await check();
} else {
  const manifest = {};
  for (const name of names) {
    const source = await readFile(path.join(sourceDir, `icon-${name}.png`));
    // Downsample the edited, textured 1254px alpha art; keep the original icons intact.
    const webp = await sharp(source).resize(400, 400, { kernel: 'lanczos3' })
      .webp({ quality: 93, alphaQuality: 100, effort: 5 }).toBuffer();
    await writeFile(path.join(outDir, fileName(name)), webp);
    manifest[name] = { sourceSha256: sha256(source), webpSha256: sha256(webp), bytes: webp.length };
    console.log(`${name}: ${(webp.length / 1024).toFixed(1)} KiB`);
  }
  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  if (process.argv.includes('--preview')) await makePreview();
}
