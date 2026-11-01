#!/usr/bin/env node
/**
 * Gera src/environments/env.generated.ts com as chaves lidas do .env (ou das variáveis de
 * ambiente do sistema, útil no CI e no deploy do GitHub Pages). Os dois arquivos ficam fora do Git (.gitignore).
 *
 * Roda sozinho no npm install, npm start e npm run build. Para rodar à mão:
 *   npm run env
 *
 * Variáveis reconhecidas (formato NOME=valor no .env):
 *   CARTO_BASEMAPS_KEY  → chave dos mapas raster da CARTO (globo da home)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    vars[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return vars;
}

const dotEnv = readDotEnv(path.join(ROOT, '.env'));
const cartoKey = process.env.CARTO_BASEMAPS_KEY || dotEnv.CARTO_BASEMAPS_KEY || '';

const outPath = path.join(ROOT, 'src', 'environments', 'env.generated.ts');
const content = `// Gerado por scripts/set-env.js a partir do .env. Não edite nem versione este arquivo.
export const GENERATED_ENV = {
  cartoBasemapsKey: ${JSON.stringify(cartoKey)},
};
`;
fs.writeFileSync(outPath, content, 'utf8');

console.log(
  cartoKey
    ? '✔  env.generated.ts: CARTO_BASEMAPS_KEY definida'
    : '⚠  env.generated.ts: CARTO_BASEMAPS_KEY vazia (o globo mostrará "API KEY REQUIRED")',
);
