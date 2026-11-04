import { normalizeSearch } from './normalize-search.util';

/** Lo que el cielo animado debe dibujar. Todas las densidades van de 0 a 1. */
export interface WeatherScene {
  sun: boolean;
  cloudCover: number;
  rain: number;
  snow: number;
  fog: number;
  storm: boolean;
  lightning: boolean;
  /** De -1 (frío) a 1 (calor); 0 a la temperatura neutra. */
  warmth: number;
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixColors(from: string, to: string, amount: number): string {
  const a = channels(from);
  const b = channels(to);
  const mixed = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return `#${mixed.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// Colores medidos en las ilustraciones, sin añadir tonos que ellas no tienen: lo demás son
// mezclas de estos. La tinta debe seguir leyéndose sobre todo lo que se pinte detrás del
// texto: el spec comprueba el contraste de nubes y tintes.
export const INK = '#16393a';
export const SKY = '#a8c09c';
export const CREAM = '#f4d390';
export const OCHRE = '#f2a751';
export const TEAL = '#3c7d6d';
export const SUN = '#f26339';
export const SNOW = '#f8e6b8';
// Lleva cielo: sobre las colinas oscuras, un crema puro se vuelve gris sucio.
export const FOG = mixColors(SNOW, SKY, 0.35);
export const COLD_TINT = mixColors(SKY, TEAL, 0.32);
export const HOT_TINT = OCHRE;
export const TINT_MAX_ALPHA = 0.3;
export const CLOUD_COLORS = {
  fair: CREAM,
  fairShade: OCHRE,
  overcast: mixColors(SNOW, SKY, 0.5),
  overcastShade: mixColors(SNOW, SKY, 0.8),
  storm: mixColors(SKY, TEAL, 0.14),
  stormShade: mixColors(SKY, TEAL, 0.24),
};

const NEUTRAL_TEMPERATURE = 15;
const TEMPERATURE_RANGE = 15;
const SUN_MAX_COVER = 0.6;
const STORM_MIN_COVER = 0.85;
const PRECIPITATION_MIN_COVER = 0.65;

// De más a menos específico: «muy nuboso» contiene «nuboso».
const CLOUD_COVER: readonly (readonly [string, number])[] = [
  ['muy nuboso', 0.85],
  ['cubierto', 1],
  ['intervalos', 0.45],
  ['poco nuboso', 0.2],
  ['nubes altas', 0.2],
  ['nuboso', 0.65],
  ['nublado', 0.65],
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const mentions = (text: string, words: readonly string[]) => words.some((w) => text.includes(w));

function precipitation(sky: string, probability: number): number {
  const minimum = sky.includes('escasa') ? 0.25 : 0.4;
  return clamp(Math.max(minimum, probability / 100), 0, 1);
}

/** Traduce los datos de AEMET al contenido de la escena, sin inventar lo que no anuncian. */
export function describeWeather(
  skyStatus: string,
  rainProbability: number,
  temperature: number,
): WeatherScene {
  const sky = normalizeSearch(skyStatus);

  const storm = mentions(sky, ['torment', 'granizo', 'rayos']);
  const snowy = mentions(sky, ['nieve', 'nev']);
  const rainy = !snowy && (storm || mentions(sky, ['lluv', 'chubasc', 'lloviz']));
  const fog = sky.includes('niebla') ? 0.8 : mentions(sky, ['nebl', 'bruma', 'calima']) ? 0.5 : 0;

  let cloudCover = CLOUD_COVER.find(([word]) => sky.includes(word))?.[1] ?? 0;
  if (rainy || snowy) cloudCover = Math.max(cloudCover, PRECIPITATION_MIN_COVER);
  if (storm) cloudCover = Math.max(cloudCover, STORM_MIN_COVER);

  const rain = rainy ? precipitation(sky, rainProbability) : 0;
  const clearSky = mentions(sky, ['despejado', 'soleado']);
  const partlyCloudy = cloudCover > 0 && cloudCover < SUN_MAX_COVER;

  return {
    sun: (clearSky || partlyCloudy) && !rainy && !snowy && fog === 0,
    cloudCover,
    rain: storm ? Math.max(rain, 0.5) : rain,
    snow: snowy ? precipitation(sky, rainProbability) : 0,
    fog,
    storm,
    lightning: storm,
    warmth: clamp((temperature - NEUTRAL_TEMPERATURE) / TEMPERATURE_RANGE, -1, 1),
  };
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
