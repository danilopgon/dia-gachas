import { Inject, Injectable, Optional } from '@nestjs/common';
import { performance } from 'node:perf_hooks';
import {
  AemetBulkClient,
  AemetBulkError,
  AemetFailure,
} from './aemet-bulk/aemet-bulk.client';
import { parseBulkEntry } from './aemet-bulk/bulk-entry';
import { InvalidBulkError, readTarGz } from './aemet-bulk/tar';
import { Catalog } from './catalog/catalog';
import {
  AEMET_BULK_CLIENT,
  AEMET_KEY_EXPIRES_AT,
  CATALOG,
  SNAPSHOT_STORE,
} from './ingest.tokens';
import { buildSnapshot, validateSnapshot } from './snapshot/build-snapshot';
import { SnapshotStore } from '../snapshots/snapshot-store';

export interface IngestResult {
  outcome: 'published' | 'superseded' | 'rejected' | 'failed';
  durationMs: number;
  covered?: number;
  missing?: number;
  key?: string;
  reasons?: string[];
  failure?: AemetFailure | 'store';
  aemetKeyExpiresAt?: string;
}

/** Descarga el agregado de AEMET, construye el snapshot, lo valida y lo publica. */
@Injectable()
export class IngestService {
  constructor(
    @Inject(AEMET_BULK_CLIENT) private readonly client: AemetBulkClient,
    @Inject(SNAPSHOT_STORE) private readonly store: SnapshotStore,
    @Inject(CATALOG) private readonly catalog: Catalog,
    @Optional()
    @Inject(AEMET_KEY_EXPIRES_AT)
    private readonly aemetKeyExpiresAt?: string,
  ) {}

  async run(now: Date = new Date()): Promise<IngestResult> {
    const result = await this.ingest(now);
    return this.aemetKeyExpiresAt
      ? { ...result, aemetKeyExpiresAt: this.aemetKeyExpiresAt }
      : result;
  }

  private async ingest(now: Date): Promise<IngestResult> {
    const start = performance.now();
    const elapsed = () => Math.round(performance.now() - start);

    let files: Map<string, Buffer>;
    try {
      files = readTarGz(await this.client.download());
    } catch (error) {
      if (error instanceof AemetBulkError) {
        return {
          outcome: 'failed',
          durationMs: elapsed(),
          failure: error.kind,
          reasons: [error.message],
        };
      }
      if (error instanceof InvalidBulkError) {
        return {
          outcome: 'failed',
          durationMs: elapsed(),
          failure: 'invalid',
          reasons: [error.message],
        };
      }
      throw error;
    }

    const snapshot = buildSnapshot(
      [...files.values()].map(parseBulkEntry),
      this.catalog,
      now,
    );
    const stats = {
      covered: snapshot.stats.covered,
      missing: snapshot.stats.missing.length,
    };

    const reasons = validateSnapshot(snapshot);
    if (reasons.length > 0) {
      return { outcome: 'rejected', durationMs: elapsed(), ...stats, reasons };
    }

    try {
      const { outcome, key } = await this.store.publish(snapshot);
      return { outcome, durationMs: elapsed(), ...stats, key };
    } catch (error) {
      return {
        outcome: 'failed',
        durationMs: elapsed(),
        ...stats,
        failure: 'store',
        reasons: [(error as Error).message],
      };
    }
  }
}
