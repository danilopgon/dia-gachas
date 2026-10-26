import { loadRuntimeConfig } from './runtime-config';

const validEnv = {
  CORS_ORIGIN: 'https://a.test',
  BUCKET: 'b',
  ENDPOINT: 'https://storage.example',
  ACCESS_KEY_ID: 'id',
  SECRET_ACCESS_KEY: 'secreto',
};

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

  it('ya no exige AEMET_API_KEY: la API no consulta AEMET', () => {
    expect(() => loadRuntimeConfig(validEnv)).not.toThrow();
  });

  it.each(['BUCKET', 'ENDPOINT', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY'])(
    'exige %s',
    (name) => {
      expect(() => loadRuntimeConfig({ ...validEnv, [name]: '' })).toThrow(
        new RegExp(name),
      );
    },
  );

  it('usa el catálogo de la imagen por defecto y respeta MUNICIPIOS_PATH', () => {
    expect(loadRuntimeConfig(validEnv).catalogPath).toBe(
      '/app/data/municipios.json',
    );
    expect(
      loadRuntimeConfig({ ...validEnv, MUNICIPIOS_PATH: '/tmp/m.json' })
        .catalogPath,
    ).toBe('/tmp/m.json');
  });

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

  describe('orígenes con patrón (previews de Vercel)', () => {
    const pattern = () => {
      const { corsOrigins } = loadRuntimeConfig({
        ...validEnv,
        CORS_ORIGIN:
          'https://a.test,https://dia-de-gachas-*-danilopgons-projects.vercel.app',
      });
      return corsOrigins[1] as RegExp;
    };

    it('convierte * en una expresión regular anclada', () => {
      expect(pattern()).toBeInstanceOf(RegExp);
      expect(
        pattern().test(
          'https://dia-de-gachas-abc123-danilopgons-projects.vercel.app',
        ),
      ).toBe(true);
    });

    it.each([
      'https://evil.vercel.app',
      'https://dia-de-gachas-x-danilopgons-projects.vercel.app.evil.com',
      'https://dia-de-gachas-a.b-danilopgons-projects.vercel.app',
      'http://dia-de-gachas-abc-danilopgons-projects.vercel.app',
    ])('rechaza %s', (origin) => {
      expect(pattern().test(origin)).toBe(false);
    });
  });
});
