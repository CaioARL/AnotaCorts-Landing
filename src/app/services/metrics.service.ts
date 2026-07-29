import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { API_BASE_URL } from '../config/api.config';

/** Ponto da série temporal de crescimento de usuários (entradas x saídas por mês). */
export interface UserGrowthPoint {
  periodo: string; // yyyy-MM
  entradas: number;
  saidas: number;
}

/** Métricas públicas agregadas da plataforma (contrato do endpoint /v1/metrics/overview). */
export interface LandingMetrics {
  timestamp: string;
  // Barbearias
  totalBarbeariasAtivas: number;
  totalBarbeariasCadastradas: number;
  // Atendimentos
  totalAtendimentosRealizados: number;
  mediaAtendimentosPorBarbearia: number;
  totalAgendamentos: number;
  // Engajamento
  taxaUsoRegular: number;
  taxaUsoFrequente: number;
  taxaUsoIntenso: number;
  // Geografia
  barbeariasPorEstado: Record<string, number>;
  // Operação
  totalClientesGerenciados: number;
  totalServicosCadastrados: number;
  totalDespesasRegistradas: number;
  // Crescimento da base de usuários (série temporal)
  crescimentoUsuarios: UserGrowthPoint[];
  /** Granularidade da série: 'MONTHLY' (yyyy-MM) ou 'DAILY' (yyyy-MM-dd). */
  granularidadeCrescimento?: string;
  // Plataforma
  statusPlataforma: string;
  uptimePlataforma: number;
}

export interface GrowthParams {
  granularity?: 'DAILY' | 'MONTHLY';
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
}

/** Resposta do endpoint público que emite o token assimétrico de métricas. */
interface MetricsToken {
  accessToken: string;
  tokenType: string;
  scope: string;
  expiresIn: number;
  expiresAt: number;
}

/**
 * Serviço que consome as métricas públicas do backend.
 *
 * Fluxo de autenticação (sem login de usuário):
 * 1. Solicita um token JWT assimétrico (RS256, role METRICS) em `POST /v1/metrics/token`.
 * 2. Usa esse token como `Bearer` para chamar `GET /v1/metrics/overview`.
 *
 * O token possui escopo restrito: mesmo exposto no navegador, só funciona nos endpoints de métricas.
 * Ele é mantido em memória e reutilizado até ~1 min antes de expirar.
 */
@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly http = inject(HttpClient);
  private token: MetricsToken | null = null;

  /** Busca as métricas agregadas, garantindo um token válido antes da chamada. */
  getOverview(params?: GrowthParams): Observable<LandingMetrics> {
    return this.ensureToken().pipe(
      switchMap((accessToken) => {
        const queryParams: Record<string, string> = {};
        if (params?.granularity) queryParams['granularity'] = params.granularity;
        if (params?.startDate) queryParams['startDate'] = params.startDate;
        if (params?.endDate) queryParams['endDate'] = params.endDate;
        return this.http.get<LandingMetrics>(`${API_BASE_URL}/v1/metrics/overview`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: queryParams,
        });
      }),
    );
  }

  /** Retorna um token de métricas válido, reutilizando o cache em memória quando possível. */
  private ensureToken(): Observable<string> {
    const safetyWindowMs = 60_000;
    if (this.token && this.token.expiresAt - safetyWindowMs > Date.now()) {
      return of(this.token.accessToken);
    }
    return this.http.post<MetricsToken>(`${API_BASE_URL}/v1/metrics/token`, {}).pipe(
      tap((token) => (this.token = token)),
      map((token) => token.accessToken),
    );
  }
}
