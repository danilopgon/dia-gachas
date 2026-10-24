import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildCatalog, serializeCatalog, validateCatalog } from './catalogo.mjs';

const SOURCE = { repo: 'danilopgon/localidades-provincias-aemet', revision: 'abc123' };

const provinces = [
  { id: '28', name: 'Madrid' },
  { id: '01', name: 'Araba Álava' },
];
const cityLists = [
  [
    { id: '28079', provinceId: '28', name: 'Madrid' },
    { id: '28901', provinceId: '28', name: 'Alcorcón' },
  ],
  [{ id: '01001', provinceId: '01', name: 'Alegría-Dulantzi' }],
];

const validCatalog = () => buildCatalog(provinces, cityLists, SOURCE);

describe('buildCatalog', () => {
  it('ordena provincias y municipios por id y conserva los ceros iniciales', () => {
    const catalog = validCatalog();
    assert.deepEqual(
      catalog.provinces.map((p) => p.id),
      ['01', '28'],
    );
    assert.deepEqual(
      catalog.cities.map((c) => c.id),
      ['01001', '28079', '28901'],
    );
    assert.equal(typeof catalog.cities[0].id, 'string');
    assert.deepEqual(catalog.source, SOURCE);
    assert.equal(catalog.version, 1);
  });

  it('produce los mismos bytes con independencia del orden de entrada', () => {
    const shuffled = buildCatalog(
      [...provinces].reverse(),
      [...cityLists].reverse().map((list) => [...list].reverse()),
      SOURCE,
    );
    assert.equal(serializeCatalog(shuffled), serializeCatalog(validCatalog()));
  });
});

describe('validateCatalog', () => {
  it('acepta un catálogo válido, incluidos los códigos especiales xx9xx', () => {
    assert.deepEqual(validateCatalog(validCatalog()), []);
  });

  const withCities = (cities) => ({ ...validCatalog(), cities });

  it('detecta ids duplicados', () => {
    const { cities } = validCatalog();
    assert.equal(validateCatalog(withCities([...cities, cities[0]])).length > 0, true);
  });

  it('detecta ids que no son cadenas de cinco dígitos', () => {
    for (const id of [1001, '1001', '010011', '0100A']) {
      const errors = validateCatalog(withCities([{ id, provinceId: '01', name: 'X' }, ...validCatalog().cities.slice(1)]));
      assert.ok(errors.length > 0, `debería rechazar ${JSON.stringify(id)}`);
    }
  });

  it('detecta provincias inexistentes y prefijos que no cuadran con la provincia', () => {
    const { cities } = validCatalog();
    assert.ok(validateCatalog(withCities([...cities, { id: '99001', provinceId: '99', name: 'X' }])).length > 0);
    assert.ok(validateCatalog(withCities([...cities, { id: '28002', provinceId: '01', name: 'X' }])).length > 0);
  });

  it('detecta provincias sin municipios', () => {
    const { cities } = validCatalog();
    assert.ok(validateCatalog(withCities(cities.filter((c) => c.provinceId !== '01'))).length > 0);
  });

  it('detecta nombres vacíos o con espacios sobrantes', () => {
    const { cities } = validCatalog();
    for (const name of ['', '  ', ' Madrid', 'Madrid ']) {
      const errors = validateCatalog(withCities([{ ...cities[0], name }, ...cities.slice(1)]));
      assert.ok(errors.length > 0, `debería rechazar ${JSON.stringify(name)}`);
    }
  });
});

describe('frontend/public/data/municipios.json', () => {
  const raw = readFileSync(new URL('../../frontend/public/data/municipios.json', import.meta.url), 'utf8');
  const catalog = JSON.parse(raw);

  it('es válido, tiene 52 provincias y procede de la revisión fijada', () => {
    assert.deepEqual(validateCatalog(catalog), []);
    assert.equal(catalog.provinces.length, 52);
    assert.equal(catalog.source.revision, 'c16edb527055f886337b353ae1a2a3d2da1472b8');
  });

  it('es determinista: regenerarlo desde sus datos da los mismos bytes', () => {
    assert.equal(serializeCatalog(buildCatalog(catalog.provinces, [catalog.cities], catalog.source)), raw);
  });
});
