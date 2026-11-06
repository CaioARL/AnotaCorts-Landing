import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { CONSENT_STORAGE_KEY, GA_HOSTNAMES, GA_MEASUREMENT_ID } from '../config/analytics.config';

type Consent = 'granted' | 'denied';
type Gtag = (...args: unknown[]) => void;

interface GtagWindow extends Window {
  dataLayer?: unknown[];
  gtag?: Gtag;
}

/**
 * Google Analytics 4 com consentimento (LGPD): o script do Google só é carregado depois que o
 * visitante aceita no aviso de cookies. Sem aceite, nada é enviado e nenhum cookie é gravado.
 * Como o site é uma SPA, cada troca de página é enviada manualmente como page_view.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView as GtagWindow | null;
  private loaded = false;
  private pageViewSent = false;
  /** Propriedades do usuário (ex.: versão do teste A/B); vão ao GA4 assim que ele carregar. */
  private readonly userProperties: Record<string, string> = {};

  /** Escolha do visitante; null enquanto ele não respondeu o aviso. */
  readonly consent = signal<Consent | null>(this.readConsent());

  init(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      // setTimeout: o título da rota é aplicado logo depois do NavigationEnd
      .subscribe(() => setTimeout(() => this.pageView()));
    if (this.consent() === 'granted') this.load();
  }

  accept(): void {
    const wasDenied = this.consent() === 'denied';
    this.saveConsent('granted');
    this.setDisabled(false);
    this.load();
    // Quem só reabriu o aviso e confirmou o aceite não gera uma visita a mais
    if (wasDenied || !this.pageViewSent) this.pageView();
  }

  /** Recusa ou retirada do consentimento: desliga o GA4 já carregado e apaga os cookies dele. */
  decline(): void {
    this.saveConsent('denied');
    if (!this.loaded) return;
    this.setDisabled(true);
    this.clearGaCookies();
  }

  /** Evento personalizado (ex.: clique nos botões das lojas). Ignorado sem consentimento. */
  event(name: string, params: Record<string, string | number> = {}): void {
    if (this.consent() !== 'granted') return;
    this.window?.gtag?.('event', name, params);
  }

  /** Marca o visitante (ex.: versao_funcionalidades = B) para segmentar os relatórios. */
  setUserProperty(name: string, value: string): void {
    this.userProperties[name] = value;
    if (this.loaded && this.consent() === 'granted') {
      this.window?.gtag?.('set', 'user_properties', { [name]: value });
    }
  }

  private get enabled(): boolean {
    return !!this.window && GA_HOSTNAMES.includes(this.window.location.hostname);
  }

  private load(): void {
    if (this.loaded || !this.enabled || !this.window) return;
    this.loaded = true;
    const w = this.window;
    w.dataLayer = w.dataLayer || [];
    // O gtag.js espera receber o objeto arguments, como no snippet oficial do Google
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
    if (Object.keys(this.userProperties).length) {
      w.gtag('set', 'user_properties', { ...this.userProperties });
    }
    const script = this.document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    this.document.head.appendChild(script);
  }

  /** Chave oficial de opt-out do gtag.js: com ela em true, nada mais é enviado. */
  private setDisabled(disabled: boolean): void {
    if (this.window)
      (this.window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] =
        disabled;
  }

  private clearGaCookies(): void {
    if (!this.window) return;
    const host = this.window.location.hostname;
    // O GA4 grava no domínio principal (.anotacorts.com.br); apaga nas variações possíveis
    const domains = ['', host, '.' + host.replace(/^www\./, '')];
    for (const cookie of this.document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!name.startsWith('_ga')) continue;
      for (const domain of domains) {
        this.document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      }
    }
  }

  private pageView(): void {
    if (!this.loaded || !this.window || this.consent() !== 'granted') return;
    this.pageViewSent = true;
    this.event('page_view', {
      page_title: this.document.title,
      page_location: this.window.location.href,
      page_path: this.window.location.pathname,
    });
  }

  private readConsent(): Consent | null {
    try {
      const value = this.document.defaultView?.localStorage.getItem(CONSENT_STORAGE_KEY);
      return value === 'granted' || value === 'denied' ? value : null;
    } catch {
      return null;
    }
  }

  private saveConsent(value: Consent): void {
    this.consent.set(value);
    try {
      this.window?.localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch {
      // Sem localStorage (aba anônima restrita): o aviso volta na próxima visita, sem problema
    }
  }
}
