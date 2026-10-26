export interface IngestConfig {
  aemetApiKey: string;
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  catalogPath: string;
}

const DEFAULT_CATALOG_PATH = '/app/data/municipios.json';

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  // El mensaje nombra la variable, nunca su valor.
  if (!value) throw new Error(`❌ ${name} no está definido`);
  return value;
}

/** Variables de la ingesta: clave de AEMET, credenciales del Railway Bucket y catálogo. */
export function loadIngestConfig(env: NodeJS.ProcessEnv): IngestConfig {
  return {
    aemetApiKey: required(env, 'AEMET_API_KEY'),
    bucket: required(env, 'BUCKET'),
    endpoint: required(env, 'ENDPOINT'),
    region: env.REGION?.trim() || 'auto',
    accessKeyId: required(env, 'ACCESS_KEY_ID'),
    secretAccessKey: required(env, 'SECRET_ACCESS_KEY'),
    catalogPath: env.MUNICIPIOS_PATH?.trim() || DEFAULT_CATALOG_PATH,
  };
}
