# 💈 AnotaCorts - Landing Page (Web)

[![Angular](https://img.shields.io/badge/Angular-19+-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Vanilla CSS](https://img.shields.io/badge/CSS-Vanilla-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![Version](https://img.shields.io/badge/Version-1.0.2-3b82f6?style=for-the-badge)](public/version.json)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://pages.github.com/)

Uma landing page premium, responsiva e performática para o ecossistema **AnotaCorts**, construída com **Angular** moderno. A página atua como a vitrine do aplicativo AnotaCorts, apresentando suas funcionalidades de controle financeiro, agendamentos, despesas e rankings de forma intuitiva, além de guiar os usuários com um tutorial completo de uso.

---

## 📂 Estrutura do Projeto

Abaixo está a arquitetura simplificada de diretórios do projeto:

```text
AnotaCorts-Landing/
├── public/                     # Arquivos estáticos (imagens, mockups, etc.)
│   ├── screenshots/            # Capturas de tela do aplicativo
│   ├── tutorial/               # Ativos de mídia da seção de tutorial
│   └── version.json            # Versionamento público (consumido externamente)
├── src/
│   ├── app/
│   │   ├── config/             # Configurações globais do projeto
│   │   │   ├── app-store.config.ts # Links da Google Play e App Store
│   │   │   └── version.config.ts   # Versionamento interno (carregamento instantâneo)
│   │   ├── pages/              # Páginas e roteamento do site
│   │   │   ├── about/          # Página "Sobre nós"
│   │   │   ├── home/           # Página Inicial (Landing)
│   │   │   ├── privacy/        # Política de Privacidade (LGPD)
│   │   │   ├── terms/          # Termos de Uso
│   │   │   └── tutorial/       # Central de Ajuda & Tutorial Interativo
│   │   ├── app.config.ts       # Provedores e rotas globais do Angular
│   │   ├── app.html            # Template raiz (<router-outlet>)
│   │   └── app.ts              # Componente raiz do Angular
│   ├── index.html              # HTML de entrada principal
│   ├── main.ts                 # Script de bootstrap do projeto
│   └── styles.css              # Estilos globais e Design Tokens
├── angular.json                # Configurações do Angular CLI & Compilação
├── package.json                # Dependências, scripts npm e versão do projeto
└── tsconfig.json               # Configurações globais do TypeScript
```

---

## 🌐 Páginas & Funcionalidades

O ecossistema da landing page é composto pelas seguintes seções:

| Página            | Rota           | Descrição                                                    | Principais Recursos                                                                          |
| :---------------- | :------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Início (Home)** | `/`            | Apresentação principal do ecossistema AnotaCorts.            | Download nas lojas, mockup 3D responsivo, rodapé integrado.                                  |
| **Sobre**         | `/sobre`       | A história por trás do aplicativo e sua missão.              | Carrossel dinâmico das telas do aplicativo, seção CTA de conversão.                          |
| **Tutorial**      | `/tutorial`    | Central de ajuda interativa para barbeiros.                  | Busca instantânea por palavra-chave, navegação estruturada, player de vídeos demonstrativos. |
| **Privacidade**   | `/privacidade` | Política de Privacidade adaptada em conformidade com a LGPD. | Organização em seções legais e badge de última atualização.                                  |
| **Termos**        | `/termos`      | Termos e Condições de Uso do aplicativo e do site.           | Estrutura hierárquica limpa e de fácil leitura.                                              |

---

## 🏷️ Sistema de Versionamento

Implementamos um sistema híbrido de versionamento de alta performance para facilitar a manutenção e manter a transparência das atualizações do site:

### 1. Versionamento Público (`public/version.json`)

Localizado na pasta estática pública. Permite que ferramentas de automação, scripts de CI/CD ou integrações de terceiros leiam a versão em tempo real diretamente do domínio:

```json
{
  "version": "1.0.2",
  "buildDate": "2026-05-07T16:53:26-03:00",
  "environment": "production",
  "appName": "AnotaCorts-Landing"
}
```

### 2. Versionamento Interno (`src/app/config/version.config.ts`)

Constante TypeScript importável por qualquer componente do site, garantindo renderização instantânea (zero delay e sem necessidade de requisições HTTP em tempo de execução):

```typescript
export const APP_VERSION: AppVersion = {
  version: '1.0.2',
  releaseDate: '07/05/2026',
  environment: 'production',
};
```

### 3. Como Incrementar a Versão

Sempre que fizer uma nova atualização ou melhoria no site, execute o incremento em três lugares simples para manter o ecossistema sincronizado:

1. No arquivo central [version.config.ts](file:///c:/Users/caioarl/vscode-workspace/AnotaCorts-Landing/src/app/config/version.config.ts) (Atualiza todos os rodapés do site de forma automática).
2. No arquivo público [version.json](file:///c:/Users/caioarl/vscode-workspace/AnotaCorts-Landing/public/version.json) (Atualiza a API pública de versão).
3. No campo `"version"` do [package.json](file:///c:/Users/caioarl/vscode-workspace/AnotaCorts-Landing/package.json).

---

## 🚀 Desenvolvimento Local

Siga os passos abaixo para preparar seu ambiente e rodar o projeto localmente:

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- Gerenciador de pacotes `npm`

### Instalação de Dependências

Instale as dependências necessárias do projeto:

```bash
npm install
```

### Rodando o Servidor de Desenvolvimento

Inicie o servidor local para desenvolvimento:

```bash
npm start
```

O servidor iniciará em `http://localhost:4200/`. A página atualizará automaticamente caso você altere qualquer arquivo no código-fonte.

### Build para Produção

Gere os arquivos finais otimizados para deploy:

```bash
npm run build
```

O resultado final da compilação será gerado na pasta `dist/` (ou de acordo com a saída definida no `angular.json`).

### 🛠️ Scripts & Comandos Úteis

Abaixo estão os principais comandos configurados no projeto para agilizar o seu fluxo de trabalho:

| Comando                  | Descrição                                                                        | Ferramenta  |
| :----------------------- | :------------------------------------------------------------------------------- | :---------- |
| `npm start`              | Inicia o servidor local de desenvolvimento na porta `4200`.                      | Angular CLI |
| `npm run format`         | **Formata automaticamente** todos os arquivos do projeto para o padrão estético. | Prettier    |
| `npm run build`          | Compila e otimiza todo o site para publicação final em produção.                 | Angular CLI |
| `npm run test`           | Executa a suíte de testes automatizados do projeto.                              | Vitest      |
| `npm run watch`          | Compila o projeto em modo de desenvolvimento e observa mudanças nos arquivos.    | Angular CLI |
| `npx prettier --check .` | Apenas verifica se os arquivos estão formatados, sem alterá-los.                 | Prettier    |

---

## 🎨 Design System (Aesthetics)

O site adota uma estética **Ultra Premium**, usando as melhores práticas de design moderno:

- **Tons Escuros e Gradientes:** Uso harmonioso do azul profundo (`#0f172a`), com acentos de gradiente neon vibrantes para destacar títulos e CTAs.
- **Glassmorphism:** Efeito fosco translúcido (`backdrop-filter: blur()`) em barras de navegação, cards e modais, proporcionando profundidade visual.
- **Animações de Entrada:** Transições fluidas (`animate-fade-in`) e micro-interações responsivas ao passar o cursor sobre botões e links.
- **Responsividade Total:** Adaptado perfeitamente para Smartphones, Tablets, Notebooks e Monitores Ultra-Wide.

---

## 🚀 CI/CD & Deploy

O deploy deste projeto é automatizado via **GitHub Actions** toda vez que alterações são introduzidas no repositório remoto.

- O fluxo de CI/CD compila os arquivos do Angular e publica diretamente no **GitHub Pages** (Deploy a partir de uma branch de publicação específica).

---

Desenhado com carinho pela equipe **AnotaCorts** ✨
