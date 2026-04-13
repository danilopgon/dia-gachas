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
import { AemetError } from '../errors/aemet.error';
import { CacheTTL } from '@nestjs/cache-manager';

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
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : String(error);
      const httpStatus =
        error instanceof AemetError
          ? HttpStatus.BAD_GATEWAY
          : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ status: 'error', message }, httpStatus);
    }
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
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : String(error);
      const httpStatus =
        error instanceof AemetError
          ? HttpStatus.BAD_GATEWAY
          : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ status: 'error', message }, httpStatus);
    }
  }
}
