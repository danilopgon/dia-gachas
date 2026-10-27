import { Logger } from '@nestjs/common';
import { IngestResult, IngestService } from './ingest.service';
import { SNAPSHOT_STORE } from './ingest.tokens';
import { runIngest } from './run-ingest';
import { SnapshotStore } from '../snapshots/snapshot-store';

const NOW = new Date('2026-10-26T15:52:00Z');

function setup(
  result: IngestResult,
  storeOverrides: Partial<Record<keyof SnapshotStore, jest.Mock>> = {},
) {
  const service = { run: jest.fn(async () => result) };
  const store = {
    publish: jest.fn(),
    readLatest: jest.fn(),
    readPointer: jest.fn(),
    readRunStatus: jest.fn(),
    writeRunStatus: jest.fn(async () => undefined),
    probeConditionalWrites: jest.fn(async () => 'supported' as const),
    prune: jest.fn(async () => 0),
    ...storeOverrides,
  };
  const app = {
    get: (token: unknown) =>
      token === IngestService
        ? service
        : token === SNAPSHOT_STORE
          ? store
          : undefined,
  };
  return { app, store };
}

const published: IngestResult = {
  outcome: 'published',
  durationMs: 3700,
  covered: 8120,
  missing: 2,
  key: 'k',
};

describe('runIngest', () => {
  it.each([
    [published, 0],
    [{ outcome: 'superseded', durationMs: 1 } as IngestResult, 0],
    [{ outcome: 'unchanged', durationMs: 1 } as IngestResult, 0],
    [
      {
        outcome: 'rejected',
        durationMs: 1,
        reasons: ['Cobertura'],
      } as IngestResult,
      1,
    ],
    [
      {
        outcome: 'failed',
        durationMs: 1,
        failure: 'rate-limited',
      } as IngestResult,
      1,
    ],
  ])(
    'guarda el estado y devuelve el código de salida (%o → %i)',
    async (result, code) => {
      const { app, store } = setup(result);
      await expect(runIngest(app as never, NOW)).resolves.toBe(code);
      expect(store.writeRunStatus).toHaveBeenCalledWith({
        ...result,
        finishedAt: expect.any(String),
        conditionalWrites: 'supported',
      });
    },
  );

  it('solo poda tras publicar', async () => {
    const rejected = setup({ outcome: 'rejected', durationMs: 1 });
    await runIngest(rejected.app as never, NOW);
    expect(rejected.store.prune).not.toHaveBeenCalled();

    const ok = setup(published);
    await runIngest(ok.app as never, NOW);
    expect(ok.store.prune).toHaveBeenCalledWith(NOW, 7);
  });

  it('marca la prueba de escrituras condicionales como unknown si falla', async () => {
    const { app, store } = setup(published, {
      probeConditionalWrites: jest.fn(async () => {
        throw new Error('S3 caído');
      }),
    });
    await expect(runIngest(app as never, NOW)).resolves.toBe(0);
    expect(store.writeRunStatus).toHaveBeenCalledWith(
      expect.objectContaining({ conditionalWrites: 'unknown' }),
    );
  });

  it('no cambia el código de salida si fallan el estado o la poda', async () => {
    const { app } = setup(published, {
      writeRunStatus: jest.fn(async () => {
        throw new Error('S3 caído');
      }),
      prune: jest.fn(async () => {
        throw new Error('S3 caído');
      }),
    });
    await expect(runIngest(app as never, NOW)).resolves.toBe(0);
  });

  describe('aviso de caducidad de la clave de AEMET', () => {
    let warn: jest.SpyInstance;
    beforeEach(() => {
      warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    });
    afterEach(() => warn.mockRestore());

    const keyWarnings = () =>
      warn.mock.calls
        .map(([message]) => String(message))
        .filter((message) => message.includes('clave de AEMET'));

    const withKey = (aemetKeyExpiresAt?: string): IngestResult => ({
      outcome: 'unchanged',
      durationMs: 1,
      aemetKeyExpiresAt,
    });

    it('avisa si caduca en menos de 30 días, sin cambiar el código de salida', async () => {
      const { app } = setup(withKey('2026-11-24T15:52:00.000Z'));
      await expect(runIngest(app as never, NOW)).resolves.toBe(0);
      expect(keyWarnings()).toEqual([
        expect.stringContaining(
          'La clave de AEMET caduca el 2026-11-24 (en 29 días)',
        ),
      ]);
      expect(keyWarnings()[0]).toContain(
        'https://opendata.aemet.es/centrodedescargas/altaUsuario',
      );
    });

    it('no avisa si quedan 30 días o más', async () => {
      const { app } = setup(withKey('2026-11-25T15:52:00.000Z'));
      await runIngest(app as never, NOW);
      expect(keyWarnings()).toEqual([]);
    });

    it('avisa justo por debajo de 30 días', async () => {
      const { app } = setup(withKey('2026-11-25T13:00:00.000Z'));
      await runIngest(app as never, NOW);
      expect(keyWarnings()).toEqual([expect.stringContaining('(en 30 días)')]);
    });

    it('da la fecha en hora de Madrid y en singular el último día', async () => {
      // 23:30 UTC del 26 de octubre son las 00:30 del 27 en Madrid.
      const { app } = setup(withKey('2026-10-26T23:30:00.000Z'));
      await runIngest(app as never, NOW);
      expect(keyWarnings()).toEqual([
        expect.stringContaining('caduca el 2026-10-27 (en 1 día)'),
      ]);
    });

    it('no avisa si la fecha no es válida', async () => {
      const { app } = setup(withKey('no-es-fecha'));
      await runIngest(app as never, NOW);
      expect(keyWarnings()).toEqual([]);
    });

    it('avisa si ya ha caducado', async () => {
      const { app } = setup({
        ...withKey('2026-10-20T10:00:00.000Z'),
        outcome: 'failed',
        failure: 'unauthorized',
      } as IngestResult);
      await expect(runIngest(app as never, NOW)).resolves.toBe(1);
      expect(keyWarnings()).toEqual([
        expect.stringContaining('La clave de AEMET caducó el 2026-10-20'),
      ]);
    });

    it('no avisa si no se conoce la caducidad', async () => {
      const { app } = setup(withKey(undefined));
      await runIngest(app as never, NOW);
      expect(keyWarnings()).toEqual([]);
    });
  });
});
