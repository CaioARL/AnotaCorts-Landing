import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

import { AnalyticsService } from './analytics.service';

/**
 * Testes A/B: sorteia uma versão por navegador (fica guardada, a pessoa sempre vê a mesma)
 * e envia a versão ao GA4 como propriedade do usuário, para comparar as conversões.
 * Para ver uma versão específica, use a URL com ?<experimento>=<versão>,
 * por exemplo /?versao_funcionalidades=A.
 */
@Injectable({ providedIn: 'root' })
export class ExperimentService {
  private readonly analytics = inject(AnalyticsService);
  private readonly document = inject(DOCUMENT);

  variant<T extends string>(experiment: string, variants: readonly T[]): T {
    const key = `anotacorts-ab-${experiment}`;
    const win = this.document.defaultView;
    const forced = win ? new URLSearchParams(win.location.search).get(experiment) : null;
    let chosen = variants.find((v) => v === forced) ?? variants.find((v) => v === this.read(key));
    if (!chosen) chosen = variants[Math.floor(Math.random() * variants.length)];
    this.save(key, chosen);
    this.analytics.setUserProperty(experiment, chosen);
    return chosen;
  }

  private read(key: string): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private save(key: string, value: string): void {
    try {
      this.document.defaultView?.localStorage.setItem(key, value);
    } catch {
      // Sem localStorage: a versão é sorteada de novo na próxima visita, sem problema
    }
  }
}
