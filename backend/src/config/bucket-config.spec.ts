import { loadBucketConfig } from './bucket-config';

const env = {
  BUCKET: 'snapshots-abc',
  ENDPOINT: 'https://storage.example',
  ACCESS_KEY_ID: 'id-secreto',
  SECRET_ACCESS_KEY: 'secreto-secreto',
};

describe('loadBucketConfig', () => {
  it('lee las variables del bucket con región auto por defecto', () => {
    expect(loadBucketConfig(env)).toEqual({
      bucket: 'snapshots-abc',
      endpoint: 'https://storage.example',
      region: 'auto',
      accessKeyId: 'id-secreto',
      secretAccessKey: 'secreto-secreto',
    });
  });

  it.each(Object.keys(env))('exige %s sin mostrar ningún valor', (name) => {
    const message = (() => {
      try {
        loadBucketConfig({ ...env, [name]: '' });
        return '';
      } catch (error) {
        return (error as Error).message;
      }
    })();
    expect(message).toContain(name);
    for (const value of Object.values(env))
      expect(message).not.toContain(value);
  });
});
