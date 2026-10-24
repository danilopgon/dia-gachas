import { normalizeSearch } from './normalize-search.util';

describe('normalizeSearch', () => {
  it('quita tildes, mayúsculas y espacios sobrantes', () => {
    expect(normalizeSearch('  ÁVILA ')).toBe('avila');
  });

  it('colapsa los espacios intermedios', () => {
    expect(normalizeSearch('Castejón  del Puente')).toBe('castejon del puente');
  });

  it('trata la eñe como n', () => {
    expect(normalizeSearch('Peñíscola')).toBe('peniscola');
  });
});
