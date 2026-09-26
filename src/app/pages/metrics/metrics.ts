import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import { APP_VERSION, AppVersion } from '../../config/version.config';
import { COPY } from '../../config/copy';
import { GrowthParams, LandingMetrics, MetricsService } from '../../services/metrics.service';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

interface EstadoRow {
  uf: string;
  total: number;
  percent: number;
}

interface GrowthColumn {
  periodo: string;
  label: string;
  entradas: number;
  saidas: number;
  entradasHeight: number;
  saidasHeight: number;
  tooltip: string;
}

interface GrowthChart {
  rows: GrowthColumn[];
  max: number;
  totalEntradas: number;
  totalSaidas: number;
  hasData: boolean;
}

interface AnimatedValues {
  barbeariasAtivas: number;
  atendimentos: number;
  clientes: number;
  servicos: number;
  agendamentos: number;
  despesas: number;
}

const ZERO_VALUES: AnimatedValues = {
  barbeariasAtivas: 0,
  atendimentos: 0,
  clientes: 0,
  servicos: 0,
  agendamentos: 0,
  despesas: 0,
};

/** Siglas das 27 UFs. A API também devolve códigos que não são UF (ex.: "BR", "SA"). */
const UFS_BRASIL = new Set(
  'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '),
);

interface UserBaseSummary {
  totalUsuariosMonitorados: number;
  usuariosAtivos: number;
  usuariosInativos: number;
  saldoUsuarios: number;
  taxaAtivos: number;
  hasData: boolean;
}

@Component({
  selector: 'app-metrics',
  imports: [CommonModule, RouterLink, NgxEchartsDirective, Navbar, Footer],
  templateUrl: './metrics.html',
  styleUrl: './metrics.css',
})
export class Metrics implements OnInit {
  private readonly metricsService = inject(MetricsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly appVersion: AppVersion = APP_VERSION;
  readonly t = COPY.metrics;
  readonly brand = COPY.brand;
  readonly metrics = signal<LandingMetrics | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<boolean>(false);

  /** Granularidade selecionada pelo usuário para o gráfico de crescimento. */
  readonly granularity = signal<'DAILY' | 'MONTHLY'>('MONTHLY');
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');

  /** Indica carregamento parcial (apenas o gráfico de crescimento, sem ocultar a página inteira). */
  readonly growthLoading = signal<boolean>(false);

  /** Rótulo do pico no resumo: "pico mensal" ou "pico diário" conforme granularidade. */
  readonly peakLabel = computed<string>(() =>
    this.granularity() === 'DAILY' ? 'pico diário' : 'pico mensal',
  );

  /** Rótulo dinâmico da section tag e cabeçalho do gráfico. */
  readonly periodLabel = computed<string>(() => {
    if (this.granularity() === 'DAILY') {
      const start = this.startDate();
      const end = this.endDate();
      if (start && end) {
        return `${this.formatShortDate(start)} a ${this.formatShortDate(end)}`;
      }
      return 'Últimos 30 dias';
    }
    return 'Janela móvel dos últimos 12 meses';
  });

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  /** Valores exibidos nos contadores (animados de 0 até o alvo). */
  readonly displayValues = signal<AnimatedValues>({ ...ZERO_VALUES });

  /** Todos os estados com barbearias ativas, do maior para o menor (a lista rola no card). */
  readonly estados = computed<EstadoRow[]>(() => {
    const data = this.metrics();
    if (!data?.barbeariasPorEstado) {
      return [];
    }
    const entries = Object.entries(data.barbeariasPorEstado).filter(([uf]) => UFS_BRASIL.has(uf));
    const max = entries.reduce((acc, [, value]) => Math.max(acc, value), 0) || 1;
    return entries
      .map(([uf, total]) => ({ uf, total, percent: Math.round((total / max) * 100) }))
      .sort((a, b) => b.total - a.total);
  });

  readonly isOperational = computed(() => this.metrics()?.statusPlataforma === 'OPERATIONAL');

  private readonly monthNames = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];

  /** Série mensal de entradas (novos cadastros) x saídas (exclusões), preparada para o gráfico. */
  readonly growthChart = computed<GrowthChart>(() => {
    const points = this.metrics()?.crescimentoUsuarios ?? [];
    const max = points.reduce((m, p) => Math.max(m, p.entradas, p.saidas), 0);
    const safeMax = max || 1;
    const rows: GrowthColumn[] = points.map((p) => ({
      periodo: p.periodo,
      label: this.monthLabel(p.periodo),
      entradas: p.entradas,
      saidas: p.saidas,
      entradasHeight: Math.round((p.entradas / safeMax) * 100),
      saidasHeight: Math.round((p.saidas / safeMax) * 100),
      tooltip: `${this.monthLabel(p.periodo, true)} \u00b7 ${p.entradas} entraram \u00b7 ${p.saidas} sa\u00edram`,
    }));
    const totalEntradas = points.reduce((s, p) => s + p.entradas, 0);
    const totalSaidas = points.reduce((s, p) => s + p.saidas, 0);
    return { rows, max, totalEntradas, totalSaidas, hasData: points.length > 0 && max > 0 };
  });

  /** Opção ECharts para o gráfico de crescimento de usuários. */
  readonly growthChartOption = computed<EChartsOption>(() => {
    const chart = this.growthChart();
    const labels = chart.rows.map((r) => r.label);
    const entradas = chart.rows.map((r) => r.entradas);

    return {
      backgroundColor: 'transparent',
      grid: { left: 40, right: 16, top: 32, bottom: 40, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15,15,20,0.92)',
        borderColor: 'rgba(31,51,212,0.4)',
        borderWidth: 1,
        textStyle: { color: '#e2e8f0', fontFamily: 'inherit', fontSize: 13 },
        formatter: (params: unknown) => {
          const p = (Array.isArray(params) ? params[0] : params) as {
            axisValue: string;
            value: number;
          };
          return `<b>${p.axisValue}</b><br/>Entradas: <b style="color:#c7d2fe">${p.value}</b>`;
        },
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: 'rgba(13,13,56,0.12)' } },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 12, fontFamily: 'inherit' },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
          fontFamily: 'inherit',
          formatter: (v: number) => v.toLocaleString('pt-BR'),
        },
        splitLine: { lineStyle: { color: 'rgba(13,13,56,0.08)', type: 'dashed' } },
      },
      series: [
        {
          name: 'Entradas',
          type: 'bar',
          data: entradas,
          barMaxWidth: 40,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#1f33d4' },
                { offset: 1, color: '#0d0d38' },
              ],
            },
          },
          emphasis: {
            itemStyle: { color: '#4f5fe8' },
          },
        },
      ],
    };
  });

  readonly userBaseSummary = computed<UserBaseSummary>(() => {
    const chart = this.growthChart();
    const total = chart.totalEntradas;
    const saidas = chart.totalSaidas;
    const ativos = Math.max(total - saidas, 0);
    const saldo = total - saidas;
    const taxaAtivos = total > 0 ? Math.round((ativos / total) * 100) : 0;
    return {
      totalUsuariosMonitorados: total,
      usuariosAtivos: ativos,
      usuariosInativos: saidas,
      saldoUsuarios: saldo,
      taxaAtivos,
      hasData: chart.hasData,
    };
  });

  /** Taxa de usuários ativos com base nos contadores globais do banco (não da janela mensal). */
  readonly taxaAtivosGlobal = computed<number>(() => {
    const data = this.metrics();
    if (!data || data.totalBarbeariasCadastradas === 0) return 0;
    return Math.round((data.totalBarbeariasAtivas / data.totalBarbeariasCadastradas) * 100);
  });

  ngOnInit(): void {
    this.fetchMetrics();
  }

  fetchMetrics(granularitySwitch = false): void {
    if (granularitySwitch) {
      this.growthLoading.set(true);
    } else {
      this.loading.set(true);
      this.error.set(false);
      this.displayValues.set({ ...ZERO_VALUES });
    }

    const params: GrowthParams =
      this.granularity() === 'DAILY'
        ? {
            granularity: 'DAILY',
            startDate: this.startDate() || undefined,
            endDate: this.endDate() || undefined,
          }
        : { granularity: 'MONTHLY' };

    this.metricsService
      .getOverview(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.metrics.set(data);
          this.growthLoading.set(false);
          this.loading.set(false);
          if (!granularitySwitch) {
            this.animateCounters(data);
            requestAnimationFrame(() => requestAnimationFrame(() => this.setupRevealObserver()));
          }
        },
        error: (err) => {
          console.error('Erro ao buscar métricas da plataforma:', err);
          this.growthLoading.set(false);
          if (!granularitySwitch) {
            this.error.set(true);
          }
          this.loading.set(false);
        },
      });
  }

  /** Alterna a granularidade e recarrega apenas o gráfico de crescimento. */
  setGranularity(g: 'DAILY' | 'MONTHLY'): void {
    if (this.granularity() === g) return;
    this.granularity.set(g);
    if (g === 'DAILY' && !this.startDate()) {
      const { start, end } = this.defaultDailyRange();
      this.startDate.set(start);
      this.endDate.set(end);
    }
    this.fetchMetrics(true);
  }

  /** Aplica o intervalo personalizado e recarrega apenas o gráfico de crescimento. */
  applyCustomRange(): void {
    if (this.startDate() && this.endDate()) {
      this.fetchMetrics(true);
    }
  }

  onStartDateChange(event: Event): void {
    this.startDate.set((event.target as HTMLInputElement).value);
  }

  onEndDateChange(event: Event): void {
    this.endDate.set((event.target as HTMLInputElement).value);
  }

  /** Formata números no padrão brasileiro (separador de milhar). */
  format(value: number): string {
    return Math.round(value).toLocaleString('pt-BR');
  }

  /** Formata a data/hora da última atualização. */
  formatTimestamp(timestamp: string | undefined): string {
    if (!timestamp) {
      return '';
    }
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private static readonly CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 h

  /** Tempo restante até o cache expirar, calculado no momento do carregamento. */
  readonly cacheTimeRemaining = computed<string>(() => {
    const ts = this.metrics()?.timestamp;
    if (!ts) return '';
    const expiry = new Date(new Date(ts).getTime() + Metrics.CACHE_TTL_MS);
    const diffMs = expiry.getTime() - Date.now();
    if (diffMs <= 0) return this.t.cache.fresh;
    const totalMin = Math.floor(diffMs / 60_000);
    const h = Math.floor(totalMin / 60);
    const min = totalMin % 60;
    if (h > 0 && min > 0) return `${h}h ${min}min`;
    if (h > 0) return `${h}h`;
    return `${min}min`;
  });

  /** Converte um período no rótulo exibido no eixo X do gráfico. */
  private monthLabel(periodo: string, withYear = false): string {
    if (periodo.length === 10) {
      // Formato diário: yyyy-MM-dd
      const [yearStr, monthStr, dayStr] = periodo.split('-');
      const year = Number.parseInt(yearStr, 10);
      const month = Number.parseInt(monthStr, 10);
      const day = Number.parseInt(dayStr, 10);
      const name = this.monthNames[(month - 1) % 12] ?? '';
      const dd = String(day).padStart(2, '0');
      return withYear ? `${dd}/${name}/${year}` : `${dd}/${name}`;
    }
    // Formato mensal: yyyy-MM
    const parts = periodo.split('-');
    const year = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10);
    const name = this.monthNames[(month - 1) % 12] ?? '';
    return withYear ? `${name}/${year}` : name;
  }

  private defaultDailyRange(): { start: string; end: string } {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    const startMs = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    const start = startMs.toISOString().split('T')[0];
    return { start, end };
  }

  private formatShortDate(isoDate: string): string {
    const [yearStr, monthStr, dayStr] = isoDate.split('-');
    const month = Number.parseInt(monthStr, 10);
    const name = this.monthNames[(month - 1) % 12] ?? '';
    return `${dayStr}/${name}/${yearStr}`;
  }

  private setupRevealObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.07 },
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  private animateCounters(data: LandingMetrics): void {
    const targets: AnimatedValues = {
      barbeariasAtivas: data.totalBarbeariasAtivas ?? 0,
      atendimentos: data.totalAtendimentosRealizados ?? 0,
      clientes: data.totalClientesGerenciados ?? 0,
      servicos: data.totalServicosCadastrados ?? 0,
      agendamentos: data.totalAgendamentos ?? 0,
      despesas: data.totalDespesasRegistradas ?? 0,
    };

    if (typeof requestAnimationFrame === 'undefined') {
      this.displayValues.set(targets);
      return;
    }

    const duration = 1300;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      this.displayValues.set({
        barbeariasAtivas: targets.barbeariasAtivas * eased,
        atendimentos: targets.atendimentos * eased,
        clientes: targets.clientes * eased,
        servicos: targets.servicos * eased,
        agendamentos: targets.agendamentos * eased,
        despesas: targets.despesas * eased,
      });
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.displayValues.set(targets);
      }
    };
    requestAnimationFrame(step);
  }
}
