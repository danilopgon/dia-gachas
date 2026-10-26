import { Controller, Get, Inject } from '@nestjs/common';
import { lookupFreshness } from '../weather/domain/lookup';
import { CLOCK, SnapshotReader } from '../weather/snapshot-reader';
import { RunStatus, SnapshotStore } from '../snapshots/snapshot-store';
import { SNAPSHOT_STORE } from '../snapshots/snapshots.tokens';

/** Observabilidad del refresco: snapshot vigente y resultado de la última ingesta. Siempre 200. */
@Controller('status')
export class StatusController {
  constructor(
    private readonly reader: SnapshotReader,
    @Inject(SNAPSHOT_STORE) private readonly store: SnapshotStore,
    @Inject(CLOCK) private readonly clock: () => Date,
  ) {}

  @Get()
  async status() {
    const snapshot = await this.reader.current();
    let lastRun: RunStatus | null = null;
    try {
      lastRun = await this.store.readRunStatus();
    } catch {
      lastRun = null;
    }

    return {
      status: 'ok',
      snapshot: snapshot && {
        ...lookupFreshness(snapshot, this.clock()),
        covered: snapshot.stats.covered,
        missing: snapshot.stats.missing.length,
      },
      lastRun,
      readerError: this.reader.lastError(),
    };
  }
}
