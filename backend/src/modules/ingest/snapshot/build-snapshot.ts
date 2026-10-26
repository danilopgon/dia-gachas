import {
  assignGachasLevel,
  ForecastDay,
  simplifyForecast,
} from '../../weather/domain/forecast';
import {
  ELABORADO_FORMAT,
  madridDate,
  madridLocalToUtc,
  nextDate,
} from '../../weather/domain/madrid-time';
import { BulkEntry } from '../aemet-bulk/bulk-entry';
import { Catalog } from '../catalog/catalog';
import { Snapshot } from './snapshot';

export { madridDate };

/** Cobertura mínima del catálogo para publicar un snapshot. */
export const MIN_COVERAGE = 0.99;
const DAYS = 2;
// Margen para relojes desajustados entre AEMET y la ingesta.
const MAX_ELABORADO_AHEAD_MS = 60 * 60_000;

const hasLaunchTemperature = (day: ForecastDay) =>
  (day.temperatura?.dato ?? []).some(
    (d) => (d.hora === 12 || d.hora === 18) && Number.isFinite(d.value),
  );

export function buildSnapshot(
  entries: (BulkEntry | null)[],
  catalog: Catalog,
  now: Date,
): Snapshot {
  const today = madridDate(now);
  const tomorrow = nextDate(today);
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
    const days = entry.days
      .filter((day) => day.fecha.slice(0, 10) >= today)
      .slice(0, DAYS);
    if (days[0]?.fecha.slice(0, 10) !== today) continue;
    // Los días lejanos del agregado solo traen máximas y mínimas: sin la temperatura de las
    // 12 o las 18 h las reglas puntuarían 0 °C como frío, así que el municipio queda sin previsión.
    if (days.length < DAYS || !days.every(hasLaunchTemperature)) continue;
    // El contrato es [hoy, mañana]: si AEMET omite mañana no se acepta el día siguiente en su lugar.
    if (days[1].fecha.slice(0, 10) !== tomorrow) continue;

    towns[entry.id] = assignGachasLevel(
      simplifyForecast(
        days
          .slice(0, DAYS)
          .map((day) => ({ ...day, fecha: day.fecha.slice(0, 10) })),
        { town: place.name, province: place.province },
      ),
    );
    // Solo cuenta un elaborado con el formato de AEMET (hora local sin zona): otro texto no se compara bien.
    if (
      ELABORADO_FORMAT.test(entry.elaborado) &&
      entry.elaborado > sourceElaborado
    ) {
      sourceElaborado = entry.elaborado;
    }
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

  const elaborado = madridLocalToUtc(snapshot.sourceElaborado).getTime();
  if (Number.isNaN(elaborado)) {
    reasons.push(`Fecha de elaborado no válida: "${snapshot.sourceElaborado}"`);
  } else if (
    elaborado >
    Date.parse(snapshot.generatedAt) + MAX_ELABORADO_AHEAD_MS
  ) {
    reasons.push(
      `Fecha de elaborado en el futuro: ${snapshot.sourceElaborado}`,
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
