import { INestApplicationContext, Logger } from '@nestjs/common';
import { RunStatus, SnapshotStore } from '../snapshots/snapshot-store';
import { IngestService } from './ingest.service';
import { SNAPSHOT_STORE } from './ingest.tokens';

const RETENTION_DAYS = 7;
const KEY_EXPIRY_WARNING_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const AEMET_KEY_RENEWAL_URL =
  'https://opendata.aemet.es/centrodedescargas/altaUsuario';

/** Aviso si la clave de AEMET caduca en menos de 30 días o ya ha caducado; null si no hace falta. */
function keyExpiryWarning(
  expiresAt: string | undefined,
  now: Date,
): string | null {
  if (!expiresAt) return null;
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return null;
  const date = expiresAt.slice(0, 10);
  const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / DAY_MS);
  if (daysLeft < 0) {
    return `La clave de AEMET caducó el ${date}: renuévala en ${AEMET_KEY_RENEWAL_URL}`;
  }
  if (daysLeft < KEY_EXPIRY_WARNING_DAYS) {
    return `La clave de AEMET caduca el ${date} (en ${daysLeft} días): renuévala en ${AEMET_KEY_RENEWAL_URL}`;
  }
  return null;
}

/**
 * Ejecuta una ingesta, guarda su estado (también si falla) y poda tras publicar.
 * Devuelve el código de salida: 0 si el snapshot vigente está al día (publicado, superado o sin
 * cambios en AEMET) y 1 si la ingesta falló o se rechazó.
 */
export async function runIngest(
  app: Pick<INestApplicationContext, 'get'>,
  now: Date = new Date(),
): Promise<number> {
  const logger = new Logger('Ingest');
  const store = app.get<SnapshotStore>(SNAPSHOT_STORE);
  const result = await app.get(IngestService).run(now);
  logger.log(JSON.stringify(result));
  const keyWarning = keyExpiryWarning(result.aemetKeyExpiresAt, now);
  if (keyWarning) logger.warn(keyWarning);

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
  const upToDate: RunStatus['outcome'][] = [
    'published',
    'superseded',
    'unchanged',
  ];
  return upToDate.includes(result.outcome) ? 0 : 1;
}
