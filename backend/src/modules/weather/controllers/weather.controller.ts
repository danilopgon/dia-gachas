import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WeatherRequest } from '../models/weather-request';
import { AemetService } from '../services/aemet.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly aemetService: AemetService) {}

  @Post()
  async fetchWeatherData(@Body() weatherRequest: WeatherRequest) {
    try {
      const { townCode, provinceCode } = weatherRequest;
      const weather = await this.aemetService.getWeather(
        townCode,
        provinceCode,
      );
      return { status: 'ok', data: weather };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get(':code')
  async getByWeatherDataParams(@Param() params: { code: string }) {
    try {
      const { code } = params;
      const provinceCode = code.substring(0, 2);
      const townCode = code.substring(2);

      const weather = await this.aemetService.getWeather(
        townCode,
        provinceCode,
      );
      return { status: 'ok', data: weather };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
