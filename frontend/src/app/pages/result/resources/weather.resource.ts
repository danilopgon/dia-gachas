import { effect, inject, Injectable, resource, signal, Signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  IWeatherData,
  IWeatherMeta,
  IWeatherResponse,
} from '../../../core/models/weather-data.interface';
import { firstValueFrom } from 'rxjs';

export type WeatherErrorKind = 'not-found' | 'unavailable' | 'network';

/** Error de la previsión con su causa, para mostrar un mensaje adecuado. */
export class WeatherLoadError extends Error {
  constructor(readonly kind: WeatherErrorKind) {
    super(kind);
    this.name = 'WeatherLoadError';
  }
}

export interface WeatherResult {
  days: IWeatherData[];
  meta?: IWeatherMeta;
}

function toWeatherError(error: unknown): WeatherLoadError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return new WeatherLoadError('network');
    if (error.status === 404) return new WeatherLoadError('not-found');
  }
  return new WeatherLoadError('unavailable');
}

@Injectable({ providedIn: 'root' })
export class WeatherResource {
  private http = inject(HttpClient);

  createWeatherResource(code: Signal<string>) {
    const debounced = signal('');

    let timer: ReturnType<typeof setTimeout>;

    effect(() => {
      const value = code().trim();

      clearTimeout(timer);
      if (value.length < 5) {
        debounced.set('');
        return;
      }

      timer = setTimeout(() => {
        debounced.set(value);
      }, 300);
    });

    return resource({
      params: () => debounced(),
      loader: async ({ params }): Promise<WeatherResult | null> => {
        if (!params) return null;

        let res: IWeatherResponse;
        try {
          res = await firstValueFrom(
            this.http.get<IWeatherResponse>(`${environment.BACK_URL}/weather/${params}`),
          );
        } catch (error) {
          throw toWeatherError(error);
        }

        if (res.status !== 'ok') throw new WeatherLoadError('unavailable');
        return { days: res.data, meta: res.meta };
      },
    });
  }
}
