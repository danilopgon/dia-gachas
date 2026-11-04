import {
  CLOUD_COLORS,
  COLD_TINT,
  HOT_TINT,
  INK,
  SKY,
  TINT_MAX_ALPHA,
  contrastRatio,
  describeWeather,
  mixColors,
} from './weather-scene.util';

const scene = (sky: string, rain = 0, temp = 15) => describeWeather(sky, rain, temp);

describe('describeWeather', () => {
  describe('estado del cielo', () => {
    it('deja el sol solo con "Despejado"', () => {
      expect(scene('Despejado')).toMatchObject({ sun: true, cloudCover: 0, rain: 0, snow: 0, fog: 0 });
    });

    it('reconoce la variante nocturna de AEMET', () => {
      expect(scene('Poco nuboso noche')).toEqual(scene('Poco nuboso'));
    });

    it('aumenta la cobertura de nubes de poco nuboso a cubierto', () => {
      const covers = ['Poco nuboso', 'Intervalos nubosos', 'Nuboso', 'Muy nuboso', 'Cubierto'].map(
        (sky) => scene(sky).cloudCover,
      );
      expect(covers).toEqual([...covers].sort((a, b) => a - b));
      expect(new Set(covers).size).toBe(covers.length);
      expect(covers[4]).toBe(1);
    });

    it('esconde el sol cuando el cielo está muy cerrado', () => {
      expect(scene('Intervalos nubosos').sun).toBe(true);
      expect(scene('Muy nuboso').sun).toBe(false);
      expect(scene('Cubierto').sun).toBe(false);
    });

    it.each(['Niebla', 'Bruma', 'Neblina', 'Calima'])('dibuja bandas de "%s"', (sky) => {
      const fog = scene(sky);
      expect(fog.fog).toBeGreaterThan(0);
      expect(fog.sun).toBe(false);
    });

    it('deja el cielo vacío si AEMET no da descripción', () => {
      expect(scene('desconocido')).toMatchObject({ sun: false, cloudCover: 0, rain: 0, snow: 0, fog: 0 });
    });

    it('no distingue mayúsculas ni tildes', () => {
      expect(scene('CUBIERTO CON LLUVIA')).toEqual(scene('Cubierto con lluvia'));
      expect(scene('Nubes altas').cloudCover).toBeGreaterThan(0);
    });
  });

  describe('precipitación', () => {
    it('la nube no tapa la lluvia en las descripciones compuestas', () => {
      const wet = scene('Nuboso con lluvia', 60);
      expect(wet.rain).toBeGreaterThan(0);
      expect(wet.cloudCover).toBeGreaterThan(0);
    });

    it('densifica la lluvia con la probabilidad', () => {
      expect(scene('Nuboso con lluvia', 90).rain).toBeGreaterThan(scene('Nuboso con lluvia', 40).rain);
    });

    it('dibuja algo de lluvia aunque la probabilidad sea baja', () => {
      expect(scene('Intervalos nubosos con lluvia escasa', 0).rain).toBeGreaterThan(0);
    });

    it('no inventa lluvia si el cielo no la anuncia', () => {
      expect(scene('Nuboso', 80).rain).toBe(0);
    });

    it('la nieve no se dibuja como lluvia', () => {
      const snowy = scene('Cubierto con nieve', 70);
      expect(snowy.snow).toBeGreaterThan(0);
      expect(snowy.rain).toBe(0);
    });

    it('la tormenta trae relámpagos, lluvia y un cielo cerrado', () => {
      const storm = scene('Muy nuboso con tormenta', 10);
      expect(storm.lightning).toBe(true);
      expect(storm.rain).toBeGreaterThan(0);
      expect(storm.storm).toBe(true);
      expect(storm.sun).toBe(false);
    });

    it('solo hay relámpagos con tormenta', () => {
      expect(scene('Cubierto con lluvia', 100).lightning).toBe(false);
    });

    it('mantiene la densidad entre 0 y 1 con datos fuera de rango', () => {
      expect(scene('Nuboso con lluvia', 400).rain).toBeLessThanOrEqual(1);
      expect(scene('Nuboso con lluvia', -40).rain).toBeGreaterThanOrEqual(0);
    });
  });

  describe('temperatura', () => {
    it('tiñe de frío bajo 15 °C y de calor por encima', () => {
      expect(scene('Despejado', 0, 15).warmth).toBe(0);
      expect(scene('Despejado', 0, 5).warmth).toBeLessThan(0);
      expect(scene('Despejado', 0, 30).warmth).toBeGreaterThan(0);
    });

    it('satura la calidez en los extremos', () => {
      expect(scene('Despejado', 0, -30).warmth).toBe(-1);
      expect(scene('Despejado', 0, 50).warmth).toBe(1);
    });
  });
});

describe('legibilidad de la tinta sobre el cielo animado', () => {
  it.each(Object.entries(CLOUD_COLORS))('nube %s: al menos 4,5:1', (_name, color) => {
    expect(contrastRatio(INK, color)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['frío', COLD_TINT],
    ['calor', HOT_TINT],
  ])('cielo teñido de %s: al menos 4,5:1', (_name, tint) => {
    expect(contrastRatio(INK, mixColors(SKY, tint, TINT_MAX_ALPHA))).toBeGreaterThanOrEqual(4.5);
  });
});
