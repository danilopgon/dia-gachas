import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IngestModule } from './modules/ingest/ingest.module';
import { runIngest } from './modules/ingest/run-ingest';

/** Ingesta de snapshots de AEMET: la ejecuta Railway Cron y termina al acabar. */
async function main(): Promise<number> {
  const app = await NestFactory.createApplicationContext(IngestModule, {
    logger: ['log', 'warn', 'error'],
  });
  try {
    return await runIngest(app);
  } finally {
    // Un fallo al cerrar no debe tapar el resultado de la ingesta.
    await app
      .close()
      .catch((error: Error) => new Logger('Ingest').warn(error.message));
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    new Logger('Ingest').error((error as Error).message);
    process.exit(1);
  });
