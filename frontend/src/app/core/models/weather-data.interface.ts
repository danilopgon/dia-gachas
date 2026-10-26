import { GachasLevel } from '../enums/gachas-level.enum';

export interface IWeatherData {
  town: string;
  province: string;
  date: string;
  launchTemperature: number;
  launchTimeRainProbability: number;
  skyStatus: string;
  gachasLevel?: GachasLevel;
}

export interface IWeatherMeta {
  updatedAt: string;
  ageHours: number;
  stale: boolean;
}

export interface IWeatherResponse {
  status: 'ok';
  data: IWeatherData[];
  meta?: IWeatherMeta;
}
