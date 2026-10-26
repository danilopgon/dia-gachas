import {
  assignGachasLevel,
  simplifyForecast,
} from '../../weather/domain/forecast';
import { BulkEntry } from '../aemet-bulk/bulk-entry';
import { Catalog } from '../catalog/catalog';
import { Snapshot } from './snapshot';

/** Cobertura mínima del catálogo para publicar un snapshot. */
export const MIN_COVERAGE = 0.99;
const DAYS = 2;

const madridFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Madrid',
});

/** Fecha (YYYY-MM-DD) en Europe/Madrid. */
export function madridDate(now: Date): string {
  return madridFormatter.format(now);
}

export function buildSnapshot(
  entries: (BulkEntry | null)[],
  catalog: Catalog,
  now: Date,
): Snapshot {
  const today = madridDate(now);
  const towns: Snapshot['towns'] = {};
  const ignored: string[] = [];
  let invalidEntries = 0;
  let sourceElaborado = '';

  for (const entry of entries) {
    if (!entry) {
      invalidEntries++;
      continue;
    }
    const place = catalog.towns.get(entry.id);
    if (!place) {
      ignored.push(entry.id);
      continue;
    }

    // Se descartan los días ya pasados en Madrid; si hoy no está, el municipio queda sin previsión.
    const days = entry.days.filter((day) => day.fecha.slice(0, 10) >= today);
    if (days[0]?.fecha.slice(0, 10) !== today) continue;

    towns[entry.id] = assignGachasLevel(
      simplifyForecast(
        days
          .slice(0, DAYS)
          .map((day) => ({ ...day, fecha: day.fecha.slice(0, 10) })),
        { town: place.name, province: place.province },
      ),
    );
    if (entry.elaborado > sourceElaborado) sourceElaborado = entry.elaborado;
  }

  const missing = [...catalog.towns.keys()].filter((id) => !towns[id]).sort();
  return {
    version: 1,
    generatedAt: now.toISOString(),
    sourceElaborado,
    today,
    towns,
    stats: {
      catalog: catalog.towns.size,
      covered: Object.keys(towns).length,
      missing,
      ignored: ignored.sort(),
      invalidEntries,
    },
  };
}

/** Motivos por los que el snapshot no se puede publicar; vacío si es publicable. */
export function validateSnapshot(snapshot: Snapshot): string[] {
  const reasons: string[] = [];
  const { catalog, covered } = snapshot.stats;

  if (covered === 0) {
    reasons.push('El snapshot está vacío');
  } else if (covered / catalog < MIN_COVERAGE) {
    reasons.push(
      `Cobertura insuficiente: ${covered}/${catalog} (${((covered / catalog) * 100).toFixed(1)} %)`,
    );
  }

  const incomplete = Object.entries(snapshot.towns)
    .filter(([, days]) => days.length !== DAYS)
    .map(([id]) => id);
  if (incomplete.length > 0) {
    reasons.push(
      `Municipios sin ${DAYS} días: ${incomplete.slice(0, 10).join(', ')}`,
    );
  }
  return reasons;
}
