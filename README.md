# AnotaCorts — Landing Page

[![Angular](https://img.shields.io/badge/Angular-21+-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![CSS](https://img.shields.io/badge/CSS-Vanilla-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![ECharts](https://img.shields.io/badge/Apache_ECharts-6-AA344D?style=for-the-badge&logo=apacheecharts&logoColor=white)](https://echarts.apache.org/)
[![Version](https://img.shields.io/badge/Version-1.2.1-6366f1?style=for-the-badge)](public/version.json)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://pages.github.com/)

Landing page responsiva do ecossistema **AnotaCorts** — o app de gestão para barbearias. Apresenta funcionalidades, métricas em tempo real, tutorial interativo e páginas legais.

---

## Estrutura do Projeto

```text
AnotaCorts-Landing/
├── public/                        # Arquivos estáticos
│   ├── screenshots/               # Capturas de tela do app
│   ├── tutorial/                  # Mídia da seção tutorial
│   ├── version.json               # Versão pública (lida por integrações externas)
│   └── CNAME                      # Domínio customizado para GitHub Pages
├── scripts/
│   └── update-version.js          # Script de bump de versão
├── src/
│   ├── app/
│   │   ├── config/
│   │   │   ├── copy.ts            # ★ Todos os textos estáticos do site
│   │   │   ├── api.config.ts      # URL base da API de métricas
│   │   │   ├── app-store.config.ts# Links Google Play / App Store
│   │   │   └── version.config.ts  # Versão interna (sem requisição HTTP)
│   │   ├── pages/
│   │   │   ├── home/              # Página inicial
│   │   │   ├── about/             # Sobre o app
│   │   │   ├── metrics/           # Métricas em tempo real (ECharts)
│   │   │   ├── tutorial/          # Central de ajuda interativa
│   │   │   ├── privacy/           # Política de Privacidade (LGPD)
│   │   │   └── terms/             # Termos de Uso
│   │   ├── services/
│   │   │   └── metrics.service.ts # Consumo da API de métricas
│   │   └── shared/
│   │       ├── navbar/            # Navbar fixa compartilhada (todas as páginas)
│   │       └── footer/            # Footer compartilhado (todas as páginas)
│   ├── index.html
│   ├── main.ts
│   └── styles.css                 # Design tokens e estilos globais
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Páginas

| Página          | Rota           | Descrição                                                                |
| :-------------- | :------------- | :----------------------------------------------------------------------- |
| **Home**        | `/`            | Hero, botões de download, indicadores de atividade e CTA                 |
| **Sobre**       | `/sobre`       | História, funcionalidades e carrossel de screenshots                     |
| **Métricas**    | `/metricas`    | KPIs em tempo real, gráfico de crescimento (ECharts), engajamento por UF |
| **Tutorial**    | `/tutorial`    | Guia passo a passo com busca, TOC navegável e mídia demonstrativa        |
| **Privacidade** | `/privacidade` | Política de Privacidade em conformidade com a LGPD                       |
| **Termos**      | `/termos`      | Termos e Condições de Uso                                                |

---

## Textos Centralizados (`copy.ts`)

Todos os textos visíveis do site estão em um único arquivo:

```
src/app/config/copy.ts
```

Para alterar qualquer string de UI — títulos, descrições, labels, botões — edite apenas esse arquivo. Está organizado por página/seção:

```typescript
COPY.brand; // nome e logo
COPY.nav; // links de navegação
COPY.footer; // copyright e links do rodapé
COPY.home; // hero, stats, engagement, CTA
COPY.about; // hero, história, features, galeria, CTA
COPY.metrics; // todos os KPIs, highlights, gráfico, engajamento, CTA
COPY.tutorial; // hero, busca
COPY.privacy; // título, data, intro
COPY.terms; // título, data, intro
```

---

## Sistema de Versionamento

A versão é mantida em **3 arquivos sincronizados**:

| Arquivo                            | Propósito                                             |
| :--------------------------------- | :---------------------------------------------------- |
| `package.json`                     | Versão npm padrão                                     |
| `public/version.json`              | API pública de versão (lida por integrações externas) |
| `src/app/config/version.config.ts` | Versão interna renderizada no rodapé do site          |

### Atualizar versão

```bash
npm run update-version           # patch  →  1.2.1 → 1.2.2
npm run update-version -- minor  # minor  →  1.2.1 → 1.3.0
npm run update-version -- major  # major  →  1.2.1 → 2.0.0
npm run update-version -- 2.0.0  # versão exata
```

O script atualiza os 3 arquivos acima e registra a data/hora atual automaticamente.

---

## Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- npm 10+

### Instalação

```bash
npm install
```

### Servidor de desenvolvimento

```bash
npm start
# http://localhost:4200
```

### Build de produção

```bash
npm run build
# saída em dist/
```

### Scripts disponíveis

| Comando                  | Descrição                              |
| :----------------------- | :------------------------------------- |
| `npm start`              | Servidor local na porta 4200           |
| `npm run build`          | Build otimizado para produção          |
| `npm run watch`          | Build em modo watch (desenvolvimento)  |
| `npm run format`         | Formata todos os arquivos via Prettier |
| `npm run update-version` | Bump de versão (veja seção acima)      |
| `npm test`               | Executa a suíte de testes              |

---

## Design System

- **Paleta:** fundo `#080c14`, acento indigo `#6366f1`, texto `#f1f5f9`
- **Navbar:** fixa com `backdrop-filter: blur(20px)`, componente `<app-navbar>` compartilhado
- **Cards:** `background: rgba(255,255,255,0.03)`, `border: 1px solid rgba(255,255,255,0.07)`, `border-radius: 16px`
- **Tipografia:** Outfit / Inter, escala clamp responsiva
- **Gráficos:** Apache ECharts via `ngx-echarts`
- **Responsivo:** mobile-first, breakpoints em 640 px e 900 px

---

## CI/CD & Deploy

Deploy automatizado via **GitHub Actions** → **GitHub Pages** a cada push na `main`
([deploy.yml](.github/workflows/deploy.yml)). O build publica `dist/anota-corts-web/browser`.

- **Sem secrets:** o mapa do globo usa GeoJSON estático do Natural Earth em `public/geo/`
  (domínio público), sem tiles externos nem chave de API.
- **Domínio:** `public/CNAME` (`www.anotacorts.com.br`); o domínio raiz redireciona para o `www`.
- **Rotas do SPA:** cada rota tem um `<rota>.html` gerado por `scripts/prerender-seo.js`;
  URLs desconhecidas caem no `public/404.html`, que devolve a navegação para o Angular.

---

Feito com carinho pela equipe **AnotaCorts**
