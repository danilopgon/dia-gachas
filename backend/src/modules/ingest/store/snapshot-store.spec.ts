import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { gunzipSync } from 'node:zlib';
import { Snapshot } from '../snapshot/snapshot';
import { LATEST_KEY, S3SnapshotStore } from './snapshot-store';

interface StoredObject {
  body: Buffer;
  etag: string;
  lastModified: Date;
}

/** S3 en memoria con ETags y escrituras condicionales (If-Match / If-None-Match). */
class FakeS3 {
  objects = new Map<string, StoredObject>();
  puts: PutObjectCommand['input'][] = [];
  now = new Date('2026-10-26T15:00:00Z');
  private version = 0;
  conditionalSupported = true;
  failNextPointerWithPrecondition = false;

  async send(command: unknown): Promise<unknown> {
    if (command instanceof PutObjectCommand) return this.put(command.input);
    if (command instanceof GetObjectCommand)
      return this.get(command.input.Key!);
    if (command instanceof ListObjectsV2Command)
      return this.list(command.input.Prefix ?? '');
    if (command instanceof DeleteObjectCommand) {
      this.objects.delete(command.input.Key!);
      return {};
    }
    throw new Error(
      `Comando no simulado: ${(command as object).constructor.name}`,
    );
  }

  private put(input: PutObjectCommand['input']) {
    this.puts.push(input);
    const key = input.Key!;
    const current = this.objects.get(key);
    if (key === LATEST_KEY && this.failNextPointerWithPrecondition) {
      this.failNextPointerWithPrecondition = false;
      throw precondition();
    }
    if (this.conditionalSupported) {
      if (input.IfNoneMatch === '*' && current) throw precondition();
      if (input.IfMatch && current?.etag !== input.IfMatch)
        throw precondition();
    }
    const etag = `"v${++this.version}"`;
    this.objects.set(key, {
      body: Buffer.from(input.Body as Buffer | string),
      etag,
      lastModified: this.now,
    });
    return { ETag: etag };
  }

  private get(key: string) {
    const object = this.objects.get(key);
    if (!object)
      throw Object.assign(new Error('NoSuchKey'), { name: 'NoSuchKey' });
    return {
      ETag: object.etag,
      Body: { transformToByteArray: async () => new Uint8Array(object.body) },
    };
  }

  private list(prefix: string) {
    return {
      Contents: [...this.objects.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([Key, o]) => ({ Key, LastModified: o.lastModified })),
      IsTruncated: false,
    };
  }

  json(key: string) {
    const body = this.objects.get(key)!.body;
    return JSON.parse(
      (key.endsWith('.gz') ? gunzipSync(body) : body).toString('utf8'),
    );
  }
}

function precondition() {
  return Object.assign(new Error('PreconditionFailed'), {
    name: 'PreconditionFailed',
    $metadata: { httpStatusCode: 412 },
  });
}

const snapshot = (sourceElaborado: string, generatedAt: string): Snapshot => ({
  version: 1,
  generatedAt,
  sourceElaborado,
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

const A = snapshot('2026-10-26T14:19:08', '2026-10-26T15:10:00.000Z');
const OLDER = snapshot('2026-10-26T12:00:00', '2026-10-26T15:20:00.000Z');
const SAME_SOURCE_LATER = snapshot(
  '2026-10-26T14:19:08',
  '2026-10-26T18:10:00.000Z',
);

describe('S3SnapshotStore', () => {
  let s3: FakeS3;
  let store: S3SnapshotStore;

  beforeEach(() => {
    s3 = new FakeS3();
    store = new S3SnapshotStore(s3 as unknown as S3Client, 'bucket');
  });

  it('publica el snapshot comprimido y después el puntero', async () => {
    const result = await store.publish(A);
    expect(result).toEqual({
      outcome: 'published',
      key: 'snapshots/2026-10-26T151000.000Z.json.gz',
    });
    expect(s3.puts.map((p) => p.Key)).toEqual([result.key, LATEST_KEY]);
    expect(s3.json(result.key)).toEqual(A);
    expect(s3.puts[0]).toMatchObject({
      Bucket: 'bucket',
      ContentType: 'application/json',
      ContentEncoding: 'gzip',
    });
    expect(s3.puts[1].IfNoneMatch).toBe('*');
    expect(s3.json(LATEST_KEY)).toEqual({
      key: result.key,
      generatedAt: A.generatedAt,
      sourceElaborado: A.sourceElaborado,
      covered: 1,
    });
  });

  it('no deja que un snapshot con datos más antiguos retroceda el puntero', async () => {
    const first = await store.publish(A);
    const second = await store.publish(OLDER);
    expect(second.outcome).toBe('superseded');
    expect(s3.objects.has(second.key)).toBe(true);
    expect(s3.json(LATEST_KEY).key).toBe(first.key);
  });

  it('acepta una ingesta posterior del mismo dato de AEMET', async () => {
    await store.publish(A);
    const second = await store.publish(SAME_SOURCE_LATER);
    expect(second.outcome).toBe('published');
    expect(s3.json(LATEST_KEY).key).toBe(second.key);
    expect(s3.puts.at(-1)?.IfMatch).toBe('"v2"');
  });

  it('relee y compara otra vez si el puntero cambió entre lectura y escritura', async () => {
    await store.publish(A);
    s3.failNextPointerWithPrecondition = true;
    const result = await store.publish(SAME_SOURCE_LATER);
    expect(result.outcome).toBe('published');
    expect(s3.puts.filter((p) => p.Key === LATEST_KEY)).toHaveLength(3);
  });

  it('readLatest devuelve null sin puntero y el snapshot con puntero', async () => {
    await expect(store.readLatest()).resolves.toBeNull();
    await store.publish(A);
    await expect(store.readLatest()).resolves.toEqual(A);
  });

  it('readLatest lanza si el puntero apunta a un objeto que no existe', async () => {
    const { key } = await store.publish(A);
    s3.objects.delete(key);
    await expect(store.readLatest()).rejects.toThrow(key);
  });

  it('prune borra los snapshots de más de 7 días salvo el vigente', async () => {
    s3.now = new Date('2026-10-10T00:00:00Z');
    const old = await store.publish(
      snapshot('2026-10-09T10:00:00', '2026-10-10T00:00:00.000Z'),
    );
    const oldCurrent = await store.publish(
      snapshot('2026-10-09T11:00:00', '2026-10-10T01:00:00.000Z'),
    );
    s3.now = new Date('2026-10-26T15:00:00Z');

    expect(await store.prune(new Date('2026-10-26T15:00:00Z'), 7)).toBe(1);
    expect(s3.objects.has(old.key)).toBe(false);
    expect(s3.objects.has(oldCurrent.key)).toBe(true);

    await store.publish(A);
    expect(await store.prune(new Date('2026-10-26T15:00:00Z'), 7)).toBe(1);
    expect(s3.objects.has(oldCurrent.key)).toBe(false);
    expect(s3.objects.has(LATEST_KEY)).toBe(true);
  });
});
