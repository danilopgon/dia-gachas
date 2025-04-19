export interface SimplifiedData {
  town: string;
  province: string;
  date: Date;
  launchTemperature: number;
  launchTimeRainProbability: number;
  skyStatus: string;
  isGachasDay?: boolean;
}
