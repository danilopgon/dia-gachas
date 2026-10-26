import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'assets-src/home-desktop-master.png');
const destination = path.join(root, 'frontend/public/assets/images/experimental');
const targetSize = { width: 2912, height: 1632 };

const { data, info } = await sharp(await readFile(source)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (channels !== 3) throw new Error('Expected RGB master image');

const pixel = (x, y) => (y * width + x) * channels;
const isHill = i => data[i] < 137 && data[i + 1] < 160;
const isField = i => data[i] > 188 && data[i] - data[i + 1] > 32;

function scanLine(startY, endY, predicate) {
  const raw = new Int16Array(width);
  for (let x = 0; x < width; x++) {
    let found = endY;
    for (let y = startY; y < endY - 7; y++) {
      let positives = 0;
      for (let dy = 0; dy < 8; dy++) if (predicate(pixel(x, y + dy))) positives++;
      if (positives >= 7) { found = y; break; }
    }
    raw[x] = found;
  }
  // Remove single-pixel classification noise while following the organic curves.
  return Array.from(raw, (_, x) => {
    const values = [];
    for (let dx = -5; dx <= 5; dx++) values.push(raw[Math.max(0, Math.min(width - 1, x + dx))]);
    values.sort((a, b) => a - b);
    return values[5];
  });
}

const hillTop = scanLine(Math.floor(height * .35), Math.floor(height * .60), isHill);
const fieldTop = scanLine(Math.floor(height * .49), Math.floor(height * .79), isField);

function makeLayer(name) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let x = 0; x < width; x++) {
    const firstHill = hillTop[x];
    const firstField = Math.max(firstHill + 12, fieldTop[x]);
    for (let y = 0; y < height; y++) {
      let sampleY = y;
      let alpha = 255;

      if (name === 'sky') {
        // Extend real sky paper texture behind the hills for safe parallax.
        if (y >= firstHill) sampleY = Math.max(0, firstHill - 8 - (y - firstHill) % 50);
      } else if (name === 'hills') {
        if (y < firstHill) alpha = 0;
        // The field hides this extension at rest. Its existing hill texture
        // remains available if the foreground moves during the GSAP entrance.
        if (y >= firstField) {
          if (y > firstField + 96) alpha = 0;
          sampleY = Math.max(firstHill, firstField - 9 - (y - firstField) % 36);
        }
      } else if (name === 'fields') {
        if (y < firstField) alpha = 0;
      }

      const src = pixel(x, sampleY);
      const dest = (y * width + x) * 4;
      rgba[dest] = data[src];
      rgba[dest + 1] = data[src + 1];
      rgba[dest + 2] = data[src + 2];
      rgba[dest + 3] = alpha;
    }
  }
  return rgba;
}

async function exportLayer(layer, name) {
  const raw = makeLayer(layer);
  const buffer = await sharp(raw, { raw: { width, height, channels: 4 } })
    .resize(targetSize.width, targetSize.height, { kernel: 'lanczos3' })
    .webp({ quality: 91, alphaQuality: 100, effort: 5 })
    .toBuffer();
  await writeFile(path.join(destination, name), buffer);
  process.stdout.write(`${name}: ${(buffer.length / 1024).toFixed(1)} KiB\n`);
  return buffer;
}

await mkdir(destination, { recursive: true });
const sky = await exportLayer('sky', 'fondo-cielo-textured.webp');
const hills = await exportLayer('hills', 'fondo-colinas-textured.webp');
const fields = await exportLayer('fields', 'fondo-colinas-frente-textured.webp');

// A no-animation composite to inspect for seams or missing silhouettes.
const preview = await sharp(sky)
  .composite([{ input: hills, blend: 'over' }, { input: fields, blend: 'over' }])
  .png().toBuffer();
const wantsPreview = process.argv.includes('--preview');
if (wantsPreview) await writeFile(path.join(destination, 'composite-textured-preview.png'), preview);

const original = await sharp(await readFile(source)).resize(targetSize.width, targetSize.height).raw().toBuffer();
const combined = await sharp(preview).removeAlpha().raw().toBuffer();
let totalDifference = 0;
for (let i = 0; i < original.length; i++) totalDifference += Math.abs(original[i] - combined[i]);
process.stdout.write(`Composite mean absolute color difference: ${(totalDifference / original.length).toFixed(2)}/255\n`);

// Deliberately offset the animated layers in opposite directions. This
// exposes the synthesized underpainting so gaps are visible during review.
async function shifted(input, pixels) {
  const cropped = await sharp(input).extract({
    left: 0,
    top: pixels < 0 ? -pixels : 0,
    width: targetSize.width,
    height: targetSize.height - Math.abs(pixels),
  }).toBuffer();
  return { input: cropped, left: 0, top: Math.max(0, pixels), blend: 'over' };
}
if (wantsPreview) {
  const motionPreview = await sharp(sky)
    .composite([await shifted(hills, -20), await shifted(fields, 45)])
    .png().toBuffer();
  await writeFile(path.join(destination, 'parallax-offset-preview.png'), motionPreview);
}

// Match the initial GSAP keyframe used by the home: both hill layers start
// at scale 1.06 and y +40, then settle into the perfectly registered master.
async function entranceFrame(input) {
  const scaledWidth = Math.round(targetSize.width * 1.06);
  const scaledHeight = Math.round(targetSize.height * 1.06);
  const scaled = await sharp(input).resize(scaledWidth, scaledHeight).toBuffer();
  return sharp(scaled).extract({
    left: Math.round((scaledWidth - targetSize.width) / 2),
    top: Math.round((scaledHeight - targetSize.height) / 2 - 40),
    width: targetSize.width,
    height: targetSize.height,
  }).toBuffer();
}
if (wantsPreview) {
  const entrance = await sharp(sky)
    .composite([
      { input: await entranceFrame(hills), blend: 'over' },
      { input: await entranceFrame(fields), blend: 'over' },
    ]).png().toBuffer();
  await writeFile(path.join(destination, 'parallax-entrance-preview.png'), entrance);
}

// A single inspection sheet makes the alpha masks visible without needing a
// layered image editor. Checkerboard cells signify transparent pixels.
if (wantsPreview) {
  const panelWidth = 836;
  const panelHeight = 470;
  const headerHeight = 48;
  const cellHeight = panelHeight + headerHeight;
  const checker = Buffer.from(`<svg width="${panelWidth}" height="${panelHeight}" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="squares" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="#e8e3d7"/><path d="M0 0h16v16H0zm16 16h16v16H16z" fill="#d8d1c1"/></pattern></defs><rect width="100%" height="100%" fill="url(#squares)"/></svg>`);
  const labels = ['01  CIELO', '02  COLINAS · ALFA', '03  CAMPOS · ALFA', '04  COMPOSICIÓN FINAL'];
  const layers = [sky, hills, fields, preview];
  const panels = await Promise.all(layers.map(async (layer, index) => {
    const resized = await sharp(layer).resize(panelWidth, panelHeight).toBuffer();
    const artwork = index === 0 || index === 3
      ? await sharp(resized).png().toBuffer()
      : await sharp(checker).composite([{ input: resized }]).png().toBuffer();
    const labelSvg = Buffer.from(`<svg width="${panelWidth}" height="${headerHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#243e39"/><text x="20" y="31" font-family="Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="2" fill="#f8e8c1">${labels[index]}</text></svg>`);
    return sharp({ create: { width: panelWidth, height: cellHeight, channels: 4, background: '#fff' } })
      .composite([{ input: labelSvg, top: 0, left: 0 }, { input: artwork, top: headerHeight, left: 0 }])
      .png().toBuffer();
  }));
  const sheet = await sharp({ create: { width: panelWidth * 2, height: cellHeight * 2, channels: 4, background: '#fff' } })
    .composite(panels.map((input, index) => ({
      input, left: (index % 2) * panelWidth, top: Math.floor(index / 2) * cellHeight,
    }))).png().toBuffer();
  await writeFile(path.join(destination, 'capas-textura-preview.png'), sheet);
}
