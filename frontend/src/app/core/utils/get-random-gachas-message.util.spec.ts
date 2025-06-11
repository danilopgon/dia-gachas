import { getRandomGachasMessage } from './get-random-gachas-message.util';
import { GachasLevel } from '../enums/gachas-level.enum';
import { GACHAS_MESSAGES } from '../constants/gachas-messages.constant';

describe('getRandomGachasMessage', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devuelve una frase aleatoria del nivel indicado', () => {
    const level = GachasLevel.MEDIUM;
    const result = getRandomGachasMessage(level);
    const messages = GACHAS_MESSAGES[level];
    const expectedIndex = Math.floor(0.5 * messages.length);
    expect(result).toBe(messages[expectedIndex]);
  });

  it('devuelve mensaje de fallback si no hay mensajes para el nivel', () => {
    const fakeLevel = 'ultra' as GachasLevel;
    const result = getRandomGachasMessage(fakeLevel);
    expect(result).toBe('No hay mensaje disponible.');
  });
});
