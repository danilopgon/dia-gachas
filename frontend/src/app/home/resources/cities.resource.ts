import { Injectable, Signal, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { resource } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ICity } from '../../core/models/city.interface';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CitiesResource {
  private http = inject(HttpClient);

  createSearchResource(query: Signal<string>) {
    const debounced = signal('');

    let timer: ReturnType<typeof setTimeout>;

    effect(() => {
      const value = query().trim();

      clearTimeout(timer);
      if (value.length < 3) {
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
        if (!request) return [];

        const res = await firstValueFrom(
          this.http.get<{ status: string; data: ICity[] }>(`${environment.BACK_URL}/cities`, {
            params: { name: request },
          }),
        );

        return res.data;
      },
    });
  }
}
