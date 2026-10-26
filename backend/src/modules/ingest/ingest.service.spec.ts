import { join } from 'node:path';
import { bulkFixture, makeTarGz } from '../../../test/fixtures/make-tar-gz';
import {
  AemetBulkClient,
  AemetBulkError,
} from './aemet-bulk/aemet-bulk.client';
import { Catalog, loadCatalog } from './catalog/catalog';
import { IngestService } from './ingest.service';
import { SnapshotStore } from '../snapshots/snapshot-store';

const NOW = new Date('2026-10-26T15:00:00Z');

const smallCatalog: Catalog = {
  towns: new Map([
    ['02003', { name: 'Albacete', province: 'Albacete' }],
    ['01001', { name: 'Alegría-Dulantzi', province: 'Araba Álava' }],
  ]),
};

function setup({
  download = async () => makeTarGz(bulkFixture()),
  publish = async () => ({
    outcome: 'published' as const,
    key: 'snapshots/x.json.gz',
  }),
  catalog = smallCatalog,
}: {
  download?: () => Promise<Buffer>;
  publish?: SnapshotStore['publish'];
  catalog?: Catalog;
} = {}) {
  const client = { download: jest.fn(download) } as unknown as AemetBulkClient;
  const store = {
    publish: jest.fn(publish),
    readLatest: jest.fn(),
    prune: jest.fn(),
  } as unknown as SnapshotStore;
  return {
    service: new IngestService(
      client,
      store,
      catalog,
      '2027-02-03T14:00:25.000Z',
    ),
    store,
  };
}

describe('IngestService', () => {
  it('publica un snapshot válido', async () => {
    const { service, store } = setup();
    const result = await service.run(NOW);
    expect(result).toMatchObject({
      outcome: 'published',
      covered: 2,
      missing: 0,
      key: 'snapshots/x.json.gz',
    });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(store.publish).toHaveBeenCalledTimes(1);
    const snapshot = (store.publish as jest.Mock).mock.calls[0][0];
    expect(snapshot.towns['01001'][0].town).toBe('Alegría-Dulantzi');
  });

  it('incluye la caducidad de la clave de AEMET en el resultado', async () => {
    const { service } = setup();
    await expect(service.run(NOW)).resolves.toMatchObject({
      aemetKeyExpiresAt: '2027-02-03T14:00:25.000Z',
    });
  });

  it('informa cuando otro snapshot más reciente ya estaba publicado', async () => {
    const { service } = setup({
      publish: async () => ({
        outcome: 'superseded',
        key: 'snapshots/y.json.gz',
      }),
    });
    await expect(service.run(NOW)).resolves.toMatchObject({
      outcome: 'superseded',
    });
  });

  it('no publica si AEMET limita las peticiones', async () => {
    const { service, store } = setup({
      download: async () => {
        throw new AemetBulkError('rate-limited', 'AEMET: 429');
      },
    });
    await expect(service.run(NOW)).resolves.toMatchObject({
      outcome: 'failed',
      failure: 'rate-limited',
    });
    expect(store.publish).not.toHaveBeenCalled();
  });

  it('no publica si el agregado está dañado', async () => {
    const { service, store } = setup({
      download: async () => Buffer.from('no es gzip'),
    });
    await expect(service.run(NOW)).resolves.toMatchObject({
      outcome: 'failed',
      failure: 'invalid',
    });
    expect(store.publish).not.toHaveBeenCalled();
  });

  it('rechaza un snapshot con cobertura insuficiente', async () => {
    const catalog = loadCatalog(
      join(__dirname, '../../../../frontend/public/data/municipios.json'),
    );
    const { service, store } = setup({ catalog });
    const result = await service.run(NOW);
    expect(result.outcome).toBe('rejected');
    expect(result.reasons?.join(' ')).toMatch(/cobertura/i);
    expect(store.publish).not.toHaveBeenCalled();
  });

  it('informa de un fallo del almacén', async () => {
    const { service } = setup({
      publish: async () => {
        throw new Error('S3 caído');
      },
    });
    await expect(service.run(NOW)).resolves.toMatchObject({
      outcome: 'failed',
      failure: 'store',
    });
  });
});
