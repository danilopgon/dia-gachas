import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  IngestConfig,
  jwtExpiresAt,
  loadIngestConfig,
} from '../../config/ingest-config';
import { SnapshotsModule } from '../snapshots/snapshots.module';
import { AemetBulkClient } from './aemet-bulk/aemet-bulk.client';
import { loadCatalog } from './catalog/catalog';
import {
  AEMET_BULK_CLIENT,
  AEMET_KEY_EXPIRES_AT,
  CATALOG,
  INGEST_CONFIG,
} from './ingest.tokens';
import { IngestService } from './ingest.service';

/** Contexto de la ingesta: se levanta sin servidor HTTP desde `dist/ingest`. */
@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ['.env'] }), SnapshotsModule],
  providers: [
    { provide: INGEST_CONFIG, useFactory: () => loadIngestConfig(process.env) },
    {
      provide: AEMET_BULK_CLIENT,
      inject: [INGEST_CONFIG],
      useFactory: (config: IngestConfig) =>
        new AemetBulkClient(config.aemetApiKey),
    },
    {
      provide: AEMET_KEY_EXPIRES_AT,
      inject: [INGEST_CONFIG],
      useFactory: (config: IngestConfig) => jwtExpiresAt(config.aemetApiKey),
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
