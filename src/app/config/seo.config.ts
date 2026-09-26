/**
 * Título e descrição de cada página para o Google e para as prévias de compartilhamento.
 * Os dados ficam em seo.json porque também são lidos por scripts/prerender-seo.js, que gera
 * um HTML com essas tags para cada rota no build.
 */
import seo from './seo.json';

export interface PageSeo {
  path: string;
  title: string;
  description: string;
  breadcrumb: string | null;
}

export const SITE_URL: string = seo.siteUrl;

export const PAGES_SEO: PageSeo[] = seo.pages;

/** SEO da rota (caminho sem barras, ex.: 'sobre'); rotas desconhecidas usam o da home. */
export function pageSeo(path: string): PageSeo {
  return PAGES_SEO.find((page) => page.path === path) ?? PAGES_SEO[0];
}

/** URL canônica da rota no domínio oficial. */
export function pageUrl(page: PageSeo): string {
  return `${SITE_URL}/${page.path}`;
}
