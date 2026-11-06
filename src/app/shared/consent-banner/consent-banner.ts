import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AnalyticsService } from '../../services/analytics.service';

/**
 * Aviso de cookies (LGPD): o Google Analytics só é carregado depois do aceite explícito.
 * Só existem duas categorias no site: necessários (sempre ativos) e análise (GA4);
 * não há cookies de publicidade, por isso o aviso não lista outras categorias.
 * O × só recolhe o cartão para o ícone de cookie: caixa marcada não vale como aceite,
 * então enquanto não houver escolha o cartão abre de novo a cada visita.
 */
@Component({
  selector: 'app-consent-banner',
  imports: [RouterLink],
  templateUrl: './consent-banner.html',
  styleUrl: './consent-banner.css',
})
export class ConsentBanner {
  readonly analytics = inject(AnalyticsService);
  readonly open = signal(this.analytics.consent() === null);
  readonly analyticsChecked = signal(this.analytics.consent() !== 'denied');
  readonly showDetails = signal(false);

  /** "Aceitar todos" ou, se "Análise" foi desmarcada, "Salvar escolhas" (vale como recusa). */
  confirm(): void {
    if (this.analyticsChecked()) this.analytics.accept();
    else this.analytics.decline();
    this.open.set(false);
  }

  declineAll(): void {
    this.analytics.decline();
    this.analyticsChecked.set(false);
    this.open.set(false);
  }

  minimize(): void {
    this.open.set(false);
  }

  reopen(): void {
    this.analyticsChecked.set(this.analytics.consent() !== 'denied');
    this.showDetails.set(false);
    this.open.set(true);
  }
}
