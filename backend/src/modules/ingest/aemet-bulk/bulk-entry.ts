import { ForecastDay } from '../../weather/domain/forecast';

/** Predicción de un municipio tal como sale del agregado, ya en el formato de las reglas. */
export interface BulkEntry {
  id: string;
  elaborado: string;
  days: ForecastDay[];
}

// Al convertir el XML de AEMET a JSON, los arrays de un elemento llegan sueltos.
const toArray = <T>(value: T | T[] | undefined | null): T[] =>
  value === undefined || value === null
    ? []
    : Array.isArray(value)
      ? value
      : [value];

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

type RawSlot =
  { periodo?: string; valor?: string; descripcion?: string } | string;

// En los días lejanos un tramo puede ser un valor suelto, sin periodo.
const slot = (raw: RawSlot) => (typeof raw === 'object' ? raw : { valor: raw });

function toForecastDay(raw: any): ForecastDay {
  return {
    fecha: String(raw.fecha),
    temperatura: {
      dato: toArray<{ hora: string; valor?: string }>(
        raw.temperatura?.dato,
      ).map((d) => ({
        hora: Number(d.hora),
        value: toNumber(d.valor),
      })),
    },
    probPrecipitacion: toArray<RawSlot>(raw.prob_precipitacion)
      .map(slot)
      .map((p) => ({ periodo: p.periodo, value: toNumber(p.valor) })),
    estadoCielo: toArray<RawSlot>(raw.estado_cielo)
      .map(slot)
      .map((e) => ({ periodo: e.periodo, descripcion: e.descripcion })),
  };
}

/** Adapta una entrada del tar; devuelve null si no se puede usar. No lee nombre ni provincia. */
export function parseBulkEntry(raw: Buffer): BulkEntry | null {
  let json: any;
  try {
    json = JSON.parse(raw.toString('utf8'));
  } catch {
    return null;
  }

  const root = json?.root ?? json;
  if (typeof root?.id !== 'string' || !root.prediccion) return null;

  return {
    id: root.id,
    elaborado: String(root.elaborado ?? ''),
    days: toArray(root.prediccion.dia).map(toForecastDay),
  };
}
