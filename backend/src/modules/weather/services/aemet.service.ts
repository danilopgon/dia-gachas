import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AemetData, Dato, Dia } from '../models/aemet-data';
import { SimplifiedData } from '../models/simplified-data';
import { GachasLevel } from '../enums/gachas-level.enum';

@Injectable()
export class AemetService {
  constructor(private readonly httpService: HttpService) {}

  async getWeather(townCode: string, provinceCode: string) {
    try {
      const headerParams = {
        api_key: process.env.AEMET_API_KEY,
      };

      const response = await firstValueFrom(
        this.httpService.get(
          `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${provinceCode}${townCode}`,
          {
            headers: headerParams,
          },
        ),
      );

      const rawResponse = await firstValueFrom(
        this.httpService.get(response.data.datos, {
          responseType: 'arraybuffer',
        }),
      );

      const decoded = Buffer.from(rawResponse.data).toString('latin1');
      const weatherData: AemetData = JSON.parse(decoded);

      const simplifiedData: SimplifiedData[] = this.simplifyData(weatherData);

      return this.assignGachasLevel(simplifiedData);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  private simplifyData(weatherData: AemetData): SimplifiedData[] {
    return weatherData[0].prediccion.dia.splice(0, 2).map((day: Dia) => {
      const noonTemperature = day.temperatura.dato.find(
        (temperatura: Dato) => temperatura.hora === 12,
      );
      const afternoonTemperature = day.temperatura.dato.find(
        (temperature: Dato) => temperature.hora === 18,
      );

      const launchTemperature = Math.round(
        (noonTemperature.value + afternoonTemperature.value) / 2,
      );

      const launchTimeRainProbability = day.probPrecipitacion.find(
        (p) => p.periodo === '12-18',
      ).value;

      const estadoCielo = day.estadoCielo.find((e) => e.descripcion) || {
        descripcion: 'Unknown',
      };

      return {
        town: weatherData[0].nombre,
        province: weatherData[0].provincia,
        date: day.fecha,
        launchTemperature: launchTemperature,
        launchTimeRainProbability: launchTimeRainProbability,
        skyStatus: estadoCielo.descripcion,
      };
    });
  }

  assignGachasLevel(data: SimplifiedData[]): SimplifiedData[] {
    return data.map((day) => {
      const temp = day.launchTemperature;
      const rain = day.launchTimeRainProbability;
      const sky = day.skyStatus.toLowerCase();

      const score =
        this.scoreTemperature(temp) + this.scoreRain(rain) + this.scoreSky(sky);

      return {
        ...day,
        gachasLevel: this.getLevelFromScore(score),
      };
    });
  }

  private scoreTemperature(temp: number): number {
    if (temp <= 12) return 2;
    if (temp <= 17) return 1;
    if (temp >= 22) return -2;
    if (temp >= 19) return -1;
    return 0;
  }

  private scoreRain(rain: number): number {
    if (rain >= 60) return 2;
    if (rain >= 40) return 1;
    return 0;
  }

  private scoreSky(sky: string): number {
    const cloudyKeywords = [
      'nub',
      'lluv',
      'torment',
      'niebla',
      'cubierto',
      'chubasc',
    ];
    const sunnyKeywords = ['despejado', 'soleado'];

    if (cloudyKeywords.some((keyword) => sky.includes(keyword))) return 2;
    if (sunnyKeywords.some((keyword) => sky.includes(keyword))) return -1;
    return 0;
  }

  private getLevelFromScore(score: number): GachasLevel {
    if (score >= 5) return GachasLevel.HIGH;
    if (score >= 3) return GachasLevel.MEDIUM;
    if (score >= 1) return GachasLevel.LOW;
    return GachasLevel.NONE;
  }
}
