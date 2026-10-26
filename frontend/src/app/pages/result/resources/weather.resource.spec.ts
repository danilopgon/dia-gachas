import { TestBed } from '@angular/core/testing';
import { WeatherResource } from './weather.resource';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { WeatherLoadError } from './weather.resource';
import { IWeatherData } from '../../core/models/weather-data.interface';

jest.useFakeTimers();

describe('WeatherResource (TestBed + runInInjectionContext)', () => {
  let resource: WeatherResource;
  let httpMock: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpMock = { get: jest.fn() } as any;
    TestBed.configureTestingModule({
      providers: [WeatherResource, { provide: HttpClient, useValue: httpMock }],
    });
    resource = TestBed.inject(WeatherResource);
  });

  it('no llama a la API ni cambia el valor si el código tiene menos de 5 caracteres', async () => {
    const code = signal('1234');
    let weatherResource: ReturnType<typeof resource.createWeatherResource>;
    TestBed.runInInjectionContext(() => {
      weatherResource = resource.createWeatherResource(code);
    });

    jest.advanceTimersByTime(500);
    await Promise.resolve();
    await Promise.resolve();

    expect(weatherResource!.value()).toBe(null);
    expect(httpMock.get).not.toHaveBeenCalled();
  });

  it('llama a la API y actualiza el valor tras el debounce', async () => {
    const code = signal('28079');
    const weather: IWeatherData[] = [{ date: '2025-07-31', temp: 35 }] as any;
    httpMock.get.mockReturnValueOnce(of({ status: 'ok', data: weather }));

    let weatherResource: ReturnType<typeof resource.createWeatherResource>;
    TestBed.runInInjectionContext(() => {
      weatherResource = resource.createWeatherResource(code);
    });

    expect(weatherResource!.value()).toBeUndefined();

    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(weatherResource!.value()).toEqual({ days: weather, meta: undefined });
    expect(httpMock.get).toHaveBeenCalledWith(expect.stringContaining('/weather/28079'));
  });

  it('si el código cambia rápidamente, solo se usa el último valor tras el debounce', async () => {
    const code = signal('');
    const weather: IWeatherData[] = [{ date: '2025-07-31', temp: 30 }] as any;
    httpMock.get.mockReturnValueOnce(of({ status: 'ok', data: weather }));

    let weatherResource: ReturnType<typeof resource.createWeatherResource>;
    TestBed.runInInjectionContext(() => {
      weatherResource = resource.createWeatherResource(code);
    });

    code.set('2');
    jest.advanceTimersByTime(100);
    await Promise.resolve();

    code.set('28');
    jest.advanceTimersByTime(100);
    await Promise.resolve();

    code.set('28079');
    jest.advanceTimersByTime(100);
    await Promise.resolve();

    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(weatherResource!.value()).toEqual({ days: weather, meta: undefined });
  });

  it('devuelve null si el código contiene solo espacios', async () => {
    const code = signal('     ');
    let weatherResource: ReturnType<typeof resource.createWeatherResource>;
    TestBed.runInInjectionContext(() => {
      weatherResource = resource.createWeatherResource(code);
    });

    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(weatherResource!.value()).toBe(null);
    expect(httpMock.get).not.toHaveBeenCalled();
  });

  it('marca un error si la respuesta tiene status distinto de "ok"', async () => {
    const code = signal('28079');
    httpMock.get.mockReturnValueOnce(of({ status: 'error' }));

    let weatherResource: ReturnType<typeof resource.createWeatherResource>;
    TestBed.runInInjectionContext(() => {
      weatherResource = resource.createWeatherResource(code);
    });

    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(weatherResource!.error()).toBeInstanceOf(Error);
    expect(weatherResource!.value()).toBeUndefined(); // el valor no se setea
  });

  it('devuelve también los metadatos de frescura', async () => {
    const code = signal('02003');
    const meta = { updatedAt: '2026-10-26T13:19:08.000Z', ageHours: 7.2, stale: true };
    httpMock.get.mockReturnValueOnce(of({ status: 'ok', data: [], meta }));
    let weatherResource: ReturnType<typeof resource.createWeatherResource>;
    TestBed.runInInjectionContext(() => {
      weatherResource = resource.createWeatherResource(code);
    });

    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(weatherResource!.value()).toEqual({ days: [], meta });
  });

  it.each([
    [404, 'not-found'],
    [503, 'unavailable'],
    [500, 'unavailable'],
    [0, 'network'],
  ])('clasifica un HTTP %i como error %s', async (status, kind) => {
    const code = signal('02003');
    httpMock.get.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status })));
    let weatherResource: ReturnType<typeof resource.createWeatherResource>;
    TestBed.runInInjectionContext(() => {
      weatherResource = resource.createWeatherResource(code);
    });

    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();

    const error = weatherResource!.error();
    expect(error).toBeInstanceOf(WeatherLoadError);
    expect((error as WeatherLoadError).kind).toBe(kind);
  });
});
