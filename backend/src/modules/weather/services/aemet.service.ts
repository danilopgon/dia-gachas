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
      throw new Error(`AEMET request failed: ${msg}`);
    }
  }

  private simplifyData(weatherData: AemetData): SimplifiedData[] {
    const dias: Dia[] = weatherData?.[0]?.prediccion?.dia?.slice(0, 2) ?? [];

    return dias.map((day: Dia) => {
      const t12 = day?.temperatura?.dato?.find(
        (d: Dato) => d.hora === 12,
      )?.value;
      const t18 = day?.temperatura?.dato?.find(
        (d: Dato) => d.hora === 18,
      )?.value;

      const launchTemperature = this.correctedMean(
        this.toNumber(t12),
        this.toNumber(t18),
      );

      const rainSlot =
        day?.probPrecipitacion?.find((p) => p.periodo === '12-18') ??
        day?.probPrecipitacion?.find((p) => p.periodo === '12-24') ??
        day?.probPrecipitacion?.find((p) => p.periodo === '10-16') ??
        day?.probPrecipitacion?.find((p) => !p.periodo || p.periodo === '');

      const launchTimeRainProbability = this.toNumber(rainSlot?.value) ?? 0;

      const skyDesc =
        day?.estadoCielo
          ?.map((e) => e.descripcion)
          .filter(Boolean)
          .pop() ?? 'desconocido';

      return {
        town: weatherData?.[0]?.nombre ?? 'N/D',
        province: weatherData?.[0]?.provincia ?? 'N/D',
        date: this.toISODate(day.fecha),
        launchTemperature,
        launchTimeRainProbability,
        skyStatus: skyDesc,
      };
    });
  }

  private toNumber(v: any): number | undefined {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  private toISODate(v: any): string {
    if (typeof v === 'string') return v;
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d.toISOString().split('T')[0] : '';
  }

  private correctedMean(a?: number, b?: number, zeroGap = 10): number {
    const isNum = (x: any) => typeof x === 'number' && Number.isFinite(x);
    if (isNum(a) && !isNum(b)) return Math.round(a as number);
    if (!isNum(a) && isNum(b)) return Math.round(b as number);
    if (!isNum(a) && !isNum(b)) return 0;

    const A = a as number;
    const B = b as number;

    if (A === 0 && Math.abs(B - A) > zeroGap) return Math.round(B);
    if (B === 0 && Math.abs(A - B) > zeroGap) return Math.round(A);

    return Math.round((A + B) / 2);
  }

  assignGachasLevel(data: SimplifiedData[]): SimplifiedData[] {
    return data.map((day) => {
      const temp = Number.isFinite(day.launchTemperature)
        ? day.launchTemperature
        : 0;
      const rain = Number.isFinite(day.launchTimeRainProbability)
        ? day.launchTimeRainProbability
        : 0;
      const sky = (day.skyStatus ?? 'desconocido').toString().toLowerCase();

      const score =
        this.scoreTemperature(temp) + this.scoreRain(rain) + this.scoreSky(sky);

      return { ...day, gachasLevel: this.getLevelFromScore(score) };
    });
  }

  private scoreTemperature(temp: number): number {
    if (!Number.isFinite(temp)) return 0;
    if (temp <= 12) return 2;
    if (temp <= 17) return 1;
    if (temp >= 22) return -2;
    if (temp >= 19) return -1;
    return 0;
  }

  private scoreRain(rain: number): number {
    if (!Number.isFinite(rain)) return 0;
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

    if (cloudyKeywords.some((k) => sky.includes(k))) return 2;
    if (sunnyKeywords.some((k) => sky.includes(k))) return -1;
    return 0;
  }

  private getLevelFromScore(score: number): GachasLevel {
    if (score >= 5) return GachasLevel.HIGH;
    if (score >= 3) return GachasLevel.MEDIUM;
    if (score >= 1) return GachasLevel.LOW;
    return GachasLevel.NONE;
  }
}
