import { effect, inject, Injectable, resource, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { IWeatherData } from '../../core/models/weather-data.interface';
import { firstValueFrom } from 'rxjs';

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
      request: () => debounced(),
      loader: async ({ request }) => {
        if (!request) return null;

        try {
          const res = await firstValueFrom(
            this.http.get<{ status: string; data: IWeatherData[] }>(
              `${environment.BACK_URL}/weather/${request}`,
            ),
          );

          if (res.status !== 'ok') {
            throw new Error('Respuesta incorrecta del servidor');
          }

          return res.data;
        } catch (err) {
          // Aquí puedes loguear si quieres
          console.error('Error cargando el clima:', err);
          throw new Error('No se pudo cargar el clima'); // Esto lanza el error al resource
        }
      },
    });
  }
}
