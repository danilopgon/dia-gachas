export interface RuntimeConfig {
  port: number;
  corsOrigins: string[];
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

/** Lee y valida las variables de entorno que necesita la API para arrancar. */
export function loadRuntimeConfig(env: NodeJS.ProcessEnv): RuntimeConfig {
  if (!env.AEMET_API_KEY?.trim()) {
    throw new Error('❌ AEMET_API_KEY no está definido en el .env');
  }

  if (!env.CORS_ORIGIN) {
    throw new Error('❌ CORS_ORIGIN no está definido en el .env');
  }

  const corsOrigins = env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (corsOrigins.length === 0) {
    throw new Error('❌ CORS_ORIGIN está vacío');
  }

  return { port: parsePort(env.PORT), corsOrigins };
}
