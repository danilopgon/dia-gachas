// Fechas y horas en Europe/Madrid, compartidas por la ingesta y la API.

const madridFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Madrid',
});

/** Día siguiente a una fecha YYYY-MM-DD (aritmética de calendario, sin zona horaria). */
export function nextDate(date: string): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

/** Fecha (YYYY-MM-DD) en Europe/Madrid. */
export function madridDate(now: Date): string {
  return madridFormatter.format(now);
}

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
/** Formato del `elaborado` de AEMET: hora local sin zona horaria. */
export const ELABORADO_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

export function madridLocalToUtc(local: string): Date {
  if (!ELABORADO_FORMAT.test(local)) return new Date(Number.NaN);
  const asUtc = Date.parse(`${local}Z`);
  if (Number.isNaN(asUtc)) return new Date(Number.NaN);
  // Se recalcula el desfase en el instante resultante para acertar en los cambios de hora.
  const first = asUtc - madridOffsetMs(asUtc);
  return new Date(asUtc - madridOffsetMs(first));
}
