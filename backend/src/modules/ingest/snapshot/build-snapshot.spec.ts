import { bulkFixture } from '../../../../test/fixtures/make-tar-gz';
import { parseBulkEntry, BulkEntry } from '../aemet-bulk/bulk-entry';
import { Catalog } from '../catalog/catalog';
import {
  buildSnapshot,
  madridDate,
  MIN_COVERAGE,
  validateSnapshot,
} from './build-snapshot';

const fixture = (id: string) =>
  parseBulkEntry(
    Buffer.from(bulkFixture()[`localidad_${id}.json`], 'utf8'),
  ) as BulkEntry;

const catalogOf = (entries: [string, string, string][]): Catalog => ({
  towns: new Map(
    entries.map(([id, name, province]) => [id, { name, province }]),
  ),
});

const catalog = catalogOf([
  ['02003', 'Albacete', 'Albacete'],
  ['01001', 'Alegría-Dulantzi', 'Araba Álava'],
  ['16023', 'Chillarón de Cuenca', 'Cuenca'],
]);

// 2026-10-26 a las 16:00 en Madrid.
const NOW = new Date('2026-10-26T15:00:00Z');

describe('madridDate', () => {
  it.each([
    ['2026-03-29T01:30:00Z', '2026-03-29'],
    ['2026-10-25T23:30:00Z', '2026-10-26'],
    ['2026-10-26T15:00:00Z', '2026-10-26'],
  ])('%s → %s', (iso, expected) => {
    expect(madridDate(new Date(iso))).toBe(expected);
  });
});

describe('buildSnapshot', () => {
  it('toma nombre y provincia del catálogo, no de AEMET', () => {
    const chillaron = { ...fixture('02003'), id: '16023' };
    const snapshot = buildSnapshot([fixture('02003'), chillaron], catalog, NOW);
    expect(snapshot.towns['02003'][0]).toMatchObject({
      town: 'Albacete',
      province: 'Albacete',
    });
    expect(snapshot.towns['16023'][0]).toMatchObject({
      town: 'Chillarón de Cuenca',
      province: 'Cuenca',
    });
  });

  it('guarda hoy y mañana con las reglas actuales', () => {
    const snapshot = buildSnapshot([fixture('02003')], catalog, NOW);
    expect(snapshot.today).toBe('2026-10-26');
    expect(snapshot.towns['02003'].map((d) => d.date)).toEqual([
      '2026-10-26',
      '2026-10-27',
    ]);
    expect(snapshot.towns['02003'][0]).toMatchObject({
      launchTemperature: 21,
      launchTimeRainProbability: 0,
      skyStatus: 'Nubes altas',
      gachasLevel: 'low',
    });
  });

  it('descarta los días anteriores a hoy en Madrid al cambiar de día (00:30 en invierno, UTC+1)', () => {
    const entry = fixture('02003');
    // Se da al tercer día temperaturas por horas, como haría un agregado ya regenerado.
    entry.days[2] = {
      ...entry.days[2],
      temperatura: {
        dato: [
          { hora: 12, value: 15 },
          { hora: 18, value: 11 },
        ],
      },
    };
    const snapshot = buildSnapshot(
      [entry],
      catalog,
      new Date('2026-10-26T23:30:00Z'),
    );
    expect(snapshot.today).toBe('2026-10-27');
    expect(
      snapshot.towns['02003'].map((d) => [d.date, d.launchTemperature]),
    ).toEqual([
      ['2026-10-27', expect.any(Number)],
      ['2026-10-28', 13],
    ]);
  });

  it('deja como ausente un municipio si falta mañana entre sus días', () => {
    const entry = fixture('02003');
    entry.days = entry.days.filter((day) => day.fecha !== '2026-10-27');
    entry.days[1] = {
      ...entry.days[1],
      temperatura: {
        dato: [
          { hora: 12, value: 15 },
          { hora: 18, value: 11 },
        ],
      },
    };
    const snapshot = buildSnapshot([entry], catalog, NOW);
    expect(snapshot.towns['02003']).toBeUndefined();
    expect(snapshot.stats.missing).toContain('02003');
  });

  it('deja como ausente un municipio si mañana no trae temperaturas por horas', () => {
    // A las 00:10 de Madrid el agregado aún es el del día anterior: el nuevo «mañana» es el
    // tercer día del fichero, que solo trae máximas y mínimas.
    const snapshot = buildSnapshot(
      [fixture('02003')],
      catalog,
      new Date('2026-10-26T23:10:00Z'),
    );
    expect(snapshot.today).toBe('2026-10-27');
    expect(snapshot.towns['02003']).toBeUndefined();
    expect(snapshot.stats.missing).toContain('02003');
  });

  it('deja como ausente un municipio cuya previsión no incluye hoy', () => {
    const snapshot = buildSnapshot(
      [fixture('02003')],
      catalog,
      new Date('2026-11-05T12:00:00Z'),
    );
    expect(snapshot.towns['02003']).toBeUndefined();
    expect(snapshot.stats.missing).toContain('02003');
  });

  it('cuenta ausentes, ignorados y entradas inválidas', () => {
    const extra = { ...fixture('02003'), id: '04904' };
    const snapshot = buildSnapshot(
      [fixture('02003'), extra, null],
      catalog,
      NOW,
    );
    expect(snapshot.stats).toEqual({
      catalog: 3,
      covered: 1,
      missing: ['01001', '16023'],
      ignored: ['04904'],
      invalidEntries: 1,
    });
    expect(snapshot.towns['04904']).toBeUndefined();
  });

  it('ignora un elaborado con zona horaria o mal formado al elegir el más reciente', () => {
    const withZone = {
      ...fixture('01001'),
      elaborado: '2026-10-27T08:00:00+01:00',
    };
    const snapshot = buildSnapshot([fixture('02003'), withZone], catalog, NOW);
    expect(snapshot.sourceElaborado).toBe('2026-10-26T14:19:08');
  });

  it('usa claves de 5 dígitos y el elaborado más reciente', () => {
    const older = { ...fixture('01001'), elaborado: '2026-10-26T08:00:00' };
    const snapshot = buildSnapshot([fixture('02003'), older], catalog, NOW);
    expect(Object.keys(snapshot.towns).sort()).toEqual(['01001', '02003']);
    expect(snapshot.sourceElaborado).toBe('2026-10-26T14:19:08');
    expect(snapshot.generatedAt).toBe(NOW.toISOString());
    expect(snapshot.version).toBe(1);
  });
});

describe('validateSnapshot', () => {
  const full = () =>
    buildSnapshot(
      [fixture('02003'), fixture('01001')],
      catalogOf([
        ['02003', 'Albacete', 'Albacete'],
        ['01001', 'Alegría-Dulantzi', 'Araba Álava'],
      ]),
      NOW,
    );

  it('acepta un snapshot completo', () => {
    expect(validateSnapshot(full())).toEqual([]);
  });

  it(`rechaza una cobertura inferior al ${MIN_COVERAGE * 100} %`, () => {
    const snapshot = full();
    snapshot.stats = { ...snapshot.stats, catalog: 8122, covered: 8000 };
    expect(validateSnapshot(snapshot)).toEqual([
      expect.stringMatching(/cobertura/i),
    ]);
  });

  it('rechaza un snapshot vacío', () => {
    const snapshot = buildSnapshot([], catalog, NOW);
    expect(validateSnapshot(snapshot).join(' ')).toMatch(/vacío/i);
  });

  it.each([
    ['vacío', ''],
    ['mal formado', '26/10/2026 14:19'],
    ['en el futuro', '2026-10-26T18:00:00'],
  ])('rechaza un elaborado %s', (_name, sourceElaborado) => {
    const snapshot = { ...full(), sourceElaborado };
    expect(validateSnapshot(snapshot).join(' ')).toMatch(/elaborado/i);
  });

  it('rechaza municipios sin exactamente dos días', () => {
    const snapshot = full();
    snapshot.towns['02003'] = snapshot.towns['02003'].slice(0, 1);
    expect(validateSnapshot(snapshot).join(' ')).toMatch(/02003/);
  });
});
