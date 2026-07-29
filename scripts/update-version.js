#!/usr/bin/env node
/**
 * Atualiza a versão do projeto em todos os arquivos relevantes.
 *
 * Uso:
 *   node scripts/update-version.js          → incrementa patch (1.2.0 → 1.2.1)
 *   node scripts/update-version.js patch    → incrementa patch (1.2.0 → 1.2.1)
 *   node scripts/update-version.js minor    → incrementa minor (1.2.0 → 1.3.0)
 *   node scripts/update-version.js major    → incrementa major (1.2.0 → 2.0.0)
 *   node scripts/update-version.js 1.5.0    → define versão exata
 *
 * Ou via npm:
 *   npm run update-version
 *   npm run update-version -- minor
 */

const fs = require('fs');
const path = require('path');

// ── Helpers ────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function formatDatePtBr(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hh}:${mm}`;
}

// ── Determinar nova versão ─────────────────────────────────────────────────

const arg = (process.argv[2] || 'patch').toLowerCase();
const pkgPath = path.join(ROOT, 'package.json');
const pkg = readJson(pkgPath);
const currentVersion = pkg.version;

const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const newVersion = SEMVER_RE.test(arg) ? arg : bumpVersion(currentVersion, arg);

if (!SEMVER_RE.test(newVersion)) {
  console.error(`❌  Versão inválida: "${newVersion}"`);
  process.exit(1);
}

const now = new Date();
const isoDate = now.toISOString();
const ptBrDate = formatDatePtBr(now);

console.log(`\n🔖  Atualizando versão: ${currentVersion}  →  ${newVersion}`);
console.log(`📅  Data: ${ptBrDate}\n`);

// ── 1. package.json ────────────────────────────────────────────────────────

pkg.version = newVersion;
writeJson(pkgPath, pkg);
console.log('✔  package.json');

// ── 2. package-lock.json ──────────────────────────────────────────────────

const lockPath = path.join(ROOT, 'package-lock.json');
if (fs.existsSync(lockPath)) {
  const lock = readJson(lockPath);
  lock.version = newVersion;
  if (lock.packages?.['']) {
    lock.packages[''].version = newVersion;
  }
  writeJson(lockPath, lock);
  console.log('✔  package-lock.json');
}

// ── 3. public/version.json ────────────────────────────────────────────────

const versionJsonPath = path.join(ROOT, 'public', 'version.json');
const versionJson = readJson(versionJsonPath);
versionJson.version = newVersion;
versionJson.buildDate = isoDate;
writeJson(versionJsonPath, versionJson);
console.log('✔  public/version.json');

// ── 4. src/app/config/version.config.ts ───────────────────────────────────

const configPath = path.join(ROOT, 'src', 'app', 'config', 'version.config.ts');
let configContent = fs.readFileSync(configPath, 'utf8');

configContent = configContent
  .replace(/(version:\s*')[^']+(')/, `$1${newVersion}$2`)
  .replace(/(releaseDate:\s*')[^']+(')/, `$1${ptBrDate}$2`);

fs.writeFileSync(configPath, configContent, 'utf8');
console.log('✔  src/app/config/version.config.ts');

// ── Resumo ─────────────────────────────────────────────────────────────────

console.log(`\n✅  Versão atualizada para ${newVersion} com sucesso!\n`);
