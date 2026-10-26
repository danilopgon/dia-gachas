import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { loadBucketConfig } from '../../config/bucket-config';
import { S3SnapshotStore } from './snapshot-store';
import { SNAPSHOT_STORE } from './snapshots.tokens';

/** Almacén de snapshots en el Railway Bucket, compartido por la API y la ingesta. */
@Module({
  providers: [
    {
      provide: SNAPSHOT_STORE,
      useFactory: () => {
        const config = loadBucketConfig(process.env);
        return new S3SnapshotStore(
          new S3Client({
            endpoint: config.endpoint,
            region: config.region,
            credentials: {
              accessKeyId: config.accessKeyId,
              secretAccessKey: config.secretAccessKey,
            },
            // Los buckets nuevos de Railway usan URLs virtual-hosted.
            forcePathStyle: false,
          }),
          config.bucket,
        );
      },
    },
  ],
  exports: [SNAPSHOT_STORE],
})
export class SnapshotsModule {}
