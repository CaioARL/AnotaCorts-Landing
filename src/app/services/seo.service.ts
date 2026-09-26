import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { pageSeo, pageUrl } from '../config/seo.config';

/**
 * Mantém descrição, canonical e tags de compartilhamento da página atual em dia durante a
 * navegação dentro do site (o título já vem do `title` de cada rota). No primeiro acesso
 * essas tags já chegam certas no HTML gerado por scripts/prerender-seo.js.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  init(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.apply(event.urlAfterRedirects));
  }

  private apply(url: string): void {
    const path = url.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
    const page = pageSeo(path);
    const canonical = pageUrl(page);

    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
  }
}
