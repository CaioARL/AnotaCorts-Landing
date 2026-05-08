const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Caminhos dos arquivos relativos à raiz do projeto
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const VERSION_JSON_PATH = path.join(process.cwd(), 'public', 'version.json');
const VERSION_CONFIG_PATH = path.join(process.cwd(), 'src', 'app', 'config', 'version.config.ts');

function getLocalISOString() {
  const date = new Date();
  const tzoffset = date.getTimezoneOffset() * 60000; // offset em milissegundos
  const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, -1);

  const offsetMinutes = date.getTimezoneOffset();
  const absOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = Math.floor(absOffsetMinutes / 60);
  const offsetMins = absOffsetMinutes % 60;
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const pad = (num) => String(num).padStart(2, '0');

  return `${localISOTime}${sign}${pad(offsetHours)}:${pad(offsetMins)}`;
}

function getFormattedDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
  const yyyy = today.getFullYear();
  const hh = String(today.getHours()).padStart(2, '0');
  const min = String(today.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
}

function bumpVersion(currentVersion, bumpType = 'patch') {
  const parts = currentVersion.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Formato de versão inválido no package.json: ${currentVersion}`);
  }

  let [major, minor, patch] = parts;
  if (bumpType === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bumpType === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}

function main() {
  try {
    // 1. Ler package.json para obter a versão atual
    if (!fs.existsSync(PACKAGE_JSON_PATH)) {
      throw new Error(`Arquivo package.json não encontrado em: ${PACKAGE_JSON_PATH}`);
    }
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    const currentVersion = packageJson.version || '1.0.0';

    // 2. Determinar a nova versão baseada nos argumentos
    const arg = process.argv[2] ? process.argv[2].trim().toLowerCase() : 'patch';
    let newVersion = '';

    if (/^\d+\.\d+\.\d+$/.test(arg)) {
      newVersion = arg;
    } else if (['major', 'minor', 'patch'].includes(arg)) {
      newVersion = bumpVersion(currentVersion, arg);
    } else {
      console.warn(`Argumento '${arg}' não reconhecido. Usando bump padrão: 'patch'`);
      newVersion = bumpVersion(currentVersion, 'patch');
    }

    const buildDate = getLocalISOString();
    const releaseDate = getFormattedDate();

    console.log(`\n==============================================`);
    console.log(`Atualizando versão: ${currentVersion} ➔ ${newVersion}`);
    console.log(`Data de lançamento: ${releaseDate}`);
    console.log(`Data de build:      ${buildDate}`);
    console.log(`==============================================\n`);

    // 3. Atualizar package.json
    packageJson.version = newVersion;
    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`✓ Atualizado: package.json`);

    // 4. Atualizar public/version.json
    if (fs.existsSync(VERSION_JSON_PATH)) {
      const versionJson = JSON.parse(fs.readFileSync(VERSION_JSON_PATH, 'utf8'));
      versionJson.version = newVersion;
      versionJson.buildDate = buildDate;
      fs.writeFileSync(VERSION_JSON_PATH, JSON.stringify(versionJson, null, 2), 'utf8');
      console.log(`✓ Atualizado: public/version.json`);
    } else {
      // Criar se não existir
      const versionJson = {
        version: newVersion,
        buildDate: buildDate,
        environment: 'production',
        appName: packageJson.name || 'anota-corts-web',
      };
      fs.writeFileSync(VERSION_JSON_PATH, JSON.stringify(versionJson, null, 2), 'utf8');
      console.log(`✓ Criado e atualizado: public/version.json`);
    }

    // 5. Atualizar src/app/config/version.config.ts
    if (fs.existsSync(VERSION_CONFIG_PATH)) {
      let versionConfig = fs.readFileSync(VERSION_CONFIG_PATH, 'utf8');

      // Substituir versão e data usando Regex
      versionConfig = versionConfig.replace(/version:\s*['"`].*?['"`]/, `version: '${newVersion}'`);
      versionConfig = versionConfig.replace(
        /releaseDate:\s*['"`].*?['"`]/,
        `releaseDate: '${releaseDate}'`,
      );

      fs.writeFileSync(VERSION_CONFIG_PATH, versionConfig, 'utf8');
      console.log(`✓ Atualizado: src/app/config/version.config.ts`);
    } else {
      console.warn(`⚠ Arquivo de configuração de versão não encontrado em: ${VERSION_CONFIG_PATH}`);
    }

    // 6. Rodar o formatador do projeto
    console.log(`\nFormatando arquivos com Prettier...`);
    execSync('npm run format', { stdio: 'inherit' });
    console.log(`✓ Arquivos formatados com sucesso!`);

    console.log(`\n🎉 Processo finalizado com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao atualizar versão:`, error.message);
    process.exit(1);
  }
}

main();
