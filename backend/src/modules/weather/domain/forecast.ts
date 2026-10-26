import { GachasLevel } from '../enums/gachas-level.enum';
import { SimplifiedData } from '../models/simplified-data';

/** Subconjunto de un día de predicción de AEMET que usan las reglas de gachas. */
export interface ForecastDay {
  fecha: string;
  temperatura?: { dato?: { hora: number; value?: number }[] };
  probPrecipitacion?: { periodo?: string; value?: number }[];
  estadoCielo?: { periodo?: string; descripcion?: string }[];
}

const RAIN_PERIODS = ['12-18', '12-24', '10-16'];

function toNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

// Media de las 12 y las 18 h; un 0 muy alejado del otro valor se trata como dato ausente.
function correctedMean(a?: number, b?: number, zeroGap = 10): number {
  if (a !== undefined && b === undefined) return Math.round(a);
  if (a === undefined && b !== undefined) return Math.round(b);
  if (a === undefined || b === undefined) return 0;

  if (a === 0 && Math.abs(b - a) > zeroGap) return Math.round(b);
  if (b === 0 && Math.abs(a - b) > zeroGap) return Math.round(a);

  return Math.round((a + b) / 2);
}

function launchTemperature(day: ForecastDay): number {
  const at = (hora: number) =>
    toNumber(day.temperatura?.dato?.find((d) => d.hora === hora)?.value);
  return correctedMean(at(12), at(18));
}

function launchTimeRainProbability(day: ForecastDay): number {
  const slots = day.probPrecipitacion ?? [];
  const slot =
    RAIN_PERIODS.map((periodo) =>
      slots.find((p) => p.periodo === periodo),
    ).find(Boolean) ?? slots.find((p) => !p.periodo);
  return toNumber(slot?.value) ?? 0;
}

function skyStatus(day: ForecastDay): string {
  const descriptions = (day.estadoCielo ?? [])
    .map((e) => e.descripcion?.trim())
    .filter((d): d is string => Boolean(d));
  return descriptions.pop() ?? 'desconocido';
}

/** Resume cada día recibido; quien llama decide cuántos días y qué lugar usar. */
export function simplifyForecast(
  days: ForecastDay[],
  place: { town: string; province: string },
): SimplifiedData[] {
  return days.map((day) => ({
    town: place.town,
    province: place.province,
    date: day.fecha,
    launchTemperature: launchTemperature(day),
    launchTimeRainProbability: launchTimeRainProbability(day),
    skyStatus: skyStatus(day),
  }));
}

function scoreTemperature(temp: number): number {
  if (temp <= 12) return 2;
  if (temp <= 17) return 1;
  if (temp >= 22) return -2;
  if (temp >= 19) return -1;
  return 0;
}

function scoreRain(rain: number): number {
  if (rain >= 60) return 2;
  if (rain >= 40) return 1;
  return 0;
}

function scoreSky(sky: string): number {
  const cloudyKeywords = [
    'nub',
    'lluv',
    'torment',
    'niebla',
    'cubierto',
    'chubasc',
  ];
  const sunnyKeywords = ['despejado', 'soleado'];

  if (cloudyKeywords.some((k) => sky.includes(k))) return 2;
  if (sunnyKeywords.some((k) => sky.includes(k))) return -1;
  return 0;
}

function levelFromScore(score: number): GachasLevel {
  if (score >= 5) return GachasLevel.HIGH;
  if (score >= 3) return GachasLevel.MEDIUM;
  if (score >= 1) return GachasLevel.LOW;
  return GachasLevel.NONE;
}

export function assignGachasLevel(days: SimplifiedData[]): SimplifiedData[] {
  return days.map((day) => {
    const temp = Number.isFinite(day.launchTemperature)
      ? day.launchTemperature
      : 0;
    const rain = Number.isFinite(day.launchTimeRainProbability)
      ? day.launchTimeRainProbability
      : 0;
    const sky = (day.skyStatus ?? 'desconocido').toString().toLowerCase();

    const score = scoreTemperature(temp) + scoreRain(rain) + scoreSky(sky);
    return { ...day, gachasLevel: levelFromScore(score) };
  });
}
