import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CitiesModule } from './modules/cities/cities.module';
import { WeatherModule } from './modules/weather/weather.module';

@Module({
  imports: [ConfigModule.forRoot(), WeatherModule, CitiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
