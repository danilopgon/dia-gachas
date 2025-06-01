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

    const weatherData = await firstValueFrom(
      this.httpService.get(response.data.datos),
    );

    const simplifiedData: SimplifiedData[] = this.simplifyData(
      weatherData.data,
    );
    const gachasDays: SimplifiedData[] = this.assignGachasLevel(simplifiedData);

    return gachasDays;
  }

  private simplifyData(weatherData: AemetData): SimplifiedData[] {
    return weatherData[0].prediccion.dia.splice(0, 2).map((day: Dia) => {
      const noonTemperature = day.temperatura.dato.find(
        (temperatura: Dato) => temperatura.hora === 12,
      );
      const afternoonTemperature = day.temperatura.dato.find(
        (temperature: Dato) => temperature.hora === 18,
      );

      const launchTemperature =
        (noonTemperature.value + afternoonTemperature.value) / 2;

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

      let score = 0;

      if (temp <= 12) score += 2;
      else if (temp <= 17) score += 1;
      else if (temp >= 22) score -= 2;
      else if (temp >= 19) score -= 1;

      if (rain >= 60) score += 2;
      else if (rain >= 40) score += 1;

      if (
        sky.includes('nub') ||
        sky.includes('lluv') ||
        sky.includes('torment') ||
        sky.includes('niebla') ||
        sky.includes('cubierto') ||
        sky.includes('chubasc')
      ) {
        score += 2;
      } else if (sky.includes('despejado') || sky.includes('soleado')) {
        score -= 1;
      }

      let level: GachasLevel;

      if (score >= 5) {
        level = GachasLevel.HIGH;
      } else if (score >= 3) {
        level = GachasLevel.MEDIUM;
      } else if (score >= 1) {
        level = GachasLevel.LOW;
      } else {
        level = GachasLevel.NONE;
      }

      return {
        ...day,
        gachasLevel: level,
      };
    });
  }
}
