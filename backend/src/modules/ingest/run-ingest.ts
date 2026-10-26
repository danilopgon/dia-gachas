import { INestApplicationContext, Logger } from '@nestjs/common';
import { RunStatus, SnapshotStore } from '../snapshots/snapshot-store';
import { IngestService } from './ingest.service';
import { SNAPSHOT_STORE } from './ingest.tokens';

const RETENTION_DAYS = 7;

/**
 * Ejecuta una ingesta, guarda su estado (también si falla) y poda tras publicar.
 * Devuelve el código de salida: 0 si hay un snapshot vigente actualizado o más reciente, 1 si no.
 */
export async function runIngest(
  app: Pick<INestApplicationContext, 'get'>,
  now: Date = new Date(),
): Promise<number> {
  const logger = new Logger('Ingest');
  const store = app.get<SnapshotStore>(SNAPSHOT_STORE);
  const result = await app.get(IngestService).run(now);
  logger.log(JSON.stringify(result));

  let conditionalWrites: RunStatus['conditionalWrites'] = 'unknown';
  try {
    conditionalWrites = await store.probeConditionalWrites();
  } catch (error) {
    logger.warn(
      `No se pudo comprobar las escrituras condicionales: ${(error as Error).message}`,
    );
  }

  try {
    await store.writeRunStatus({
      ...result,
      finishedAt: new Date().toISOString(),
      conditionalWrites,
    });
  } catch (error) {
    logger.warn(
      `No se pudo guardar el estado de la ingesta: ${(error as Error).message}`,
    );
  }

  if (result.outcome === 'published') {
    try {
      logger.log(
        JSON.stringify({ pruned: await store.prune(now, RETENTION_DAYS) }),
      );
    } catch (error) {
      logger.warn(
        `No se pudieron borrar snapshots antiguos: ${(error as Error).message}`,
      );
    }
  }
  return result.outcome === 'published' || result.outcome === 'superseded'
    ? 0
    : 1;
}
