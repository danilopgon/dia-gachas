import { bulkFixture } from '../../../../test/fixtures/make-tar-gz';
import {
  assignGachasLevel,
  simplifyForecast,
} from '../../weather/domain/forecast';
import { GachasLevel } from '../../weather/enums/gachas-level.enum';
import { parseBulkEntry } from './bulk-entry';

const raw = (id: string) =>
  Buffer.from(bulkFixture()[`localidad_${id}.json`], 'utf8');

describe('parseBulkEntry', () => {
  it('conserva el código como texto con cero inicial', () => {
    expect(parseBulkEntry(raw('01001'))?.id).toBe('01001');
    expect(parseBulkEntry(raw('02003'))?.id).toBe('02003');
  });

  it('adapta el formato del agregado al de las reglas', () => {
    const entry = parseBulkEntry(raw('02003'));
    expect(entry?.elaborado).toBe('2026-10-26T14:19:08');
    expect(entry?.days).toHaveLength(7);
    const [today] = entry!.days;
    expect(today.fecha).toBe('2026-10-26');
    expect(today.temperatura?.dato).toContainEqual({ hora: 12, value: 23 });
    expect(today.probPrecipitacion).toContainEqual({
      periodo: '12-18',
      value: 0,
    });
    expect(today.probPrecipitacion).toContainEqual({
      periodo: '00-24',
      value: undefined,
    });
    expect(today.estadoCielo).toContainEqual({
      periodo: '18-24',
      descripcion: 'Nubes altas',
    });
  });

  it('normaliza los valores sueltos de los días lejanos', () => {
    const farDay = parseBulkEntry(raw('02003'))!.days[5];
    expect(farDay.probPrecipitacion).toEqual([
      { periodo: undefined, value: 10 },
    ]);
    expect(farDay.estadoCielo).toEqual([
      { periodo: undefined, descripcion: 'Intervalos nubosos' },
    ]);
  });

  it('convierte en array un objeto suelto de un solo elemento', () => {
    const entry = JSON.parse(raw('02003').toString());
    entry.root.prediccion.dia[0].prob_precipitacion = {
      periodo: '12-18',
      valor: '55',
    };
    entry.root.prediccion.dia[0].temperatura.dato = { hora: '12', valor: '7' };
    const [today] = parseBulkEntry(Buffer.from(JSON.stringify(entry)))!.days;
    expect(today.probPrecipitacion).toEqual([{ periodo: '12-18', value: 55 }]);
    expect(today.temperatura?.dato).toEqual([{ hora: 12, value: 7 }]);
  });

  it('ignora una descripción del cielo que no es texto (elemento XML vacío)', () => {
    const entry = JSON.parse(raw('02003').toString());
    entry.root.prediccion.dia[0].estado_cielo[6].descripcion = {};
    const [today] = parseBulkEntry(Buffer.from(JSON.stringify(entry)))!.days;
    expect(() =>
      simplifyForecast([today], { town: 'A', province: 'A' }),
    ).not.toThrow();
    expect(today.estadoCielo?.[6].descripcion).toBeUndefined();
  });

  it.each(['{', '{}', '{"root":{}}', '{"root":{"id":"02003"}}'])(
    'devuelve null con una entrada inválida (%s)',
    (text) => {
      expect(parseBulkEntry(Buffer.from(text))).toBeNull();
    },
  );

  it('produce el mismo resultado que la API actual para Albacete', () => {
    const entry = parseBulkEntry(raw('02003'))!;
    const [today] = assignGachasLevel(
      simplifyForecast(entry.days.slice(0, 1), {
        town: 'Albacete',
        province: 'Albacete',
      }),
    );
    expect(today).toEqual({
      town: 'Albacete',
      province: 'Albacete',
      date: '2026-10-26',
      launchTemperature: 21,
      launchTimeRainProbability: 0,
      skyStatus: 'Nubes altas',
      gachasLevel: GachasLevel.LOW,
    });
  });
});
