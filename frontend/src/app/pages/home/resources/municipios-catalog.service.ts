import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ICity } from '../../../core/models/city.interface';
import { normalizeSearch } from '../../../core/utils/normalize-search.util';

export const MUNICIPIOS_URL = '/data/municipios.json';

interface MunicipiosCatalog {
  version: number;
  provinces: { id: string; name: string }[];
  cities: { id: string; name: string; provinceId: string }[];
}

interface IndexedCity {
  city: ICity;
  normalizedName: string;
}

// Rango de una coincidencia: empieza por la consulta, la contiene al inicio de una palabra o en cualquier punto.
const WORD_SEPARATORS = [' ', '-', '/', "'", '('];

function matchRank(normalizedName: string, query: string): number {
  if (normalizedName.startsWith(query)) return 0;
  if (WORD_SEPARATORS.some(separator => normalizedName.includes(separator + query))) return 1;
  if (normalizedName.includes(query)) return 2;
  return -1;
}

@Injectable({ providedIn: 'root' })
export class MunicipiosCatalogService {
  private readonly http = inject(HttpClient);
  private catalog?: Promise<IndexedCity[]>;

  load(): Promise<IndexedCity[]> {
    this.catalog ??= firstValueFrom(this.http.get<MunicipiosCatalog>(MUNICIPIOS_URL))
      .then(data => this.index(data))
      .catch((error: unknown) => {
        // Se olvida la promesa fallida para que la siguiente búsqueda reintente la descarga.
        this.catalog = undefined;
        throw error;
      });
    return this.catalog;
  }

  async search(query: string, limit = 20): Promise<ICity[]> {
    const normalizedQuery = normalizeSearch(query);
    const cities = await this.load();

    return cities
      .map(entry => ({ entry, rank: matchRank(entry.normalizedName, normalizedQuery) }))
      .filter(({ rank }) => rank >= 0)
      .sort(
        (a, b) =>
          a.rank - b.rank ||
          a.entry.city.name.localeCompare(b.entry.city.name, 'es') ||
          a.entry.city.province.name.localeCompare(b.entry.city.province.name, 'es'),
      )
      .slice(0, limit)
      .map(({ entry }) => entry.city);
  }

  private index(data: MunicipiosCatalog): IndexedCity[] {
    const provinces = new Map(data.provinces.map(province => [province.id, province]));
    return data.cities.map(({ id, name, provinceId }) => ({
      city: { id, name, province: provinces.get(provinceId) ?? { id: provinceId, name: '' } },
      normalizedName: normalizeSearch(name),
    }));
  }
}
