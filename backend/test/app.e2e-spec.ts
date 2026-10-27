import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { parseBulkEntry } from '../src/modules/ingest/aemet-bulk/bulk-entry';
import { loadCatalog } from '../src/modules/ingest/catalog/catalog';
import { IngestService } from '../src/modules/ingest/ingest.service';
import { buildSnapshot } from '../src/modules/ingest/snapshot/build-snapshot';
import { Snapshot } from '../src/modules/ingest/snapshot/snapshot';
import { RunStatus } from '../src/modules/snapshots/snapshot-store';
import { SNAPSHOT_STORE } from '../src/modules/snapshots/snapshots.tokens';
import { CLOCK } from '../src/modules/weather/snapshot-reader';
import { bulkFixture } from './fixtures/make-tar-gz';

const CATALOG_PATH = join(
  __dirname,
  '../../frontend/public/data/municipios.json',
);
// 16:00 del 26 de octubre de 2026 en Madrid.
const NOW = new Date('2026-10-26T15:00:00Z');
const ORIGIN = 'https://diadegachas.danilopgon.com';

function snapshot(): Snapshot {
  const entries = Object.values(bulkFixture()).map((raw) =>
    parseBulkEntry(Buffer.from(raw)),
  );
  const chillaron = { ...entries[0]!, id: '16023' };
  return buildSnapshot([...entries, chillaron], loadCatalog(CATALOG_PATH), NOW);
}

const RUN: RunStatus = {
  outcome: 'published',
  finishedAt: '2026-10-26T15:52:04.000Z',
  durationMs: 3730,
  covered: 3,
  missing: 8119,
  conditionalWrites: 'supported',
};

function storeWith(latest: () => Promise<Snapshot | null>) {
  return {
    readPointer: async () => ({ pointer: { key: 'k' }, etag: '"v1"' }),
    readLatest: latest,
    readRunStatus: async () => RUN,
  };
}

async function createApp(store: object): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(SNAPSHOT_STORE)
    .useValue(store)
    .overrideProvider(CLOCK)
    .useValue(() => NOW)
    .compile();
  const app = moduleRef.createNestApplication();
  configureApp(app, [ORIGIN, 'https://otro.example']);
  await app.init();
  return app;
}

beforeAll(() => {
  delete process.env.DATABASE_URL;
  delete process.env.AEMET_API_KEY;
  process.env.MUNICIPIOS_PATH = CATALOG_PATH;
});

describe('API servida desde el snapshot (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    const latest = snapshot();
    app = await createApp(storeWith(async () => latest));
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /weather/:code sirve hoy y mañana con su frescura', async () => {
    const { body } = await http().get('/weather/02003').expect(200);
    expect(body.status).toBe('ok');
    expect(body.data.map((d: { date: string }) => d.date)).toEqual([
      '2026-10-26',
      '2026-10-27',
    ]);
    expect(body.data[0]).toMatchObject({
      town: 'Albacete',
      province: 'Albacete',
    });
    expect(body.meta).toEqual({
      updatedAt: '2026-10-26T13:19:08.000Z',
      generatedAt: NOW.toISOString(),
      ageHours: 1.7,
      stale: false,
    });
  });

  it('usa los nombres del catálogo, no los de AEMET', async () => {
    const { body } = await http().get('/weather/16023').expect(200);
    expect(body.data[0].town).toBe('Chillarón de Cuenca');
  });

  it.each([
    ['abc', 400, 'Código de municipio no válido'],
    ['99999', 404, 'Municipio no encontrado'],
    ['36011', 503, 'Previsión no disponible ahora mismo'],
  ])('GET /weather/%s responde %i', async (code, status, message) => {
    await http()
      .get(`/weather/${code}`)
      .expect(status, { status: 'error', message });
  });

  it.each(['99999', '36011'])('los errores (%s) llevan CORS', async (code) => {
    const response = await http().get(`/weather/${code}`).set('Origin', ORIGIN);
    expect(response.headers['access-control-allow-origin']).toBe(ORIGIN);
  });

  it('no da CORS a un origen no permitido', async () => {
    const response = await http()
      .get('/weather/16023')
      .set('Origin', 'https://www.diadegachas.com');
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('POST /weather responde igual que el GET', async () => {
    const get = await http().get('/weather/02003');
    const post = await http()
      .post('/weather')
      .send({ townCode: '003', provinceCode: '02' })
      .expect(201);
    expect(post.body).toEqual(get.body);
  });

  it('POST /weather sin códigos responde 400', async () => {
    await http().post('/weather').send({}).expect(400);
  });

  it('GET /status muestra el snapshot y la última ingesta', async () => {
    const { body } = await http().get('/status').expect(200);
    expect(body).toEqual({
      status: 'ok',
      snapshot: {
        generatedAt: NOW.toISOString(),
        updatedAt: '2026-10-26T13:19:08.000Z',
        ageHours: 1.7,
        stale: false,
        covered: 3,
        missing: 8119,
      },
      lastRun: RUN,
      readerError: null,
    });
  });

  it('GET /health responde ok', async () => {
    await http().get('/health').expect(200, { status: 'ok' });
  });

  it('ya no expone /cities', async () => {
    await http().get('/cities?name=alb').expect(404);
  });

  it('la API no carga la ingesta', () => {
    expect(() => app.get(IngestService, { strict: false })).toThrow();
  });
});

describe('API con el bucket caído al arrancar (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp(
      storeWith(async () => {
        throw new Error('bucket caído');
      }),
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  it('arranca, responde a /health y da 503 en /weather', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
    await request(app.getHttpServer()).get('/weather/02003').expect(503);
  });

  it('/status informa del error del lector', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/status')
      .expect(200);
    expect(body.snapshot).toBeNull();
    expect(body.readerError).toContain('bucket caído');
  });
});
