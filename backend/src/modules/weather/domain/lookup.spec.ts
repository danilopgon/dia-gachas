import { Catalog } from '../../ingest/catalog/catalog';
import { Snapshot } from '../../ingest/snapshot/snapshot';
import { SimplifiedData } from '../models/simplified-data';
import {
  lookupForecast,
  madridLocalToUtc,
  STALE_AFTER_HOURS,
  UNAVAILABLE_AFTER_HOURS,
} from './lookup';

const day = (date: string): SimplifiedData => ({
  town: 'Albacete',
  province: 'Albacete',
  date,
  launchTemperature: 21,
  launchTimeRainProbability: 0,
  skyStatus: 'Nubes altas',
});

const snapshotWith = (dates: string[]): Snapshot => ({
  version: 1,
  generatedAt: '2026-10-26T15:52:00.158Z',
  sourceElaborado: '2026-10-26T14:19:08',
  today: dates[0],
  towns: { '02003': dates.map(day) },
  stats: {
    catalog: 3,
    covered: 1,
    missing: ['36011'],
    ignored: [],
    invalidEntries: 0,
  },
});

const catalog: Catalog = {
  towns: new Map([
    ['02003', { name: 'Albacete', province: 'Albacete' }],
    ['36011', { name: 'Cerdedo', province: 'Pontevedra' }],
  ]),
};

const SNAPSHOT = snapshotWith(['2026-10-26', '2026-10-27']);
// Horas de Madrid en invierno (UTC+1).
const at = (iso: string) => new Date(iso);

describe('madridLocalToUtc', () => {
  it('convierte la hora local de Madrid en invierno (UTC+1)', () => {
    expect(madridLocalToUtc('2026-10-26T14:19:08').toISOString()).toBe(
      '2026-10-26T13:19:08.000Z',
    );
  });

  it('convierte la hora local de Madrid en verano (UTC+2)', () => {
    expect(madridLocalToUtc('2026-07-01T12:00:00').toISOString()).toBe(
      '2026-07-01T10:00:00.000Z',
    );
  });
});

describe('lookupForecast', () => {
  it('sirve hoy y mañana con su frescura', () => {
    const result = lookupForecast(
      '02003',
      SNAPSHOT,
      catalog,
      at('2026-10-26T15:00:00Z'),
    );
    expect(result).toEqual({
      kind: 'ok',
      days: [day('2026-10-26'), day('2026-10-27')],
      freshness: {
        updatedAt: '2026-10-26T13:19:08.000Z',
        generatedAt: '2026-10-26T15:52:00.158Z',
        ageHours: 1.7,
        stale: false,
      },
    });
  });

  it(`avisa de datos antiguos desde ${STALE_AFTER_HOURS} h`, () => {
    const result = lookupForecast(
      '02003',
      SNAPSHOT,
      catalog,
      at('2026-10-26T20:00:00Z'),
    );
    expect(result).toMatchObject({
      kind: 'ok',
      freshness: { ageHours: 6.7, stale: true },
    });
  });

  it('tras medianoche en Madrid sirve solo el día de hoy, nunca el de ayer', () => {
    const result = lookupForecast(
      '02003',
      SNAPSHOT,
      catalog,
      at('2026-10-26T23:30:00Z'),
    );
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.days.map((d) => d.date)).toEqual(['2026-10-27']);
    expect(result.freshness.stale).toBe(true);
  });

  it(`deja de servir datos con más de ${UNAVAILABLE_AFTER_HOURS} h`, () => {
    expect(
      lookupForecast('02003', SNAPSHOT, catalog, at('2026-10-27T14:00:00Z')),
    ).toEqual({
      kind: 'unavailable',
      reason: 'too-old',
    });
  });

  it('no sirve nada si el snapshot no incluye hoy', () => {
    const old = snapshotWith(['2026-10-25', '2026-10-26']);
    expect(
      lookupForecast('02003', old, catalog, at('2026-10-26T23:30:00Z')),
    ).toEqual({
      kind: 'unavailable',
      reason: 'no-today',
    });
  });

  it.each(['1001', 'abcde', '020031', '', '02 03'])(
    'rechaza el código %p',
    (code) => {
      expect(
        lookupForecast(code, SNAPSHOT, catalog, at('2026-10-26T15:00:00Z')),
      ).toEqual({
        kind: 'invalid',
      });
    },
  );

  it('distingue un municipio inexistente de uno sin previsión', () => {
    const now = at('2026-10-26T15:00:00Z');
    expect(lookupForecast('99999', SNAPSHOT, catalog, now)).toEqual({
      kind: 'not-found',
    });
    expect(lookupForecast('36011', SNAPSHOT, catalog, now)).toEqual({
      kind: 'unavailable',
      reason: 'no-forecast',
    });
  });

  it('valida el código antes de mirar si hay snapshot', () => {
    const now = at('2026-10-26T15:00:00Z');
    expect(lookupForecast('abc', null, catalog, now)).toEqual({
      kind: 'invalid',
    });
    expect(lookupForecast('99999', null, catalog, now)).toEqual({
      kind: 'not-found',
    });
    expect(lookupForecast('02003', null, catalog, now)).toEqual({
      kind: 'unavailable',
      reason: 'no-snapshot',
    });
  });
});
