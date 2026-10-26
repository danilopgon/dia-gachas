import { Module } from '@nestjs/common';
import { DEFAULT_CATALOG_PATH } from '../../config/ingest-config';
import { loadCatalog } from '../ingest/catalog/catalog';
import { SnapshotsModule } from '../snapshots/snapshots.module';
import { WeatherController } from './controllers/weather.controller';
import { CLOCK, SnapshotReader } from './snapshot-reader';
import { WEATHER_CATALOG } from './weather.tokens';

@Module({
  imports: [SnapshotsModule],
  controllers: [WeatherController],
  providers: [
    SnapshotReader,
    { provide: CLOCK, useValue: () => new Date() },
    {
      provide: WEATHER_CATALOG,
      useFactory: () =>
        loadCatalog(
          process.env.MUNICIPIOS_PATH?.trim() || DEFAULT_CATALOG_PATH,
        ),
    },
  ],
  exports: [SnapshotReader, CLOCK],
})
export class WeatherModule {}
