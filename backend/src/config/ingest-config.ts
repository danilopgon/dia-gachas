import { BucketConfig, loadBucketConfig, requiredEnv } from './bucket-config';

export interface IngestConfig extends BucketConfig {
  aemetApiKey: string;
  catalogPath: string;
}

export const DEFAULT_CATALOG_PATH = '/app/data/municipios.json';

/** Variables de la ingesta: clave de AEMET, credenciales del Railway Bucket y catálogo. */
export function loadIngestConfig(env: NodeJS.ProcessEnv): IngestConfig {
  return {
    aemetApiKey: requiredEnv(env, 'AEMET_API_KEY'),
    ...loadBucketConfig(env),
    catalogPath: env.MUNICIPIOS_PATH?.trim() || DEFAULT_CATALOG_PATH,
  };
}

/** Caducidad (ISO) de un JWT como la clave de AEMET, sin exponer el token; undefined si no lo es. */
export function jwtExpiresAt(token: string): string | undefined {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'),
    );
    return typeof payload?.exp === 'number'
      ? new Date(payload.exp * 1000).toISOString()
      : undefined;
  } catch {
    return undefined;
  }
}
