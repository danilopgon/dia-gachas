import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { gunzipSync, gzipSync } from 'node:zlib';
import { Snapshot } from '../ingest/snapshot/snapshot';

export const LATEST_KEY = 'latest.json';
export const RUN_STATUS_KEY = 'status/last-run.json';
const PROBE_KEY = 'probe/conditional.json';
const SNAPSHOTS_PREFIX = 'snapshots/';

export interface LatestPointer {
  key: string;
  generatedAt: string;
  sourceElaborado: string;
  covered: number;
}

export type PublishOutcome = 'published' | 'superseded';

/** Resultado de la última ejecución de la ingesta, también si falló o se rechazó. */
export interface RunStatus {
  outcome: 'published' | 'superseded' | 'unchanged' | 'rejected' | 'failed';
  finishedAt: string;
  durationMs: number;
  covered?: number;
  missing?: number;
  key?: string;
  failure?: string;
  reasons?: string[];
  aemetKeyExpiresAt?: string;
  conditionalWrites?: 'supported' | 'ignored' | 'unknown';
}

export interface SnapshotStore {
  publish(
    snapshot: Snapshot,
  ): Promise<{ outcome: PublishOutcome; key: string }>;
  readLatest(): Promise<Snapshot | null>;
  readPointer(): Promise<{ pointer: LatestPointer; etag: string } | null>;
  writeRunStatus(status: RunStatus): Promise<void>;
  readRunStatus(): Promise<RunStatus | null>;
  /** Comprueba si el bucket respeta If-None-Match escribiendo dos veces un objeto de prueba. */
  probeConditionalWrites(): Promise<'supported' | 'ignored'>;
  /** Borra los snapshots más antiguos que la retención, salvo el vigente; devuelve cuántos. */
  prune(now: Date, retentionDays: number): Promise<number>;
}

const isNotFound = (error: unknown) =>
  (error as Error)?.name === 'NoSuchKey' ||
  (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
    ?.httpStatusCode === 404;

// 412, o 409 cuando dos escrituras condicionales compiten (AWS: ConditionalRequestConflict).
const isPreconditionFailed = (error: unknown) =>
  ['PreconditionFailed', 'ConditionalRequestConflict'].includes(
    (error as Error)?.name,
  ) ||
  [409, 412].includes(
    (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
      ?.httpStatusCode ?? 0,
  );

// Primero manda el dato de AEMET; con el mismo dato, la ingesta más reciente.
const isNewer = (snapshot: Snapshot, current: LatestPointer) =>
  snapshot.sourceElaborado > current.sourceElaborado ||
  (snapshot.sourceElaborado === current.sourceElaborado &&
    snapshot.generatedAt > current.generatedAt);

/**
 * Snapshots inmutables en `snapshots/` y un puntero `latest.json` que solo avanza.
 * El puntero se escribe con If-Match/If-None-Match para no pisar una publicación concurrente.
 */
export class S3SnapshotStore implements SnapshotStore {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
  ) {}

  async publish(
    snapshot: Snapshot,
  ): Promise<{ outcome: PublishOutcome; key: string }> {
    const key = `${SNAPSHOTS_PREFIX}${snapshot.generatedAt.replace(/:/g, '')}.json.gz`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: gzipSync(JSON.stringify(snapshot)),
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
      }),
    );

    const pointer: LatestPointer = {
      key,
      generatedAt: snapshot.generatedAt,
      sourceElaborado: snapshot.sourceElaborado,
      covered: snapshot.stats.covered,
    };

    for (let attempt = 1; ; attempt++) {
      const current = await this.readPointer();
      if (current && !isNewer(snapshot, current.pointer))
        return { outcome: 'superseded', key };
      try {
        await this.client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: LATEST_KEY,
            Body: JSON.stringify(pointer),
            ContentType: 'application/json',
            ...(current ? { IfMatch: current.etag } : { IfNoneMatch: '*' }),
          }),
        );
        return { outcome: 'published', key };
      } catch (error) {
        if (!isPreconditionFailed(error) || attempt >= 2) throw error;
      }
    }
  }

  async readLatest(): Promise<Snapshot | null> {
    const current = await this.readPointer();
    if (!current) return null;
    try {
      const body = await this.getBytes(current.pointer.key);
      return JSON.parse(gunzipSync(body).toString('utf8')) as Snapshot;
    } catch (error) {
      if (isNotFound(error)) {
        throw new Error(
          `${LATEST_KEY} apunta a ${current.pointer.key}, que no existe`,
        );
      }
      throw error;
    }
  }

  async prune(now: Date, retentionDays: number): Promise<number> {
    const limit = now.getTime() - retentionDays * 86_400_000;
    const currentKey = (await this.readPointer())?.pointer.key;
    let deleted = 0;
    let continuationToken: string | undefined;

    do {
      const page = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: SNAPSHOTS_PREFIX,
          ContinuationToken: continuationToken,
        }),
      );
      for (const object of page.Contents ?? []) {
        if (!object.Key || object.Key === currentKey) continue;
        if ((object.LastModified?.getTime() ?? Infinity) >= limit) continue;
        await this.client.send(
          new DeleteObjectCommand({ Bucket: this.bucket, Key: object.Key }),
        );
        deleted++;
      }
      continuationToken = page.IsTruncated
        ? page.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return deleted;
  }

  async readPointer(): Promise<{
    pointer: LatestPointer;
    etag: string;
  } | null> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: LATEST_KEY }),
      );
      const body = await response.Body!.transformToByteArray();
      return {
        pointer: JSON.parse(
          Buffer.from(body).toString('utf8'),
        ) as LatestPointer,
        etag: response.ETag!,
      };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async writeRunStatus(status: RunStatus): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: RUN_STATUS_KEY,
        Body: JSON.stringify(status),
        ContentType: 'application/json',
      }),
    );
  }

  async readRunStatus(): Promise<RunStatus | null> {
    try {
      return JSON.parse(
        (await this.getBytes(RUN_STATUS_KEY)).toString('utf8'),
      ) as RunStatus;
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async probeConditionalWrites(): Promise<'supported' | 'ignored'> {
    const put = () =>
      this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: PROBE_KEY,
          Body: '{}',
          ContentType: 'application/json',
          IfNoneMatch: '*',
        }),
      );
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: PROBE_KEY }),
    );
    try {
      await put();
      try {
        await put();
        return 'ignored';
      } catch (error) {
        if (isPreconditionFailed(error)) return 'supported';
        throw error;
      }
    } finally {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: PROBE_KEY }),
      );
    }
  }

  private async getBytes(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return Buffer.from(await response.Body!.transformToByteArray());
  }
}
