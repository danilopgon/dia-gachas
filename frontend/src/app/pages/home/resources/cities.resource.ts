import { Injectable, Signal, effect, inject, resource, signal } from '@angular/core';
import { MunicipiosCatalogService } from './municipios-catalog.service';

@Injectable({ providedIn: 'root' })
export class CitiesResource {
  private catalog = inject(MunicipiosCatalogService);

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
      // Sin consulta válida el recurso queda inactivo y no descarga el catálogo.
      params: () => debounced() || undefined,
      loader: ({ params }) => this.catalog.search(params),
    });
  }
}
