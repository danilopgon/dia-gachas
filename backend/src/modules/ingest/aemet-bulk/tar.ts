import { gunzipSync } from 'node:zlib';

/** El agregado de AEMET no se puede leer (gzip o tar dañado). */
export class InvalidBulkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBulkError';
  }
}

const BLOCK = 512;

const field = (header: Buffer, start: number, length: number) =>
  header
    .subarray(start, start + length)
    .toString('utf8')
    .replace(/\0.*$/s, '');

/** Descomprime un tar.gz y devuelve sus ficheros regulares por nombre (parser ustar mínimo). */
export function readTarGz(buffer: Buffer): Map<string, Buffer> {
  let tar: Buffer;
  try {
    tar = gunzipSync(buffer);
  } catch (error) {
    throw new InvalidBulkError(
      `El agregado no es un gzip válido: ${(error as Error).message}`,
    );
  }

  const files = new Map<string, Buffer>();
  for (let offset = 0; offset + BLOCK <= tar.length;) {
    const header = tar.subarray(offset, offset + BLOCK);
    if (header.every((byte) => byte === 0)) break;

    const name = field(header, 0, 100);
    const size = parseInt(field(header, 124, 12).trim() || '0', 8);
    const type = String.fromCharCode(header[156]);
    if (!Number.isFinite(size) || offset + BLOCK + size > tar.length) {
      throw new InvalidBulkError(`Entrada del tar truncada: ${name}`);
    }

    if (type === '0' || type === '\0') {
      files.set(name, tar.subarray(offset + BLOCK, offset + BLOCK + size));
    }
    offset += BLOCK + Math.ceil(size / BLOCK) * BLOCK;
  }
  return files;
}
