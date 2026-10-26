import { loadBucketConfig } from './bucket-config';
import { DEFAULT_CATALOG_PATH } from './ingest-config';

export interface RuntimeConfig {
  port: number;
  /** Orígenes exactos o patrones con `*` (previews de Vercel) convertidos en RegExp. */
  corsOrigins: (string | RegExp)[];
  catalogPath: string;
}

const DEFAULT_PORT = 4000;

function parsePort(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') return DEFAULT_PORT;

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`❌ PORT no es un puerto válido: "${raw}"`);
  }
  return port;
}

// `*` cubre un único fragmento de nombre de host (letras, números y guiones), nunca un punto.
function toOrigin(origin: string): string | RegExp {
  if (!origin.includes('*')) return origin;
  const escaped = origin
    .replace(/[.+?^${}()|[\]\\/]/g, '\\$&')
    .replace(/\*/g, '[a-z0-9-]+');
  return new RegExp(`^${escaped}$`);
}

/** Lee y valida las variables de entorno que necesita la API para arrancar. */
export function loadRuntimeConfig(env: NodeJS.ProcessEnv): RuntimeConfig {
  if (!env.CORS_ORIGIN) {
    throw new Error('❌ CORS_ORIGIN no está definido en el .env');
  }

  const corsOrigins = env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    .map(toOrigin);

  if (corsOrigins.length === 0) {
    throw new Error('❌ CORS_ORIGIN está vacío');
  }

  // La API lee el snapshot del bucket: sin sus variables no puede servir previsiones.
  loadBucketConfig(env);

  return {
    port: parsePort(env.PORT),
    corsOrigins,
    catalogPath: env.MUNICIPIOS_PATH?.trim() || DEFAULT_CATALOG_PATH,
  };
}
