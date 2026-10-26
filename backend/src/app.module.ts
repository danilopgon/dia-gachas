import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { StatusModule } from './modules/status/status.module';
import { WeatherModule } from './modules/weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    WeatherModule,
    HealthModule,
    StatusModule,
  ],
})
export class AppModule {}
