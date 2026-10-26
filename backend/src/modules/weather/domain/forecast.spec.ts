import { GachasLevel } from '../enums/gachas-level.enum';
import { SimplifiedData } from '../models/simplified-data';
import { assignGachasLevel, ForecastDay, simplifyForecast } from './forecast';

const place = { town: 'Albacete', province: 'Albacete' };

const day = (overrides: Partial<ForecastDay> = {}): ForecastDay => ({
  fecha: '2026-10-26',
  temperatura: {
    dato: [
      { hora: 12, value: 20 },
      { hora: 18, value: 16 },
    ],
  },
  probPrecipitacion: [{ periodo: '12-18', value: 30 }],
  estadoCielo: [{ periodo: '12-18', descripcion: 'Nuboso' }],
  ...overrides,
});

const base: Omit<
  SimplifiedData,
  'launchTemperature' | 'launchTimeRainProbability' | 'skyStatus'
> = {
  town: 'X',
  province: 'X',
  date: '2026-10-26',
};

describe('simplifyForecast', () => {
  it('usa el lugar recibido y conserva la fecha en texto', () => {
    const [result] = simplifyForecast([day()], place);
    expect(result).toMatchObject({
      town: 'Albacete',
      province: 'Albacete',
      date: '2026-10-26',
    });
  });

  it('no recorta días: devuelve uno por cada día recibido', () => {
    expect(simplifyForecast([day(), day(), day()], place)).toHaveLength(3);
  });

  describe('temperatura de la hora de comer', () => {
    const temp = (dato: { hora: number; value?: number }[]) =>
      simplifyForecast([day({ temperatura: { dato } })], place)[0]
        .launchTemperature;

    it('hace la media redondeada de las 12 y las 18 h', () => {
      expect(
        temp([
          { hora: 12, value: 20 },
          { hora: 18, value: 15 },
        ]),
      ).toBe(18);
    });

    it('usa la única disponible', () => {
      expect(temp([{ hora: 12, value: 21 }])).toBe(21);
      expect(temp([{ hora: 18, value: 9 }])).toBe(9);
    });

    it('devuelve 0 sin ninguna', () => {
      expect(temp([])).toBe(0);
    });

    it('ignora un 0 sospechoso si el otro valor se aleja más de 10 grados', () => {
      expect(
        temp([
          { hora: 12, value: 0 },
          { hora: 18, value: 14 },
        ]),
      ).toBe(14);
      expect(
        temp([
          { hora: 12, value: 13 },
          { hora: 18, value: 0 },
        ]),
      ).toBe(13);
    });
  });

  describe('probabilidad de lluvia', () => {
    const rain = (probPrecipitacion: ForecastDay['probPrecipitacion']) =>
      simplifyForecast([day({ probPrecipitacion })], place)[0]
        .launchTimeRainProbability;

    it('prefiere 12-18, después 12-24, 10-16 y el periodo vacío', () => {
      expect(
        rain([
          { periodo: '12-24', value: 5 },
          { periodo: '12-18', value: 40 },
        ]),
      ).toBe(40);
      expect(
        rain([
          { periodo: '00-24', value: 90 },
          { periodo: '12-24', value: 25 },
        ]),
      ).toBe(25);
      expect(rain([{ periodo: '10-16', value: 15 }])).toBe(15);
      expect(rain([{ periodo: '', value: 60 }])).toBe(60);
      expect(rain([{ value: 70 }])).toBe(70);
    });

    it('devuelve 0 sin tramo aplicable', () => {
      expect(rain([{ periodo: '00-06', value: 80 }])).toBe(0);
      expect(rain([])).toBe(0);
    });
  });

  describe('estado del cielo', () => {
    const sky = (estadoCielo: ForecastDay['estadoCielo']) =>
      simplifyForecast([day({ estadoCielo })], place)[0].skyStatus;

    it('usa la última descripción no vacía', () => {
      expect(
        sky([
          { periodo: '00-24', descripcion: '' },
          { periodo: '12-18', descripcion: 'Poco nuboso' },
          { periodo: '18-24', descripcion: 'Nubes altas' },
        ]),
      ).toBe('Nubes altas');
    });

    it('recorta espacios sobrantes', () => {
      expect(sky([{ descripcion: 'Niebla ' }])).toBe('Niebla');
    });

    it("devuelve 'desconocido' sin descripciones", () => {
      expect(sky([{ descripcion: '' }])).toBe('desconocido');
      expect(sky(undefined)).toBe('desconocido');
    });
  });
});

describe('assignGachasLevel', () => {
  const level = (
    launchTemperature: number,
    launchTimeRainProbability: number,
    skyStatus: string,
  ) =>
    assignGachasLevel([
      { ...base, launchTemperature, launchTimeRainProbability, skyStatus },
    ])[0].gachasLevel;

  it('HIGH con frío, lluvia y nubes', () => {
    expect(level(10, 70, 'Cubierto')).toBe(GachasLevel.HIGH);
  });

  it('MEDIUM con templado, algo de lluvia y nubes', () => {
    expect(level(16, 45, 'Nuboso')).toBe(GachasLevel.MEDIUM);
  });

  it('LOW con templado, sin lluvia y nubes altas', () => {
    expect(level(21, 0, 'Nubes altas')).toBe(GachasLevel.LOW);
  });

  it('NONE con calor y sol', () => {
    expect(level(27, 0, 'Despejado')).toBe(GachasLevel.NONE);
  });

  it('trata valores no numéricos como 0 (0 °C puntúa como frío, igual que hasta ahora)', () => {
    expect(level(Number.NaN, Number.NaN, 'Despejado')).toBe(GachasLevel.LOW);
  });
});
