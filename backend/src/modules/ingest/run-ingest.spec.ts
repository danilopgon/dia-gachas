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
});
