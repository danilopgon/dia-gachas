import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AemetData, Dia } from '../models/aemet-data';
import { AemetError } from '../errors/aemet.error';
import { SimplifiedData } from '../models/simplified-data';
import {
  assignGachasLevel,
  ForecastDay,
  simplifyForecast,
} from '../domain/forecast';

@Injectable()
export class AemetService {
  constructor(private readonly httpService: HttpService) {}

  async getWeather(townCode: string, provinceCode: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${provinceCode}${townCode}`,
          {
            headers: {
              api_key: process.env.AEMET_API_KEY ?? '',
              Accept: 'application/json',
            },
            timeout: 10000,
            maxRedirects: 5,
          },
        ),
      );

      const datosUrl: string = response?.data?.datos;
      if (!datosUrl) throw new Error('Respuesta AEMET sin URL de datos');

      const rawResponse = await firstValueFrom(
        this.httpService.get(datosUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
          maxRedirects: 5,
        }),
      );

      const decoded = Buffer.from(rawResponse.data).toString('latin1');
      const weatherData: AemetData = JSON.parse(decoded);
      const simplifiedData: SimplifiedData[] = this.simplifyData(weatherData);
      return this.assignGachasLevel(simplifiedData);
    } catch (error: any) {
      const msg =
        error?.response?.data?.descripcion ||
        error?.response?.data ||
        error?.message ||
        'Error desconocido';
      throw new AemetError(`AEMET request failed: ${msg}`);
    }
  }

  private simplifyData(weatherData: AemetData): SimplifiedData[] {
    const dias: Dia[] = weatherData?.[0]?.prediccion?.dia?.slice(0, 2) ?? [];
    const days: ForecastDay[] = dias.map((day) => ({
      fecha: this.toISODate(day?.fecha),
      temperatura: day?.temperatura,
      probPrecipitacion: day?.probPrecipitacion,
      estadoCielo: day?.estadoCielo,
    }));

    return simplifyForecast(days, {
      town: weatherData?.[0]?.nombre ?? 'N/D',
      province: weatherData?.[0]?.provincia ?? 'N/D',
    });
  }

  private toISODate(v: any): string {
    if (typeof v === 'string') return v;
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d.toISOString().split('T')[0] : '';
  }

  assignGachasLevel(data: SimplifiedData[]): SimplifiedData[] {
    return assignGachasLevel(data);
  }
}
