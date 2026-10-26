import { Snapshot } from '../ingest/snapshot/snapshot';
import { LatestPointer, SnapshotStore } from '../snapshots/snapshot-store';
import {
  LOAD_TIMEOUT_MS,
  REFRESH_INTERVAL_MS,
  SnapshotReader,
} from './snapshot-reader';

// Deja que terminen los refrescos lanzados en segundo plano.
const settle = () => new Promise((resolve) => setImmediate(resolve));

const snapshot = (generatedAt: string): Snapshot => ({
  version: 1,
  generatedAt,
  sourceElaborado: '2026-10-26T14:19:08',
  today: '2026-10-26',
  towns: {},
  stats: {
    catalog: 1,
    covered: 1,
    missing: [],
    ignored: [],
    invalidEntries: 0,
  },
});

class FakeStore {
  etag = '"v1"';
  latest: Snapshot | null = snapshot('2026-10-26T15:52:00.000Z');
  failPointer = false;
  failLatest = false;
  readPointer = jest.fn(async () => {
    if (this.failPointer) throw new Error('bucket caído');
    return this.latest
      ? { pointer: { key: 'k' } as LatestPointer, etag: this.etag }
      : null;
  });
  readLatest = jest.fn(async () => {
    if (this.failLatest) throw new Error('puntero roto');
    return this.latest;
  });
}

function setup(store = new FakeStore()) {
  let now = new Date('2026-10-26T16:00:00Z').getTime();
  const reader = new SnapshotReader(
    store as unknown as SnapshotStore,
    () => new Date(now),
  );
  return { reader, store, advance: (ms: number) => (now += ms) };
}

describe('SnapshotReader', () => {
  it('carga el snapshot al arrancar y no vuelve al bucket antes de 5 minutos', async () => {
    const { reader, store, advance } = setup();
    await reader.onModuleInit();
    advance(REFRESH_INTERVAL_MS - 1);
    await expect(reader.current()).resolves.toEqual(store.latest);
    expect(store.readPointer).toHaveBeenCalledTimes(1);
    expect(store.readLatest).toHaveBeenCalledTimes(1);
  });

  it('pasados 5 minutos solo mira el puntero si no ha cambiado', async () => {
    const { reader, store, advance } = setup();
    await reader.onModuleInit();
    advance(REFRESH_INTERVAL_MS);
    await reader.current();
    expect(store.readPointer).toHaveBeenCalledTimes(2);
    expect(store.readLatest).toHaveBeenCalledTimes(1);
  });

  it('descarga el snapshot nuevo cuando cambia el puntero', async () => {
    const { reader, store, advance } = setup();
    await reader.onModuleInit();
    store.etag = '"v2"';
    store.latest = snapshot('2026-10-26T18:10:00.000Z');
    advance(REFRESH_INTERVAL_MS);
    const fresh = store.latest;
    await reader.current();
    await settle();
    await expect(reader.current()).resolves.toEqual(fresh);
  });

  it('conserva el último snapshot bueno si el bucket falla', async () => {
    const { reader, store, advance } = setup();
    await reader.onModuleInit();
    const loaded = store.latest;
    store.failPointer = true;
    advance(REFRESH_INTERVAL_MS);
    await expect(reader.current()).resolves.toEqual(loaded);
    await settle();
    expect(reader.lastError()).toContain('bucket caído');
  });

  it('arranca sin snapshot si el bucket falla y lo reintenta en la siguiente petición', async () => {
    const store = new FakeStore();
    store.failLatest = true;
    const { reader } = setup(store);
    await expect(reader.onModuleInit()).resolves.toBeUndefined();
    await expect(reader.current()).resolves.toBeNull();
    store.failLatest = false;
    await expect(reader.current()).resolves.toEqual(store.latest);
  });

  it('agrupa las peticiones simultáneas en una sola lectura del bucket', async () => {
    const { reader, store, advance } = setup();
    await reader.onModuleInit();
    advance(REFRESH_INTERVAL_MS);
    await Promise.all(Array.from({ length: 20 }, () => reader.current()));
    expect(store.readPointer).toHaveBeenCalledTimes(2);
  });

  it('limpia el error tras un refresco correcto', async () => {
    const { reader, store, advance } = setup();
    await reader.onModuleInit();
    store.failPointer = true;
    advance(REFRESH_INTERVAL_MS);
    await reader.current();
    await settle();
    store.failPointer = false;
    advance(REFRESH_INTERVAL_MS);
    await reader.current();
    await settle();
    expect(reader.lastError()).toBeNull();
  });

  it('no hace esperar a las peticiones si el bucket se cuelga y ya hay snapshot', async () => {
    const { reader, store, advance } = setup();
    await reader.onModuleInit();
    const loaded = store.latest;
    store.readPointer.mockImplementation(() => new Promise(() => undefined));
    advance(REFRESH_INTERVAL_MS);
    const result = await Promise.race([
      reader.current(),
      new Promise((resolve) => setTimeout(() => resolve('bloqueado'), 50)),
    ]);
    expect(result).toEqual(loaded);
  });

  it(`abandona una lectura colgada a los ${LOAD_TIMEOUT_MS / 1000} s`, async () => {
    jest.useFakeTimers();
    try {
      const store = new FakeStore();
      store.readPointer.mockImplementation(() => new Promise(() => undefined));
      const { reader } = setup(store);
      const init = reader.onModuleInit();
      await jest.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS);
      await expect(init).resolves.toBeUndefined();
      expect(reader.lastError()).toMatch(/tiempo/i);
    } finally {
      jest.useRealTimers();
    }
  });
});
