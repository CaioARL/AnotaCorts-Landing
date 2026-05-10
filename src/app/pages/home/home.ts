import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { APP_STORE_URLS, AppStoreUrls } from '../../config/app-store.config';
import { APP_VERSION, AppVersion } from '../../config/version.config';
import { API_BASE_URL } from '../../config/api.config';

export interface LandingStats {
  timestamp: string;
  totalBarbeariasAtivas: number;
  totalAtendimentosRealizados: number;
  mediaAtendimentosPorBarbearia: number;
  taxaUsoRegular: number;
  taxaUsoFrequente: number;
  taxaUsoIntenso: number;
  barbeariasPorEstado: Record<string, number>;
  statusPlataforma: string;
  uptimePlataforma: number;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly http = inject(HttpClient);

  readonly storeUrls: AppStoreUrls = APP_STORE_URLS;
  readonly appVersion: AppVersion = APP_VERSION;

  readonly stats = signal<LandingStats | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<boolean>(false);

  ngOnInit(): void {
    this.fetchStats();
  }

  fetchStats(): void {
    this.loading.set(true);
    this.error.set(false);
    this.http.get<LandingStats>(`${API_BASE_URL}/v1/public/statistics/landing`).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar estatísticas da landing page:', err);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
