import { bulkFixture, makeTarGz } from '../../../../test/fixtures/make-tar-gz';
import { InvalidBulkError, readTarGz } from './tar';

describe('readTarGz', () => {
  it('devuelve cada entrada con su contenido exacto', () => {
    const files = readTarGz(
      makeTarGz({ 'a.json': '{"a":1}', 'b.json': 'ñandú' }),
    );
    expect([...files.keys()]).toEqual(['a.json', 'b.json']);
    expect(files.get('a.json')?.toString()).toBe('{"a":1}');
    expect(files.get('b.json')?.toString('utf8')).toBe('ñandú');
  });

  it('lee el fixture real del agregado', () => {
    const files = readTarGz(makeTarGz(bulkFixture()));
    expect([...files.keys()].sort()).toEqual([
      'localidad_01001.json',
      'localidad_02003.json',
    ]);
  });

  it('se detiene en el bloque de fin de tar', () => {
    const files = readTarGz(makeTarGz({ 'solo.json': '{}' }));
    expect(files.size).toBe(1);
  });

  it('lanza InvalidBulkError si el gzip está truncado', () => {
    const buffer = makeTarGz(bulkFixture());
    expect(() =>
      readTarGz(buffer.subarray(0, Math.floor(buffer.length / 2))),
    ).toThrow(InvalidBulkError);
  });

  it('lanza InvalidBulkError si no es un gzip', () => {
    expect(() => readTarGz(Buffer.from('<html>error</html>'))).toThrow(
      InvalidBulkError,
    );
  });
});
