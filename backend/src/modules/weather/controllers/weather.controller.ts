import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { WeatherRequest } from '../models/weather-request';
import { AemetService } from '../services/aemet.service';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller('weather')
export class WeatherController {
  constructor(private readonly aemetService: AemetService) {}

  @Post()
  async fetchWeatherData(@Body() weatherRequest: WeatherRequest) {
    const { townCode, provinceCode } = weatherRequest;
    const weather = await this.aemetService.getWeather(townCode, provinceCode);
    return { status: 'ok', data: weather };
  }

  @Get(':code')
  @CacheTTL(3600 * 1000)
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
      throw new HttpException(
        { status: 'error', message: error.message },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
