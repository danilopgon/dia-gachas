import { getWeatherIcon } from './weather-icon.util';

describe('getWeatherIcon', () => {
  it('devuelve "sun" para "día soleado"', () => {
    expect(getWeatherIcon('día soleado')).toBe('sun');
  });

  it('devuelve "cloud" para "nublado con niebla"', () => {
    expect(getWeatherIcon('nublado con niebla')).toBe('cloud');
  });
  
  it('devuelve "cloud" para "rachas de viento fuerte"', () => {
    expect(getWeatherIcon('rachas de viento fuerte')).toBe('cloud');
  });

  it('devuelve "rain" para "probabilidad de lluvia intensa"', () => {
    expect(getWeatherIcon('probabilidad de lluvia intensa')).toBe('rain');
  });

  it('devuelve "storm" para "tormenta con granizo"', () => {
    expect(getWeatherIcon('tormenta con granizo')).toBe('storm');
  });

  it('devuelve "snow" para "nevadas débiles por la tarde"', () => {
    expect(getWeatherIcon('nevadas débiles por la tarde')).toBe('snow');
  });

  it('devuelve "sun" por defecto si no hay coincidencias', () => {
    expect(getWeatherIcon('condiciones agradables')).toBe('sun');
  });
});
