import { readFileSync } from 'node:fs';

/** Municipios validados (frontend/public/data/municipios.json), indexados por código de 5 dígitos. */
export interface Catalog {
  towns: Map<string, { name: string; province: string }>;
}

interface CatalogFile {
  version: number;
  provinces: { id: string; name: string }[];
  cities: { id: string; name: string; provinceId: string }[];
}

export function loadCatalog(path: string): Catalog {
  const data = JSON.parse(readFileSync(path, 'utf8')) as CatalogFile;
  if (
    data?.version !== 1 ||
    !Array.isArray(data.provinces) ||
    !Array.isArray(data.cities)
  ) {
    throw new Error(`El catálogo de municipios no es válido: ${path}`);
  }

  const provinces = new Map(data.provinces.map((p) => [p.id, p.name]));
  const towns = new Map<string, { name: string; province: string }>();
  for (const city of data.cities) {
    const province = provinces.get(city.provinceId);
    if (!province)
      throw new Error(
        `El catálogo de municipios no es válido: provincia ${city.provinceId}`,
      );
    towns.set(city.id, { name: city.name, province });
  }
  return { towns };
}
