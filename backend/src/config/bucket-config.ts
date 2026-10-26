export interface BucketConfig {
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

/** Lee una variable obligatoria; el error nombra la variable, nunca su valor. */
export function requiredEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`❌ ${name} no está definido`);
  return value;
}

/** Credenciales del Railway Bucket de snapshots (variables de referencia de Railway). */
export function loadBucketConfig(env: NodeJS.ProcessEnv): BucketConfig {
  return {
    bucket: requiredEnv(env, 'BUCKET'),
    endpoint: requiredEnv(env, 'ENDPOINT'),
    region: env.REGION?.trim() || 'auto',
    accessKeyId: requiredEnv(env, 'ACCESS_KEY_ID'),
    secretAccessKey: requiredEnv(env, 'SECRET_ACCESS_KEY'),
  };
}
