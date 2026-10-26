import { SimplifiedData } from '../../weather/models/simplified-data';

/** Previsión de todos los municipios publicada por la ingesta. */
export interface Snapshot {
  version: 1;
  /** Momento de la ingesta (ISO). */
  generatedAt: string;
  /** El `elaborado` más reciente de AEMET entre las entradas. */
  sourceElaborado: string;
  /** Día de referencia en Europe/Madrid (YYYY-MM-DD). */
  today: string;
  /** Por código de 5 dígitos: [hoy, mañana]. */
  towns: Record<string, SimplifiedData[]>;
  stats: {
    catalog: number;
    covered: number;
    missing: string[];
    ignored: string[];
    invalidEntries: number;
  };
}
