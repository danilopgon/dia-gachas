import { Catalog } from '../../ingest/catalog/catalog';
import { madridDate } from '../../ingest/snapshot/build-snapshot';
import { Snapshot } from '../../ingest/snapshot/snapshot';
import { SimplifiedData } from '../models/simplified-data';

export const STALE_AFTER_HOURS = 6;
export const UNAVAILABLE_AFTER_HOURS = 24;

export interface Freshness {
  /** Cuándo generó AEMET los datos (ISO, UTC). */
  updatedAt: string;
  /** Cuándo los publicó la ingesta (ISO, UTC). */
  generatedAt: string;
  ageHours: number;
  stale: boolean;
}

export type Lookup =
  | { kind: 'ok'; days: SimplifiedData[]; freshness: Freshness }
  | { kind: 'invalid' }
  | { kind: 'not-found' }
  | {
      kind: 'unavailable';
      reason: 'no-snapshot' | 'too-old' | 'no-today' | 'no-forecast';
    };

const offsetFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Madrid',
  timeZoneName: 'longOffset',
});

// Desfase de Madrid respecto a UTC (en ms) en un instante: «GMT+01:00» → 3 600 000.
function madridOffsetMs(instant: number): number {
  const name = offsetFormatter
    .formatToParts(new Date(instant))
    .find((part) => part.type === 'timeZoneName')?.value;
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name ?? '');
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3])) * 60_000;
}

/** Instante UTC de una hora local de Madrid sin zona, como el `elaborado` de AEMET. */
export function madridLocalToUtc(local: string): Date {
  const asUtc = Date.parse(`${local}Z`);
  // Se recalcula el desfase en el instante resultante para acertar en los cambios de hora.
  const first = asUtc - madridOffsetMs(asUtc);
  return new Date(asUtc - madridOffsetMs(first));
}

const ageInHours = (snapshot: Snapshot, now: Date) =>
  (now.getTime() - madridLocalToUtc(snapshot.sourceElaborado).getTime()) /
  3_600_000;

/** Antigüedad del snapshot medida desde que AEMET generó los datos. */
export function lookupFreshness(snapshot: Snapshot, now: Date): Freshness {
  const ageHours = ageInHours(snapshot, now);
  return {
    updatedAt: madridLocalToUtc(snapshot.sourceElaborado).toISOString(),
    generatedAt: snapshot.generatedAt,
    ageHours: Math.round(ageHours * 10) / 10,
    stale: ageHours >= STALE_AFTER_HOURS,
  };
}

/** Previsión de un municipio desde el snapshot vigente, con su frescura. */
export function lookupForecast(
  code: string,
  snapshot: Snapshot | null,
  catalog: Catalog,
  now: Date,
): Lookup {
  if (!/^\d{5}$/.test(code)) return { kind: 'invalid' };
  if (!catalog.towns.has(code)) return { kind: 'not-found' };
  if (!snapshot) return { kind: 'unavailable', reason: 'no-snapshot' };

  if (ageInHours(snapshot, now) > UNAVAILABLE_AFTER_HOURS) {
    return { kind: 'unavailable', reason: 'too-old' };
  }

  const days = snapshot.towns[code];
  if (!days) return { kind: 'unavailable', reason: 'no-forecast' };

  // Hoy se elige por fecha: tras medianoche, el «mañana» del snapshot es el hoy nuevo.
  const today = madridDate(now);
  const fromToday = days.filter((d) => d.date >= today);
  if (fromToday[0]?.date !== today)
    return { kind: 'unavailable', reason: 'no-today' };

  return {
    kind: 'ok',
    days: fromToday,
    freshness: lookupFreshness(snapshot, now),
  };
}
