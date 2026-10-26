import { Module } from '@nestjs/common';
import { SnapshotsModule } from '../snapshots/snapshots.module';
import { WeatherModule } from '../weather/weather.module';
import { StatusController } from './status.controller';

@Module({
  imports: [WeatherModule, SnapshotsModule],
  controllers: [StatusController],
})
export class StatusModule {}
