import { IsNotEmpty, IsString } from 'class-validator';

export class WeatherRequest {
  @IsString()
  @IsNotEmpty()
  townCode: string;

  @IsString()
  @IsNotEmpty()
  provinceCode: string;
}
