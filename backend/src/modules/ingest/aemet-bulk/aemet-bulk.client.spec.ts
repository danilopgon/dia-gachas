import {
  AEMET_BULK_URL,
  AemetBulkClient,
  AemetBulkError,
} from './aemet-bulk.client';

const DATOS_URL = 'https://opendata.aemet.es/opendata/sh/datos';
const TAR_GZ = Buffer.from([0x1f, 0x8b, 1, 2, 3]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
const binary = () => new Response(TAR_GZ, { status: 200 });
const ok = () => json({ estado: 200, descripcion: 'exito', datos: DATOS_URL });

function setup(responses: (Response | Error | DOMException)[]) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchFn = jest.fn(
    async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      const next = responses.shift();
      if (!next) throw new Error('fetch inesperado');
      if (!(next instanceof Response)) throw next;
      return next;
    },
  ) as unknown as typeof fetch;
  const sleeps: number[] = [];
  const sleep = jest.fn(async (ms: number) => {
    sleeps.push(ms);
  });
  const client = new AemetBulkClient('clave', fetchFn, sleep);
  const step1Calls = () => calls.filter((c) => c.url === AEMET_BULK_URL).length;
  return { client, calls, sleeps, step1Calls };
}

const failure = async (promise: Promise<unknown>) => {
  const error = await promise.catch((e) => e);
  expect(error).toBeInstanceOf(AemetBulkError);
  return (error as AemetBulkError).kind;
};

describe('AemetBulkClient', () => {
  it('descarga el tar.gz en dos pasos y solo envía la clave al primero', async () => {
    const { client, calls } = setup([ok(), binary()]);
    await expect(client.download()).resolves.toEqual(TAR_GZ);
    expect(calls.map((c) => c.url)).toEqual([AEMET_BULK_URL, DATOS_URL]);
    expect(new Headers(calls[0].init?.headers).get('api_key')).toBe('clave');
    expect(new Headers(calls[1].init?.headers).get('api_key')).toBeNull();
    expect(calls.every((c) => c.init?.signal instanceof AbortSignal)).toBe(
      true,
    );
  });

  it('no reintenta una clave rechazada (estado 401 con HTTP 200)', async () => {
    const { client, step1Calls } = setup([
      json({ estado: 401, descripcion: 'API key invalido' }),
    ]);
    expect(await failure(client.download())).toBe('unauthorized');
    expect(step1Calls()).toBe(1);
  });

  it('no reintenta un 404 de AEMET', async () => {
    const { client, step1Calls } = setup([
      json({ estado: 404, descripcion: 'No hay datos' }),
    ]);
    expect(await failure(client.download())).toBe('not-found');
    expect(step1Calls()).toBe(1);
  });

  it('reintenta una sola vez un límite de peticiones (estado 429)', async () => {
    const { client, step1Calls } = setup([
      json({ estado: 429 }),
      json({ estado: 429 }),
    ]);
    expect(await failure(client.download())).toBe('rate-limited');
    expect(step1Calls()).toBe(2);
  });

  it('se recupera de fallos transitorios con pausas de 5 y 15 s', async () => {
    const { client, sleeps } = setup([
      json({}, 503),
      new TypeError('fetch failed'),
      ok(),
      binary(),
    ]);
    await expect(client.download()).resolves.toEqual(TAR_GZ);
    expect(sleeps).toEqual([5_000, 15_000]);
  });

  it('se rinde tras tres fallos transitorios', async () => {
    const abort = new DOMException('timeout', 'TimeoutError');
    const { client, step1Calls } = setup([
      json({}, 502),
      abort,
      new TypeError('fetch failed'),
    ]);
    expect(await failure(client.download())).toBe('transient');
    expect(step1Calls()).toBe(3);
  });

  it('trata como transitorio un fallo al descargar los datos', async () => {
    const { client } = setup([ok(), json({}, 500), ok(), binary()]);
    await expect(client.download()).resolves.toEqual(TAR_GZ);
  });

  it.each([
    ['respuesta que no es JSON', () => new Response('<html>', { status: 200 })],
    ['respuesta sin datos', () => json({ estado: 200 })],
  ])('no reintenta una %s', async (_name, response) => {
    const { client, step1Calls } = setup([response()]);
    expect(await failure(client.download())).toBe('invalid');
    expect(step1Calls()).toBe(1);
  });
});
