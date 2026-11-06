import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { CONSENT_STORAGE_KEY, GA_MEASUREMENT_ID } from '../config/analytics.config';
import { AnalyticsService } from './analytics.service';

interface FakeWindow {
  location: { hostname: string; href: string; pathname: string };
  localStorage: { getItem(key: string): string | null; setItem(key: string, value: string): void };
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
}

/** Documento falso: permite simular o domínio oficial (o jsdom roda sempre em localhost). */
function setup(hostname: string, savedConsent?: string) {
  const storage = new Map<string, string>();
  if (savedConsent) storage.set(CONSENT_STORAGE_KEY, savedConsent);
  const scripts: { async?: boolean; src?: string }[] = [];
  const win: FakeWindow = {
    location: { hostname, href: `https://${hostname}/`, pathname: '/' },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => void storage.set(key, value),
    },
  };
  // Cookies gravados pelo "GA4" do teste e cada escrita em document.cookie (para conferir a limpeza)
  const cookieJar = ['_ga=GA1.1.123', '_ga_J2F7XTS1XZ=GS1.1.456', 'outro=1'];
  const cookieWrites: string[] = [];
  const doc = {
    defaultView: win,
    title: 'AnotaCorts',
    get cookie() {
      return cookieJar.join('; ');
    },
    set cookie(value: string) {
      cookieWrites.push(value);
    },
    head: { appendChild: (el: { src?: string }) => scripts.push(el) },
    createElement: () => ({}),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: Router, useValue: { events: new Subject() } },
    ],
  });
  const service = TestBed.inject(AnalyticsService);
  const calls = () => (win.dataLayer ?? []).map((args) => Array.from(args));
  return { service, win, storage, scripts, calls, cookieWrites };
}

describe('AnalyticsService', () => {
  it('não carrega o Google Analytics enquanto o visitante não responde o aviso', () => {
    const { service, win, scripts } = setup('www.anotacorts.com.br');
    service.init();
    service.event('clique_loja', { loja: 'google_play' });

    expect(service.consent()).toBeNull();
    expect(scripts).toHaveLength(0);
    expect(win.gtag).toBeUndefined();
  });

  it('carrega o GA4 e envia a visita depois do aceite no domínio oficial', () => {
    const { service, storage, scripts, calls } = setup('www.anotacorts.com.br');
    service.init();
    service.accept();

    expect(storage.get(CONSENT_STORAGE_KEY)).toBe('granted');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toContain(`gtag/js?id=${GA_MEASUREMENT_ID}`);
    expect(calls()).toContainEqual(['config', GA_MEASUREMENT_ID, { send_page_view: false }]);
    expect(calls()).toContainEqual([
      'event',
      'page_view',
      { page_title: 'AnotaCorts', page_location: 'https://www.anotacorts.com.br/', page_path: '/' },
    ]);
  });

  it('no localhost não envia nada ao Google, mesmo com aceite', () => {
    const { service, win, storage, scripts } = setup('localhost');
    service.accept();
    service.event('clique_loja', { loja: 'google_play' });

    expect(storage.get(CONSENT_STORAGE_KEY)).toBe('granted');
    expect(scripts).toHaveLength(0);
    expect(win.gtag).toBeUndefined();
  });

  it('guarda a recusa e não carrega o Google Analytics', () => {
    const { service, storage, scripts } = setup('www.anotacorts.com.br');
    service.decline();

    expect(service.consent()).toBe('denied');
    expect(storage.get(CONSENT_STORAGE_KEY)).toBe('denied');
    expect(scripts).toHaveLength(0);
  });

  it('ao retirar o aceite, desliga o GA4 e apaga os cookies _ga', () => {
    const { service, win, scripts, calls, cookieWrites } = setup('www.anotacorts.com.br');
    service.accept();
    service.decline();
    const before = calls().length;
    service.event('clique_loja', { loja: 'google_play' });

    const flags = win as unknown as Record<string, unknown>;
    expect(flags[`ga-disable-${GA_MEASUREMENT_ID}`]).toBe(true);
    expect(calls()).toHaveLength(before);
    expect(cookieWrites.some((c) => c.startsWith('_ga=; Max-Age=0'))).toBe(true);
    expect(cookieWrites.some((c) => c.startsWith('_ga_J2F7XTS1XZ=; Max-Age=0'))).toBe(true);
    expect(cookieWrites.some((c) => c.includes('domain=.anotacorts.com.br'))).toBe(true);
    expect(cookieWrites.some((c) => c.startsWith('outro='))).toBe(false);

    // E se aceitar de novo, volta a medir
    service.accept();
    expect(flags[`ga-disable-${GA_MEASUREMENT_ID}`]).toBe(false);
    expect(scripts).toHaveLength(1);
  });

  it('envia a versão do teste A/B como propriedade do usuário, antes das visitas', () => {
    const { service, calls } = setup('www.anotacorts.com.br');
    service.setUserProperty('versao_funcionalidades', 'B');
    service.accept();

    const all = calls();
    const props = all.findIndex((c) => c[0] === 'set' && c[1] === 'user_properties');
    const view = all.findIndex((c) => c[0] === 'event' && c[1] === 'page_view');
    expect(all[props]).toEqual(['set', 'user_properties', { versao_funcionalidades: 'B' }]);
    expect(props).toBeLessThan(view);
  });

  it('lembra o aceite nas visitas seguintes', () => {
    const { service, scripts, calls } = setup('www.anotacorts.com.br', 'granted');
    service.init();
    service.event('clique_loja', { loja: 'app_store', local: 'hero' });

    expect(service.consent()).toBe('granted');
    expect(scripts).toHaveLength(1);
    expect(calls()).toContainEqual(['event', 'clique_loja', { loja: 'app_store', local: 'hero' }]);
  });
});
