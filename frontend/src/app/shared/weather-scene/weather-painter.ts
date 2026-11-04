import {
  CLOUD_COLORS,
  COLD_TINT,
  FOG,
  HOT_TINT,
  INK,
  SNOW,
  SUN,
  TINT_MAX_ALPHA,
  WeatherScene,
} from '../../core/utils/weather-scene.util';

/** Hasta aquí dura la entrada escalonada; luego solo queda el movimiento continuo. */
const ENTRANCE_SECONDS = 2.2;
const TINT_SECONDS = 1.2;
const SUN_SECONDS = 1.3;
const CLOUD_SECONDS = 1.1;
const CLOUD_STAGGER = 0.1;
const CEILING_SECONDS = 1;
const SOFT_FADE_SECONDS = 1.2;

const MAX_DPR = 1.5;
/** Área de referencia para que la densidad de partículas no dependa de la pantalla. */
const REFERENCE_AREA = 1440 * 900;
const MAX_RAIN = 420;
const MAX_SNOW = 170;
/** En pantallas pequeñas el clima debe seguir viéndose: la densidad no baja de aquí. */
const MIN_AREA_SCALE = 0.55;
const RAIN_SLANT = 0.24;
const CEILING_FROM_COVER = 0.8;

// Un destello tenue, breve y muy espaciado: dos pulsos cada 7 s o más, lejos de los 3 por
// segundo de WCAG 2.3.1.
const FLASH_SECONDS = 0.45;
const FLASH_PEAK_ALPHA = 0.2;
const FLASH_MIN_GAP = 7;
const FLASH_MAX_GAP = 14;

// Grano medido en la ilustración: fino, píxel a píxel y con motas oscuras. Como en ella, los
// colores saturados llevan mucho y lo que se acerca al cielo casi nada; si no, parece estática.
const GRAIN_TILE = 256;
const GRAIN_TILE_ALPHA = 0.16;
const GRAIN_SPECK_CHANCE = 0.05;
// Una misma mota oscura pesa más sobre crema que sobre rojo: por eso el sol recibe una pasada extra.
const GRAIN_ALPHA = { sunExtra: 0.22, fair: 0.24, pale: 0.14 };

interface Sprite {
  image: HTMLCanvasElement;
  width: number;
  height: number;
}

interface Cloud {
  sprite: Sprite;
  x: number;
  y: number;
  speed: number;
  phase: number;
  delay: number;
}

interface FogBand {
  sprite: Sprite;
  x: number;
  y: number;
  speed: number;
  phase: number;
}

interface Drop {
  x: number;
  y: number;
  speed: number;
  size: number;
  phase: number;
}

const random = (min: number, max: number) => min + Math.random() * (max - min);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
/** Pasa un poco de largo y se asienta: el recorte de papel llega con algo de peso. */
const easeOutBack = (t: number) => {
  const overshoot = 1.2;
  const u = t - 1;
  return 1 + (overshoot + 1) * u ** 3 + overshoot * u ** 2;
};

/** Lienzo a resolución de dispositivo; se dibuja en él en píxeles CSS. */
function createCanvas(width: number, height: number, dpr: number) {
  const image = document.createElement('canvas');
  image.width = Math.ceil(width * dpr);
  image.height = Math.ceil(height * dpr);
  const ctx = image.getContext('2d');
  ctx?.scale(dpr, dpr);
  return { image, ctx };
}

const toSprite = (image: HTMLCanvasElement, dpr: number): Sprite => ({
  image,
  width: image.width / dpr,
  height: image.height / dpr,
});

/** Una baldosa de ruido: píxeles oscuros y claros sobre transparente. */
function makeGrainTile(): HTMLCanvasElement | null {
  const image = document.createElement('canvas');
  image.width = image.height = GRAIN_TILE;
  const ctx = image.getContext('2d');
  if (!ctx) return null;
  const pixels = ctx.createImageData(GRAIN_TILE, GRAIN_TILE);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    let amount = (Math.random() + Math.random() + Math.random() - 1.5) * 2 * GRAIN_TILE_ALPHA;
    if (Math.random() < GRAIN_SPECK_CHANCE) amount -= Math.random() * GRAIN_TILE_ALPHA * 2.8;
    const shade = amount < 0 ? 0 : 255;
    data[i] = data[i + 1] = data[i + 2] = shade;
    data[i + 3] = Math.min(255, Math.abs(amount) * 255);
  }
  ctx.putImageData(pixels, 0, 0);
  return image;
}

function traceCloud(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Las medidas dejan dentro del sprite hasta el bulto más alto: nunca una nube de techo plano.
  const base = height * 0.78;
  const radius = base / 2.4;
  ctx.beginPath();
  ctx.roundRect(0, base - radius * 1.1, width, radius * 1.1, radius * 0.55);
  ctx.fill();
  const bumps = Math.max(3, Math.round(width / (height * 0.55)));
  for (let i = 0; i < bumps; i++) {
    const u = (i + 0.5) / bumps;
    const r = radius * (0.6 + Math.sin(u * Math.PI) * 0.45) * random(0.88, 1.12);
    ctx.beginPath();
    ctx.arc(u * width, base - r * 0.8, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function makeCloud(
  width: number,
  height: number,
  color: string,
  shade: string,
  dpr: number,
): Sprite | null {
  const padding = height * 0.1;
  const { image, ctx } = createCanvas(width, height + padding, dpr);
  if (!ctx) return null;
  const inset = width * 0.04;
  ctx.translate(inset, 0);
  ctx.fillStyle = shade;
  ctx.save();
  ctx.translate(0, padding);
  traceCloud(ctx, width - inset * 2, height);
  ctx.restore();
  ctx.fillStyle = color;
  traceCloud(ctx, width - inset * 2, height);
  return toSprite(image, dpr);
}

/** El techo de nubes: una franja festoneada que se repite sin costura en horizontal. */
function makeCeiling(
  width: number,
  height: number,
  color: string,
  shade: string,
  dpr: number,
): Sprite | null {
  const { image, ctx } = createCanvas(width, height, dpr);
  if (!ctx) return null;
  // El festón se mide por el alto para que ningún bulto toque el borde inferior del sprite.
  const maxRadius = height * 0.28;
  const scallops = Math.max(4, Math.round(width / (maxRadius * 1.5)));
  const step = width / scallops;
  const edge = height * 0.62;
  const paint = (fill: string, offset: number) => {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, width, edge + offset);
    for (let i = 0; i <= scallops; i++) {
      const r = maxRadius * (0.86 + Math.sin((i / scallops) * Math.PI * 6) * 0.14);
      ctx.beginPath();
      ctx.arc(i * step, edge + offset - r * 0.2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  paint(shade, height * 0.05);
  paint(color, 0);
  return toSprite(image, dpr);
}

function makeSun(radius: number, dpr: number): Sprite | null {
  const size = radius * 2;
  const { image, ctx } = createCanvas(size, size, dpr);
  if (!ctx) return null;
  ctx.fillStyle = SUN;
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.fill();
  return toSprite(image, dpr);
}

/** Una banda de niebla ondulada; las ondas son enteras para que el bucle no tenga costura. */
function makeFogBand(width: number, height: number, waves: number, dpr: number): Sprite | null {
  const { image, ctx } = createCanvas(width, height, dpr);
  if (!ctx) return null;
  const amplitude = height * 0.16;
  const edge = (x: number, phase: number) =>
    Math.sin((x / width) * Math.PI * 2 * waves + phase) * amplitude;
  ctx.fillStyle = FOG;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 8) ctx.lineTo(x, amplitude + edge(x, 0));
  for (let x = width; x >= 0; x -= 8) ctx.lineTo(x, height - amplitude + edge(x, 1.7));
  ctx.closePath();
  ctx.fill();
  return toSprite(image, dpr);
}

/** Pinta el tiempo en un canvas. No sabe nada de Angular ni de los datos de AEMET. */
export class WeatherPainter {
  private width = 0;
  private height = 0;
  private dpr = 1;
  private scene: WeatherScene | null = null;
  private elapsed = 0;

  private sun: Sprite | null = null;
  private ceiling: Sprite | null = null;
  private ceilingX = 0;
  private clouds: Cloud[] = [];
  private fogBands: FogBand[] = [];
  private rain: Drop[] = [];
  private snow: Drop[] = [];
  private grainAlpha = 0;
  private readonly grain: CanvasPattern | null;

  private nextFlash = 0;
  private flash = 0;
  private boltX = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
  ) {
    const tile = makeGrainTile();
    this.grain = tile ? ctx.createPattern(tile, 'repeat') : null;
  }

  resize(width: number, height: number, devicePixelRatio: number): void {
    const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
    const widthChanged = width !== this.width || dpr !== this.dpr;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    // La barra del navegador móvil solo cambia el alto: no hace falta rehacer la escena.
    if (widthChanged) this.build();
  }

  setScene(scene: WeatherScene | null, skipEntrance = false): void {
    this.scene = scene;
    this.elapsed = skipEntrance ? ENTRANCE_SECONDS : 0;
    this.nextFlash = random(2, 4);
    this.flash = 0;
    this.build();
  }

  /** Da la entrada por terminada: un fotograma quieto nunca se queda a medias. */
  settle(): void {
    if (this.elapsed >= ENTRANCE_SECONDS) return;
    this.elapsed = ENTRANCE_SECONDS;
    for (const drop of this.rain) {
      if (drop.y < 0) drop.y = random(0, this.height);
    }
  }

  /** Avanza la animación y dibuja. Con `dt` 0 pinta un fotograma quieto. */
  draw(dt: number): void {
    const { ctx, scene, width, height } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (!scene) return;

    this.elapsed += dt;

    this.drawTint(scene);
    this.drawSun();
    if (this.sun) this.drawGrain(GRAIN_ALPHA.sunExtra);
    this.drawClouds(dt);
    this.drawFog(scene, dt);
    this.drawGrain(this.grainAlpha);
    this.drawRain(dt);
    this.drawSnow(dt);
    if (scene.lightning) this.drawLightning(dt);
  }

  /** Avance de 0 a 1 de algo que empieza en `delay` y dura `seconds` desde que llega el dato. */
  private progress(delay: number, seconds: number): number {
    return clamp01((this.elapsed - delay) / seconds);
  }

  private get skyHeight(): number {
    // En el cartel vertical las colinas empiezan más abajo, pero el titular ocupa más.
    return this.height * (this.width > this.height ? 0.5 : 0.56);
  }

  private build(): void {
    const { scene, width, height, dpr } = this;
    this.sun = null;
    this.ceiling = null;
    this.clouds = [];
    this.fogBands = [];
    this.rain = [];
    this.snow = [];
    if (!scene || !width || !height) return;

    const portrait = width <= height;
    const areaScale = Math.max(MIN_AREA_SCALE, (width * height) / REFERENCE_AREA);
    const heavySky = scene.storm || scene.cloudCover >= CEILING_FROM_COVER;
    this.grainAlpha = heavySky || scene.fog > 0 ? GRAIN_ALPHA.pale : GRAIN_ALPHA.fair;

    if (scene.sun) {
      this.sun = makeSun(Math.max(40, Math.min(115, Math.min(width, height) * 0.1)), dpr);
    }

    const colors = scene.storm
      ? [CLOUD_COLORS.storm, CLOUD_COLORS.stormShade]
      : heavySky
        ? [CLOUD_COLORS.overcast, CLOUD_COLORS.overcastShade]
        : [CLOUD_COLORS.fair, CLOUD_COLORS.fairShade];

    if (scene.cloudCover >= CEILING_FROM_COVER) {
      const ceilingHeight = this.skyHeight * 0.55 * scene.cloudCover;
      this.ceiling = makeCeiling(width, ceilingHeight, colors[0], colors[1], dpr);
    }

    const count = scene.cloudCover > 0 ? Math.round(1 + scene.cloudCover * (portrait ? 4 : 7)) : 0;
    const clouds: Cloud[] = [];
    for (let i = 0; i < count; i++) {
      const u = i / Math.max(1, count - 1);
      const depth = random(0.55, 1);
      const cloudWidth = Math.max(150, width * (portrait ? 0.5 : 0.24)) * depth;
      const sprite = makeCloud(cloudWidth, cloudWidth * 0.42, colors[0], colors[1], dpr);
      if (!sprite) continue;
      clouds.push({
        sprite,
        // Repartidas a lo ancho para que una sola nube nunca quede fuera de cuadro.
        x: (i + random(0.1, 0.7)) * (width / count) - sprite.width * 0.2,
        y: random(0.04, 1) * Math.max(10, this.skyHeight - sprite.height) * (0.35 + u * 0.65),
        // Paralaje: lo cercano va más rápido.
        speed: 7 + depth * 14,
        phase: random(0, Math.PI * 2),
        delay: 0,
      });
    }
    // De lejos a cerca: las nubes entran solapadas, no todas a la vez.
    this.clouds = clouds
      .sort((a, b) => a.speed - b.speed)
      .map((cloud, i) => ({ ...cloud, delay: i * CLOUD_STAGGER }));

    if (scene.fog > 0) {
      this.fogBands = [0.46, 0.6, 0.74].flatMap((y, i) => {
        const sprite = makeFogBand(width, height * 0.13, 2 + i, dpr);
        return sprite
          ? [{ sprite, x: random(0, width), y: y * height, speed: i % 2 ? 11 : -8, phase: i * 1.9 }]
          : [];
      });
    }

    // La lluvia empieza a caer desde arriba: nada aparece de golpe a media pantalla.
    const entering = this.elapsed < ENTRANCE_SECONDS;
    this.rain = Array.from({ length: Math.round(scene.rain * MAX_RAIN * areaScale) }, () => {
      const nearness = Math.random();
      return {
        x: random(-height * RAIN_SLANT, width + height * RAIN_SLANT),
        y: entering ? random(-height, 0) : random(0, height),
        // Una gota más cercana cae más rápido y deja un trazo más largo.
        speed: 620 + nearness * 280,
        size: 20 + nearness * 16,
        phase: 0,
      };
    });
    this.snow = Array.from({ length: Math.round(scene.snow * MAX_SNOW * areaScale) }, () => {
      const nearness = Math.random();
      return {
        x: random(0, width),
        y: random(0, height),
        speed: 28 + nearness * 40,
        size: 1.6 + nearness * 2.6,
        phase: random(0, Math.PI * 2),
      };
    });
  }

  private drawTint(scene: WeatherScene): void {
    if (!scene.warmth) return;
    const { ctx, width, height } = this;
    const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.72);
    gradient.addColorStop(0, scene.warmth < 0 ? COLD_TINT : HOT_TINT);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha =
      Math.abs(scene.warmth) * TINT_MAX_ALPHA * easeOut(this.progress(0, TINT_SECONDS));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  private drawSun(): void {
    if (!this.sun) return;
    const { ctx, width, height } = this;
    const size = this.sun.width;
    // En la esquina, recortado si hace falta: el titular ocupa el resto del cielo.
    const landscape = width > height;
    const x = width * (landscape ? 0.9 : 0.86) - size / 2;
    const rest = landscape ? height * 0.13 - size / 2 : -size * 0.42;
    const entrance = easeOutBack(this.progress(0, SUN_SECONDS));
    const hidden = -size - 10;
    const y = hidden + (rest - hidden) * entrance + Math.sin(this.elapsed * 0.7) * 7;
    ctx.drawImage(this.sun.image, x, y, size, this.sun.height);
  }

  private drawClouds(dt: number): void {
    const { ctx, width } = this;
    if (this.ceiling) {
      const { image, width: w, height: h } = this.ceiling;
      this.ceilingX = (this.ceilingX + dt * 6) % w;
      const y = -(1 - easeOut(this.progress(0, CEILING_SECONDS))) * h;
      ctx.drawImage(image, this.ceilingX, y, w, h);
      ctx.drawImage(image, this.ceilingX - w, y, w, h);
    }
    for (const cloud of this.clouds) {
      const { image, width: w, height: h } = cloud.sprite;
      cloud.x += cloud.speed * dt;
      if (cloud.x > width) cloud.x = -w;
      // Entra por donde sopla la deriva y frena hasta su velocidad de crucero.
      const entrance = easeOut(this.progress(cloud.delay, CLOUD_SECONDS));
      const x = cloud.x - (cloud.x + w + 20) * (1 - entrance);
      // Un leve vaivén propio, para que no parezcan piezas sobre un raíl.
      const y = cloud.y + Math.sin(this.elapsed * 0.35 + cloud.phase) * 3;
      ctx.drawImage(image, x, y, w, h);
    }
  }

  private drawFog(scene: WeatherScene, dt: number): void {
    const { ctx, width } = this;
    ctx.globalAlpha = scene.fog * 0.62 * easeOut(this.progress(0, SOFT_FADE_SECONDS));
    for (const band of this.fogBands) {
      const { image, width: w, height: h } = band.sprite;
      band.x = (band.x + band.speed * dt + width) % width;
      const y = band.y + Math.sin(this.elapsed * 0.25 + band.phase) * 5;
      ctx.drawImage(image, band.x, y, w, h);
      ctx.drawImage(image, band.x - width, y, w, h);
    }
    ctx.globalAlpha = 1;
  }

  /**
   * El grano no viaja con las formas: es el papel, fijo en la pantalla y a píxel exacto.
   * Así las formas se mueven con precisión de subpíxel sin emborronarlo ni dar tirones.
   */
  private drawGrain(alpha: number): void {
    if (!this.grain) return;
    const { ctx } = this;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.grain;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
  }

  private drawRain(dt: number): void {
    if (!this.rain.length) return;
    const { ctx, width, height } = this;
    ctx.strokeStyle = INK;
    ctx.globalAlpha = 0.42;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const drop of this.rain) {
      drop.y += drop.speed * dt;
      drop.x -= drop.speed * dt * RAIN_SLANT;
      if (drop.y > height) {
        drop.y = -drop.size;
        drop.x = random(0, width + height * RAIN_SLANT);
      }
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - drop.size * RAIN_SLANT, drop.y + drop.size);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  private drawSnow(dt: number): void {
    if (!this.snow.length) return;
    const { ctx, width, height } = this;
    ctx.globalAlpha = easeOut(this.progress(0, SOFT_FADE_SECONDS));
    ctx.fillStyle = SNOW;
    ctx.beginPath();
    for (const flake of this.snow) {
      flake.y += flake.speed * dt;
      flake.phase += dt * (0.5 + flake.size * 0.15);
      if (flake.y > height) {
        flake.y = -flake.size;
        flake.x = random(0, width);
      }
      const x = flake.x + Math.sin(flake.phase) * (8 + flake.size * 3);
      ctx.moveTo(x + flake.size, flake.y);
      ctx.arc(x, flake.y, flake.size, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /** El golpe es instantáneo y se apaga deprisa, con un segundo pulso más débil. */
  private flashStrength(): number {
    const t = 1 - this.flash / FLASH_SECONDS;
    const first = Math.exp(-t * 9);
    const second = t >= 0.42 ? 0.55 * Math.exp(-(t - 0.42) * 12) : 0;
    return Math.max(first, second);
  }

  private drawLightning(dt: number): void {
    if (dt === 0) return;
    const { ctx, width, height } = this;
    this.nextFlash -= dt;
    if (this.nextFlash <= 0) {
      this.nextFlash = random(FLASH_MIN_GAP, FLASH_MAX_GAP);
      this.flash = FLASH_SECONDS;
      this.boltX = random(width * 0.45, width * 0.9);
    }
    if (this.flash <= 0) return;
    this.flash -= dt;
    const strength = this.flashStrength();

    ctx.globalAlpha = strength * FLASH_PEAK_ALPHA;
    ctx.fillStyle = SNOW;
    ctx.fillRect(0, 0, width, height);

    const top = this.ceiling ? this.ceiling.height * 0.55 : 0;
    const unit = this.skyHeight * 0.13;
    const x = this.boltX;
    ctx.globalAlpha = strength;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + unit * 0.62, top);
    ctx.lineTo(x + unit * 0.22, top + unit * 1.1);
    ctx.lineTo(x + unit * 0.72, top + unit * 1.1);
    ctx.lineTo(x - unit * 0.32, top + unit * 2.8);
    ctx.lineTo(x + unit * 0.02, top + unit * 1.45);
    ctx.lineTo(x - unit * 0.42, top + unit * 1.45);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
