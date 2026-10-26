import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

/** Empaqueta ficheros en un tar.gz (ustar mínimo) para los tests de la ingesta. */
export function makeTarGz(files: Record<string, string | Buffer>): Buffer {
  const blocks: Buffer[] = [];
  for (const [name, content] of Object.entries(files)) {
    const body = Buffer.isBuffer(content)
      ? content
      : Buffer.from(content, 'utf8');
    const header = Buffer.alloc(512);
    header.write(name, 0, 100, 'utf8');
    header.write('0000644\0', 100, 8, 'latin1');
    header.write('0000000\0', 108, 8, 'latin1');
    header.write('0000000\0', 116, 8, 'latin1');
    header.write(
      body.length.toString(8).padStart(11, '0') + '\0',
      124,
      12,
      'latin1',
    );
    header.write('00000000000\0', 136, 12, 'latin1');
    header.write('        ', 148, 8, 'latin1');
    header.write('0', 156, 1, 'latin1');
    header.write('ustar\0', 257, 6, 'latin1');
    header.write('00', 263, 2, 'latin1');
    const checksum = header.reduce((sum, byte) => sum + byte, 0);
    header.write(
      checksum.toString(8).padStart(6, '0') + '\0 ',
      148,
      8,
      'latin1',
    );
    blocks.push(header, body, Buffer.alloc((512 - (body.length % 512)) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks));
}

/** Entradas crudas del fixture real (Albacete 02003 y Alegría-Dulantzi 01001). */
export const bulkFixture = (): Record<string, string> => {
  const entries: { root: { id: string } }[] = JSON.parse(
    readFileSync(join(__dirname, 'aemet-bulk-extracto.json'), 'utf8'),
  );
  return Object.fromEntries(
    entries.map((entry) => [
      `localidad_${entry.root.id}.json`,
      JSON.stringify(entry),
    ]),
  );
};
