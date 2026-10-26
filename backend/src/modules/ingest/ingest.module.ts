import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IngestConfig, loadIngestConfig } from '../../config/ingest-config';
import { AemetBulkClient } from './aemet-bulk/aemet-bulk.client';
import { loadCatalog } from './catalog/catalog';
import {
  AEMET_BULK_CLIENT,
  CATALOG,
  INGEST_CONFIG,
  SNAPSHOT_STORE,
} from './ingest.tokens';
import { IngestService } from './ingest.service';
import { S3SnapshotStore } from './store/snapshot-store';

/** Contexto de la ingesta: se levanta sin servidor HTTP desde `dist/ingest`. */
@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ['.env'] })],
  providers: [
    { provide: INGEST_CONFIG, useFactory: () => loadIngestConfig(process.env) },
    {
      provide: AEMET_BULK_CLIENT,
      inject: [INGEST_CONFIG],
      useFactory: (config: IngestConfig) =>
        new AemetBulkClient(config.aemetApiKey),
    },
    {
      provide: SNAPSHOT_STORE,
      inject: [INGEST_CONFIG],
      useFactory: (config: IngestConfig) =>
        new S3SnapshotStore(
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
        ),
    },
    {
      provide: CATALOG,
      inject: [INGEST_CONFIG],
      useFactory: (config: IngestConfig) => loadCatalog(config.catalogPath),
    },
    IngestService,
  ],
})
export class IngestModule {}
