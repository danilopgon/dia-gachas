import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WeatherController } from './controllers/weather.controller';
import { AemetService } from './services/aemet.service';

@Module({
  imports: [HttpModule],
  controllers: [WeatherController],
  providers: [AemetService],
})
export class WeatherModule {}
