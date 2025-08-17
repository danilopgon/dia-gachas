import { Test, TestingModule } from '@nestjs/testing';
import { AemetService } from './aemet.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { GachasLevel } from '../enums/gachas-level.enum';
import { SimplifiedData } from '../models/simplified-data';

describe('AemetService', () => {
  let service: AemetService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AemetService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AemetService>(AemetService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('assignGachasLevel', () => {
    it('debería asignar nivel HIGH cuando hace frío, llueve y está nublado', () => {
      const input: SimplifiedData[] = [
        {
          town: 'Toledo',
          province: 'Toledo',
          date: '2025-06-08',
          launchTemperature: 10,
          launchTimeRainProbability: 70,
          skyStatus: 'Cubierto',
        },
      ];
      const result = service.assignGachasLevel(input);
      expect(result[0].gachasLevel).toBe(GachasLevel.HIGH);
    });

    it('debería asignar nivel NONE cuando hace calor y está soleado', () => {
      const input: SimplifiedData[] = [
        {
          town: 'Murcia',
          province: 'Murcia',
          date: '2025-06-08',
          launchTemperature: 27,
          launchTimeRainProbability: 0,
          skyStatus: 'Despejado',
        },
      ];
      const result = service.assignGachasLevel(input);
      expect(result[0].gachasLevel).toBe(GachasLevel.NONE);
    });

    it('debería asignar nivel MEDIUM cuando está templado, posibilidad de lluvia y cielo nublado', () => {
      const input: SimplifiedData[] = [
        {
          town: 'Cuenca',
          province: 'Cuenca',
          date: '2025-06-08',
          launchTemperature: 16,
          launchTimeRainProbability: 45,
          skyStatus: 'Nuboso',
        },
      ];
      const result = service.assignGachasLevel(input);
      expect(result[0].gachasLevel).toBe(GachasLevel.MEDIUM);
    });

    it('debería asignar nivel LOW cuando está templado, sin lluvia y cielo mixto', () => {
      const input: SimplifiedData[] = [
        {
          town: 'Segovia',
          province: 'Segovia',
          date: '2025-06-08',
          launchTemperature: 18,
          launchTimeRainProbability: 10,
          skyStatus: 'Parcialmente nuboso',
        },
      ];
      const result = service.assignGachasLevel(input);
      expect(result[0].gachasLevel).toBe(GachasLevel.LOW);
    });
  });

  describe('getWeather', () => {
    it('debería obtener y simplificar datos del tiempo', async () => {
      const mockUrlResponse: AxiosResponse = {
        data: {
          datos: 'https://datos.fake-url.com/prediccion.json',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };

      const mockWeatherJson = JSON.stringify([
        {
          nombre: 'Toledo',
          provincia: 'Toledo',
          prediccion: {
            dia: [
              {
                fecha: '2025-06-08',
                temperatura: {
                  dato: [
                    { hora: 12, value: 14 },
                    { hora: 18, value: 16 },
                  ],
                },
                probPrecipitacion: [{ periodo: '12-18', value: 60 }],
                estadoCielo: [{ descripcion: 'Cubierto' }],
              },
            ],
          },
        },
      ]);

      const mockWeatherData: AxiosResponse = {
        data: Buffer.from(mockWeatherJson, 'latin1'),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(mockUrlResponse))
        .mockReturnValueOnce(of(mockWeatherData));

      const result = await service.getWeather('0078', '16');

      expect(result).toHaveLength(1);
      expect(result[0].town).toBe('Toledo');
      expect(result[0].gachasLevel).toBe(GachasLevel.HIGH);
    });

    it('debería manejar diferencias entre las temperaturas de noon y afternoon', async () => {
      const mockUrlResponse: AxiosResponse = {
        data: {
          datos: 'https://datos.fake-url.com/prediccion.json',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };

      const mockWeatherJson = JSON.stringify([
        {
          nombre: 'Toledo',
          provincia: 'Toledo',
          prediccion: {
            dia: [
              {
                fecha: '2025-06-08',
                temperatura: {
                  dato: [
                    { hora: 12, value: 0 },
                    { hora: 18, value: 16 },
                  ],
                },
                probPrecipitacion: [{ periodo: '12-18', value: 60 }],
                estadoCielo: [{ descripcion: 'Cubierto' }],
              },
            ],
          },
        },
      ]);

      const mockWeatherData: AxiosResponse = {
        data: Buffer.from(mockWeatherJson, 'latin1'),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(mockUrlResponse))
        .mockReturnValueOnce(of(mockWeatherData));

      const result = await service.getWeather('0078', '16');

      expect(result).toHaveLength(1);
      expect(result[0].town).toBe('Toledo');
      expect(result[0].gachasLevel).toBe(GachasLevel.HIGH);
      expect(result[0].launchTemperature).toBe(16);
    });

    it('debería lanzar error si AEMET devuelve datos sin estructura válida', async () => {
      const mockUrlResponse: AxiosResponse = {
        data: {
          datos: 'https://datos.fake-url.com/broken.json',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };

      const brokenWeatherData: AxiosResponse = {
        data: [{}],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as AxiosRequestHeaders },
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(mockUrlResponse))
        .mockReturnValueOnce(of(brokenWeatherData));

      await expect(service.getWeather('9999', '99')).rejects.toThrow();
    });

    it('debería lanzar error si AEMET falla en la primera petición', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new Error('Network error');
      });

      await expect(service.getWeather('9999', '99')).rejects.toThrow(
        'Network error',
      );
    });
  });
});
