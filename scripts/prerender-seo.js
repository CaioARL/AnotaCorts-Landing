#!/usr/bin/env node
/**
 * Pós-build: gera um HTML por rota (dist/anota-corts-web/browser/<rota>/index.html) com
 * título, descrição, canonical, og/twitter e breadcrumb (JSON-LD) da própria página, lidos
 * de src/app/config/seo.json.
 *
 * Sem isso, toda rota do SPA entrega o HTML da home, com o canonical apontando para a home,
 * e o Google trata /sobre, /metricas etc. como cópias dela (e não mostra sitelinks).
 *
 * Roda sozinho depois do `npm run build` (script postbuild).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'anota-corts-web', 'browser');
const seo = require(path.join(ROOT, 'src', 'app', 'config', 'seo.json'));

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Troca exatamente uma tag; falha o build se ela sumir do index.html (evita SEO quebrado em silêncio). */
function replaceTag(html, regex, replacement, label) {
  if (!regex.test(html)) {
    throw new Error(`prerender-seo: não encontrei ${label} no index.html gerado`);
  }
  return html.replace(regex, () => replacement);
}

function metaTag(attr, name) {
  return new RegExp(`<meta\\s+${attr}="${name}"\\s+content="[^"]*"\\s*\\/?>`);
}

function breadcrumbJsonLd(page, url) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${seo.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: page.breadcrumb, item: url },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

for (const page of seo.pages) {
  const url = `${seo.siteUrl}/${page.path}`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);

  let html = template;
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, '<title>');
  html = replaceTag(
    html,
    metaTag('name', 'description'),
    `<meta name="description" content="${description}">`,
    'meta description',
  );
  html = replaceTag(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}">`,
    'link canonical',
  );
  html = replaceTag(
    html,
    metaTag('property', 'og:title'),
    `<meta property="og:title" content="${title}">`,
    'og:title',
  );
  html = replaceTag(
    html,
    metaTag('property', 'og:description'),
    `<meta property="og:description" content="${description}">`,
    'og:description',
  );
  html = replaceTag(
    html,
    metaTag('property', 'og:url'),
    `<meta property="og:url" content="${url}">`,
    'og:url',
  );
  html = replaceTag(
    html,
    metaTag('name', 'twitter:title'),
    `<meta name="twitter:title" content="${title}">`,
    'twitter:title',
  );
  html = replaceTag(
    html,
    metaTag('name', 'twitter:description'),
    `<meta name="twitter:description" content="${description}">`,
    'twitter:description',
  );
  if (page.breadcrumb) {
    html = html.replace('</head>', () => `  ${breadcrumbJsonLd(page, url)}\n  </head>`);
  }

  const outDir = page.path ? path.join(DIST, page.path) : DIST;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  console.log(`✔  /${page.path} → ${page.title}`);
}
