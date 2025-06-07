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
