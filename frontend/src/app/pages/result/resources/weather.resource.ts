import { debounced, inject, Injectable, resource, Signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  IWeatherData,
  IWeatherMeta,
  IWeatherResponse,
} from '../../../core/models/weather-data.interface';
import { firstValueFrom } from 'rxjs';
import { waitForQuery } from '../../../core/utils/debounce-query.util';

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
    const townCode = debounced(() => {
      const value = code().trim();
      return value.length < 5 ? '' : value;
    }, waitForQuery(300));

    return resource({
      params: () => townCode.value(),
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
