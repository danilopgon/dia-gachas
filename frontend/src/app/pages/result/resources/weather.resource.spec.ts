import { TestBed } from '@angular/core/testing';
import { WeatherResource } from './weather.resource';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { WeatherLoadError } from './weather.resource';
import { IWeatherData } from '../../core/models/weather-data.interface';

jest.useFakeTimers();

// Sin zone.js los efectos no corren solos: el debounce vive en un effect y el recurso resuelve en microtareas.
const flush = async () => {
  // debounced() → params → loader: cada salto necesita un tick y sus microtareas.
  for (let round = 0; round < 3; round++) {
    TestBed.tick();
    for (let i = 0; i < 5; i++) await Promise.resolve();
  }
};

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
    TestBed.tick();

    jest.advanceTimersByTime(500);
    await flush();

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
    TestBed.tick();

    expect(weatherResource!.value()).toBeUndefined();

    jest.advanceTimersByTime(400);
    await flush();

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
    TestBed.tick();

    code.set('2');
    TestBed.tick();
    jest.advanceTimersByTime(100);
    await flush();

    code.set('28');
    TestBed.tick();
    jest.advanceTimersByTime(100);
    await flush();

    code.set('28079');
    TestBed.tick();
    jest.advanceTimersByTime(100);
    await flush();

    jest.advanceTimersByTime(400);
    await flush();

    expect(weatherResource!.value()).toEqual({ days: weather, meta: undefined });
  });

  it('devuelve null si el código contiene solo espacios', async () => {
    const code = signal('     ');
    let weatherResource: ReturnType<typeof resource.createWeatherResource>;
    TestBed.runInInjectionContext(() => {
      weatherResource = resource.createWeatherResource(code);
    });
    TestBed.tick();

    jest.advanceTimersByTime(400);
    await flush();

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
    TestBed.tick();

    jest.advanceTimersByTime(400);
    await flush();

    expect(weatherResource!.error()).toBeInstanceOf(Error);
    expect(weatherResource!.hasValue()).toBe(false); // el valor no se setea (en Angular 20 leer value() lanza)
  });

  it('devuelve también los metadatos de frescura', async () => {
    const code = signal('02003');
    const meta = { updatedAt: '2026-10-26T13:19:08.000Z', ageHours: 7.2, stale: true };
    httpMock.get.mockReturnValueOnce(of({ status: 'ok', data: [], meta }));
    let weatherResource: ReturnType<typeof resource.createWeatherResource>;
    TestBed.runInInjectionContext(() => {
      weatherResource = resource.createWeatherResource(code);
    });
    TestBed.tick();

    jest.advanceTimersByTime(400);
    await flush();

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
    TestBed.tick();

    jest.advanceTimersByTime(400);
    await flush();

    const error = weatherResource!.error();
    expect(error).toBeInstanceOf(WeatherLoadError);
    expect((error as WeatherLoadError).kind).toBe(kind);
  });
});
