// Genera frontend/public/data/municipios.json desde un checkout de
// danilopgon/localidades-provincias-aemet en una revisión concreta.
//
// Uso: pnpm municipios:generar --source <ruta-checkout> --revision <sha>

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { buildCatalog, serializeCatalog, validateCatalog } from './catalogo.mjs';

const REPO = 'danilopgon/localidades-provincias-aemet';
const OUTPUT = new URL('../../frontend/public/data/municipios.json', import.meta.url);

const { values } = parseArgs({
  options: { source: { type: 'string' }, revision: { type: 'string' } },
});

if (!values.source || !values.revision) {
  console.error('Uso: pnpm municipios:generar --source <ruta-checkout> --revision <sha>');
  process.exit(1);
}

const head = execFileSync('git', ['-C', values.source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (head !== values.revision) {
  console.error(`El checkout está en ${head}, no en ${values.revision}`);
  process.exit(1);
}

const dataDir = join(values.source, 'data');
const readJson = (file) => JSON.parse(readFileSync(join(dataDir, file), 'utf8'));

const provinces = readJson('provincias.json');
const cityLists = readdirSync(dataDir)
  .filter((file) => /^localidades_\d{2}\.json$/.test(file))
  .map(readJson);

const catalog = buildCatalog(provinces, cityLists, { repo: REPO, revision: values.revision });
const errors = validateCatalog(catalog);

if (errors.length > 0) {
  console.error(`Catálogo inválido (${errors.length} errores):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

writeFileSync(OUTPUT, serializeCatalog(catalog));

const special = catalog.cities.filter((city) => city.id[2] === '9').length;
console.log(
  `Provincias: ${catalog.provinces.length}. Municipios: ${catalog.cities.length} (${special} con código xx9xx).`,
);
