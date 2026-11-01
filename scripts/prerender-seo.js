#!/usr/bin/env node
/**
 * Pós-build: gera um HTML por rota (dist/anota-corts-web/browser/<rota>.html) com
 * título, descrição, canonical, og/twitter e breadcrumb (JSON-LD) da própria página, lidos
 * de src/app/config/seo.json.
 *
 * Sem isso, toda rota do SPA entrega o HTML da home, com o canonical apontando para a home,
 * e o Google trata /sobre, /metricas etc. como cópias dela (e não mostra sitelinks).
 * Também grava em cada página a Content-Security-Policy (ver contentSecurityPolicy).
 *
 * Roda sozinho depois do `npm run build` (script postbuild).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'anota-corts-web', 'browser');
const seo = require(path.join(ROOT, 'src', 'app', 'config', 'seo.json'));

const CSP_META = /<meta\s+http-equiv="Content-Security-Policy"[^>]*>\s*/g;

function sha256(value) {
  // O navegador calcula o hash depois do parser HTML, que converte CRLF/CR em LF
  const normalized = value.replace(/\r\n?/g, '\n');
  return `'sha256-${crypto.createHash('sha256').update(normalized, 'utf8').digest('base64')}'`;
}

/**
 * O GitHub Pages não permite cabeçalhos HTTP próprios, então a CSP vai numa <meta>. Os hashes
 * dos scripts inline (e dos onload="..." gerados pelo Angular) são calculados do HTML final,
 * para a política nunca ficar desatualizada em relação ao que é publicado.
 */
function contentSecurityPolicy(html) {
  const scriptHashes = new Set();
  const inlineScript =
    /<script\b(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g;
  for (const [, body] of html.matchAll(inlineScript)) scriptHashes.add(sha256(body));

  const handlerHashes = new Set();
  for (const [tag] of html.matchAll(/<[a-z][^>]*>/gi)) {
    for (const [, value] of tag.matchAll(/\son[a-z]+="([^"]*)"/gi))
      handlerHashes.add(sha256(value));
  }

  const scriptSrc = ["'self'", ...scriptHashes];
  if (handlerHashes.size) scriptSrc.push("'unsafe-hashes'", ...handlerHashes);

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    "font-src 'self' https://fonts.gstatic.com https://unpkg.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://api.anotacorts.com.br",
    "worker-src 'self' blob:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function withCsp(html) {
  html = html.replace(CSP_META, '');
  const meta = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(html)}">`;
  return replaceTag(
    html,
    /<meta charset="utf-8"\s*\/?>/i,
    `<meta charset="utf-8">\n    ${meta}`,
    'meta charset',
  );
}

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
  if (page.path) {
    // Pré-carregamentos marcados como data-home-only (imagem do topo) só servem na home
    html = html.replace(/<link\b[^>]*\bdata-home-only\b[^>]*>\s*/g, '');
  }

  // <rota>.html (e não <rota>/index.html): o GitHub Pages serve /sobre direto desse arquivo,
  // sem o redirect 301 para /sobre/ que divergiria do canonical
  const outFile = page.path ? path.join(DIST, `${page.path}.html`) : path.join(DIST, 'index.html');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, withCsp(html), 'utf8');
  console.log(`✔  /${page.path} → ${page.title}`);
}
