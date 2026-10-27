import { Injectable, Signal, debounced, inject, resource } from '@angular/core';
import { waitForQuery } from '../../../core/utils/debounce-query.util';
import { MunicipiosCatalogService } from './municipios-catalog.service';

@Injectable({ providedIn: 'root' })
export class CitiesResource {
  private catalog = inject(MunicipiosCatalogService);

  createSearchResource(query: Signal<string>) {
    const term = debounced(() => {
      const value = query().trim();
      return value.length < 3 ? '' : value;
    }, waitForQuery(300));

    return resource({
      // Sin consulta válida el recurso queda inactivo y no descarga el catálogo.
      params: () => term.value() || undefined,
      loader: ({ params }) => this.catalog.search(params),
    });
  }
}
