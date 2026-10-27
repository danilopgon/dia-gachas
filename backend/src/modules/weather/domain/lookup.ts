import { Catalog } from '../../ingest/catalog/catalog';
import { madridDate, madridLocalToUtc } from './madrid-time';

import { Snapshot } from '../../ingest/snapshot/snapshot';
import { SimplifiedData } from '../models/simplified-data';

export { ELABORADO_FORMAT, madridLocalToUtc } from './madrid-time';

// AEMET regenera el agregado una vez al día (por la tarde): los umbrales dejan margen a un retraso.
export const STALE_AFTER_HOURS = 30;
export const UNAVAILABLE_AFTER_HOURS = 48;

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

// Un elaborado ilegible cuenta como infinitamente antiguo: nunca se sirven datos de fecha dudosa.
const ageInHours = (snapshot: Snapshot, now: Date) => {
  const updatedAt = madridLocalToUtc(snapshot.sourceElaborado).getTime();
  return Number.isNaN(updatedAt)
    ? Infinity
    : (now.getTime() - updatedAt) / 3_600_000;
};

/** Antigüedad del snapshot medida desde que AEMET generó los datos. */
export function lookupFreshness(snapshot: Snapshot, now: Date): Freshness {
  const ageHours = ageInHours(snapshot, now);
  return {
    updatedAt: Number.isFinite(ageHours)
      ? madridLocalToUtc(snapshot.sourceElaborado).toISOString()
      : snapshot.sourceElaborado,
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
