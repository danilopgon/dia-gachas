import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { Snapshot } from '../ingest/snapshot/snapshot';
import { SnapshotStore } from '../snapshots/snapshot-store';
import { SNAPSHOT_STORE } from '../snapshots/snapshots.tokens';

export const REFRESH_INTERVAL_MS = 5 * 60_000;
export const CLOCK = Symbol('CLOCK');

/**
 * Snapshot vigente en memoria. La fuente de verdad es el bucket: se carga al arrancar y,
 * como mucho cada 5 minutos, se mira si `latest.json` ha cambiado. Si el bucket falla,
 * se sigue sirviendo el último snapshot bueno.
 */
@Injectable()
export class SnapshotReader implements OnModuleInit {
  private readonly logger = new Logger(SnapshotReader.name);
  private snapshot: Snapshot | null = null;
  private etag: string | null = null;
  private checkedAt = 0;
  private error: string | null = null;
  private inFlight: Promise<void> | null = null;

  constructor(
    @Inject(SNAPSHOT_STORE) private readonly store: SnapshotStore,
    @Optional()
    @Inject(CLOCK)
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refresh();
  }

  async current(): Promise<Snapshot | null> {
    const due = this.clock().getTime() - this.checkedAt >= REFRESH_INTERVAL_MS;
    if (!this.snapshot || due) await this.refresh();
    return this.snapshot;
  }

  lastError(): string | null {
    return this.error;
  }

  private refresh(): Promise<void> {
    this.inFlight ??= this.load().finally(() => {
      this.checkedAt = this.clock().getTime();
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async load(): Promise<void> {
    try {
      const current = await this.store.readPointer();
      if (!current) {
        this.error = 'Todavía no hay ningún snapshot publicado';
        return;
      }
      if (current.etag !== this.etag || !this.snapshot) {
        this.snapshot = await this.store.readLatest();
        this.etag = current.etag;
        this.logger.log(`Snapshot cargado: ${this.snapshot?.generatedAt}`);
      }
      this.error = null;
    } catch (error) {
      this.error = (error as Error).message;
      this.logger.warn(`No se pudo leer el snapshot: ${this.error}`);
    }
  }
}
