import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IngestModule } from './modules/ingest/ingest.module';
import { IngestService } from './modules/ingest/ingest.service';
import { SNAPSHOT_STORE } from './modules/ingest/ingest.tokens';
import { SnapshotStore } from './modules/ingest/store/snapshot-store';

const RETENTION_DAYS = 7;

/** Ingesta de snapshots de AEMET: la ejecuta Railway Cron y termina al acabar. */
async function main(): Promise<number> {
  const logger = new Logger('Ingest');
  const app = await NestFactory.createApplicationContext(IngestModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const now = new Date();
    const result = await app.get(IngestService).run(now);
    logger.log(JSON.stringify(result));

    if (result.outcome === 'published') {
      try {
        const deleted = await app
          .get<SnapshotStore>(SNAPSHOT_STORE)
          .prune(now, RETENTION_DAYS);
        logger.log(JSON.stringify({ pruned: deleted }));
      } catch (error) {
        logger.warn(
          `No se pudieron borrar snapshots antiguos: ${(error as Error).message}`,
        );
      }
    }
    return result.outcome === 'published' || result.outcome === 'superseded'
      ? 0
      : 1;
  } finally {
    await app.close();
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    new Logger('Ingest').error((error as Error).message);
    process.exit(1);
  });
