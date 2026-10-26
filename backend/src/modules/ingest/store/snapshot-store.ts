import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { gunzipSync, gzipSync } from 'node:zlib';
import { Snapshot } from '../snapshot/snapshot';

export const LATEST_KEY = 'latest.json';
const SNAPSHOTS_PREFIX = 'snapshots/';

export interface LatestPointer {
  key: string;
  generatedAt: string;
  sourceElaborado: string;
  covered: number;
}

export type PublishOutcome = 'published' | 'superseded';

export interface SnapshotStore {
  publish(
    snapshot: Snapshot,
  ): Promise<{ outcome: PublishOutcome; key: string }>;
  readLatest(): Promise<Snapshot | null>;
  /** Borra los snapshots más antiguos que la retención, salvo el vigente; devuelve cuántos. */
  prune(now: Date, retentionDays: number): Promise<number>;
}

const isNotFound = (error: unknown) =>
  (error as Error)?.name === 'NoSuchKey' ||
  (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
    ?.httpStatusCode === 404;

const isPreconditionFailed = (error: unknown) =>
  (error as Error)?.name === 'PreconditionFailed' ||
  (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
    ?.httpStatusCode === 412;

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

  private async readPointer(): Promise<{
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

  private async getBytes(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return Buffer.from(await response.Body!.transformToByteArray());
  }
}
