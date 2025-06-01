import { GachasLevel } from '../enums/gachas-level.enum';

export interface SimplifiedData {
  town: string;
  province: string;
  date: Date;
  launchTemperature: number;
  launchTimeRainProbability: number;
  skyStatus: string;
  gachasLevel: GachasLevel;
}
