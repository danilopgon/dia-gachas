import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCatalog } from './catalog';

const REAL_CATALOG = join(
  __dirname,
  '../../../../../frontend/public/data/municipios.json',
);

describe('loadCatalog', () => {
  it('carga el catálogo real con nombres y provincias correctos', () => {
    const catalog = loadCatalog(REAL_CATALOG);
    expect(catalog.towns.size).toBe(8122);
    expect(catalog.towns.get('16023')).toEqual({
      name: 'Chillarón de Cuenca',
      province: 'Cuenca',
    });
    expect(catalog.towns.get('01001')).toEqual({
      name: 'Alegría-Dulantzi',
      province: 'Araba Álava',
    });
  });

  it('lanza si el fichero no es un catálogo válido', () => {
    const path = join(tmpdir(), `catalogo-invalido-${process.pid}.json`);
    writeFileSync(path, JSON.stringify({ version: 2, cities: [] }));
    expect(() => loadCatalog(path)).toThrow(/catálogo/i);
  });

  it('lanza si el fichero no existe', () => {
    expect(() => loadCatalog('/no/existe/municipios.json')).toThrow();
  });
});
