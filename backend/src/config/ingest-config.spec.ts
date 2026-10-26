import { jwtExpiresAt, loadIngestConfig } from './ingest-config';

const env = {
  AEMET_API_KEY: 'clave-secreta',
  BUCKET: 'snapshots-abc',
  ENDPOINT: 'https://storage.example',
  ACCESS_KEY_ID: 'id-secreto',
  SECRET_ACCESS_KEY: 'secreto-secreto',
};

describe('loadIngestConfig', () => {
  it('lee la configuración con valores por defecto', () => {
    expect(loadIngestConfig(env)).toEqual({
      aemetApiKey: 'clave-secreta',
      bucket: 'snapshots-abc',
      endpoint: 'https://storage.example',
      region: 'auto',
      accessKeyId: 'id-secreto',
      secretAccessKey: 'secreto-secreto',
      catalogPath: '/app/data/municipios.json',
    });
  });

  it('respeta REGION y MUNICIPIOS_PATH', () => {
    const config = loadIngestConfig({
      ...env,
      REGION: 'eu',
      MUNICIPIOS_PATH: '/tmp/m.json',
    });
    expect(config).toMatchObject({ region: 'eu', catalogPath: '/tmp/m.json' });
  });

  it.each(Object.keys(env))('exige %s sin mostrar ningún valor', (name) => {
    const partial: Record<string, string> = { ...env, [name]: ' ' };
    let message = '';
    try {
      loadIngestConfig(partial);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain(name);
    for (const value of Object.values(env))
      expect(message).not.toContain(value);
  });
});

describe('jwtExpiresAt', () => {
  const jwt = (payload: object) =>
    [
      'e30',
      Buffer.from(JSON.stringify(payload)).toString('base64url'),
      'firma',
    ].join('.');

  it('devuelve la caducidad de un JWT en ISO', () => {
    expect(jwtExpiresAt(jwt({ exp: 1801663225 }))).toBe(
      '2027-02-03T14:00:25.000Z',
    );
  });

  it.each(['no-es-un-jwt', jwt({ sub: 'x' }), 'a.%%%.c'])(
    'devuelve undefined con %s',
    (token) => {
      expect(jwtExpiresAt(token)).toBeUndefined();
    },
  );
});
