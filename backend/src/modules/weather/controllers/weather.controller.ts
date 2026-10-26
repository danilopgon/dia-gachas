import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { Catalog } from '../../ingest/catalog/catalog';
import { lookupForecast } from '../domain/lookup';
import { WeatherRequest } from '../models/weather-request';
import { CLOCK, SnapshotReader } from '../snapshot-reader';
import { WEATHER_CATALOG } from '../weather.tokens';

const error = (message: string, status: HttpStatus) =>
  new HttpException({ status: 'error', message }, status);

@Controller('weather')
export class WeatherController {
  constructor(
    private readonly reader: SnapshotReader,
    @Inject(WEATHER_CATALOG) private readonly catalog: Catalog,
    @Inject(CLOCK) private readonly clock: () => Date,
  ) {}

  @Post()
  async fetchWeatherData(@Body() body: Partial<WeatherRequest>) {
    const { townCode, provinceCode } = body ?? {};
    if (typeof townCode !== 'string' || typeof provinceCode !== 'string') {
      throw error('Código de municipio no válido', HttpStatus.BAD_REQUEST);
    }
    return this.forecast(`${provinceCode}${townCode}`);
  }

  @Get(':code')
  async getByWeatherDataParams(@Param('code') code: string) {
    return this.forecast(code);
  }

  private async forecast(code: string) {
    const snapshot = await this.reader.current();
    const result = lookupForecast(code, snapshot, this.catalog, this.clock());

    switch (result.kind) {
      case 'ok':
        return { status: 'ok', data: result.days, meta: result.freshness };
      case 'invalid':
        throw error('Código de municipio no válido', HttpStatus.BAD_REQUEST);
      case 'not-found':
        throw error('Municipio no encontrado', HttpStatus.NOT_FOUND);
      case 'unavailable':
        throw error(
          'Previsión no disponible ahora mismo',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
    }
  }
}
