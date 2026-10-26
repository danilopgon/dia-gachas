import { loadRuntimeConfig } from './runtime-config';

const validEnv = { AEMET_API_KEY: 'k', CORS_ORIGIN: 'https://a.test' };

describe('loadRuntimeConfig', () => {
  it('usa el puerto 4000 si no hay PORT', () => {
    expect(loadRuntimeConfig(validEnv).port).toBe(4000);
  });

  it('trata PORT vacía como ausente', () => {
    expect(loadRuntimeConfig({ ...validEnv, PORT: '' }).port).toBe(4000);
  });

  it('usa el PORT que inyecta la plataforma', () => {
    expect(loadRuntimeConfig({ ...validEnv, PORT: '8080' }).port).toBe(8080);
  });

  it.each(['abc', '0', '70000', '80.5'])('rechaza PORT=%s', (port) => {
    expect(() => loadRuntimeConfig({ ...validEnv, PORT: port })).toThrow(
      /PORT/,
    );
  });

  it.each([undefined, '   '])(
    'exige AEMET_API_KEY (valor: %p)',
    (AEMET_API_KEY) => {
      expect(() => loadRuntimeConfig({ ...validEnv, AEMET_API_KEY })).toThrow(
        /AEMET_API_KEY/,
      );
    },
  );

  it.each([undefined, ' , '])(
    'exige CORS_ORIGIN (valor: %p)',
    (CORS_ORIGIN) => {
      expect(() => loadRuntimeConfig({ ...validEnv, CORS_ORIGIN })).toThrow(
        /CORS_ORIGIN/,
      );
    },
  );

  it('separa y limpia los orígenes de CORS', () => {
    const { corsOrigins } = loadRuntimeConfig({
      ...validEnv,
      CORS_ORIGIN: ' https://a.test , https://b.test ,',
    });
    expect(corsOrigins).toEqual(['https://a.test', 'https://b.test']);
  });
});
