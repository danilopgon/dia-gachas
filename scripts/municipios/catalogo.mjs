// Catálogo estático de municipios para el buscador del frontend.

export const CATALOG_VERSION = 1;

const CITY_ID = /^\d{5}$/;
const PROVINCE_ID = /^\d{2}$/;

const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Une provincias y listas de municipios en un catálogo ordenado por id,
 * con un orden de claves fijo para que la serialización sea determinista.
 */
export function buildCatalog(provinces, cityLists, source) {
  return {
    version: CATALOG_VERSION,
    source: { repo: source.repo, revision: source.revision },
    provinces: provinces.map(({ id, name }) => ({ id, name })).sort(byId),
    cities: cityLists
      .flat()
      .map(({ id, name, provinceId }) => ({ id, name, provinceId }))
      .sort(byId),
  };
}

export function serializeCatalog(catalog) {
  return `${JSON.stringify(catalog)}\n`;
}

const isValidName = (name) => typeof name === 'string' && name.length > 0 && name === name.trim();

/** Devuelve los errores del catálogo; una lista vacía significa que es válido. */
export function validateCatalog(catalog) {
  const errors = [];
  const provinceIds = new Set();

  for (const province of catalog.provinces) {
    if (typeof province.id !== 'string' || !PROVINCE_ID.test(province.id)) {
      errors.push(`Provincia con id inválido: ${JSON.stringify(province.id)}`);
    }
    if (provinceIds.has(province.id)) errors.push(`Provincia duplicada: ${province.id}`);
    if (!isValidName(province.name)) errors.push(`Provincia ${province.id} con nombre inválido`);
    provinceIds.add(province.id);
  }

  const cityIds = new Set();
  const citiesPerProvince = new Map();

  for (const city of catalog.cities) {
    const label = JSON.stringify(city.id);
    if (typeof city.id !== 'string' || !CITY_ID.test(city.id)) {
      errors.push(`Municipio con id inválido: ${label}`);
    }
    if (cityIds.has(city.id)) errors.push(`Municipio duplicado: ${label}`);
    cityIds.add(city.id);

    if (!provinceIds.has(city.provinceId)) {
      errors.push(`Municipio ${label} con provincia inexistente: ${JSON.stringify(city.provinceId)}`);
    } else if (typeof city.id === 'string' && !city.id.startsWith(city.provinceId)) {
      errors.push(`Municipio ${label} no empieza por su provincia ${city.provinceId}`);
    }
    if (!isValidName(city.name)) errors.push(`Municipio ${label} con nombre inválido`);

    citiesPerProvince.set(city.provinceId, (citiesPerProvince.get(city.provinceId) ?? 0) + 1);
  }

  for (const id of provinceIds) {
    if (!citiesPerProvince.has(id)) errors.push(`Provincia ${id} sin municipios`);
  }

  return errors;
}
