import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { APP_STORE_URLS, AppStoreUrls } from '../../config/app-store.config';
import { COPY } from '../../config/copy';
import { APP_VERSION, AppVersion } from '../../config/version.config';
import { AnalyticsService } from '../../services/analytics.service';
import { ExperimentService } from '../../services/experiment.service';
import { LandingMetrics, MetricsService } from '../../services/metrics.service';
import { Footer } from '../../shared/footer/footer';
import { GlobeMap } from '../../shared/globe-map/globe-map';
import { Navbar } from '../../shared/navbar/navbar';

export type LandingStats = LandingMetrics;

type FeatureItem = (typeof COPY.home.features.groups)[number]['items'][number];

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, Navbar, Footer, GlobeMap],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly metricsService = inject(MetricsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly analytics = inject(AnalyticsService);

  readonly storeUrls: AppStoreUrls = APP_STORE_URLS;
  readonly appVersion: AppVersion = APP_VERSION;
  readonly t = COPY.home;
  readonly brand = COPY.brand;

  readonly stats = signal<LandingStats | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<boolean>(false);

  // Animated and Formatted Stat Numbers
  readonly animatedBarbearias = signal<string>('0');
  readonly animatedCortes = signal<string>('0');
  readonly animatedMedia = signal<string>('0');

  // Explorador de funcionalidades: área (aba) e funcionalidade abertas
  readonly activeGroup = signal(0);
  readonly activeFeature = signal(0);
  readonly currentGroup = computed(() => this.t.features.groups[this.activeGroup()]);
  readonly currentFeature = computed(() => this.currentGroup().items[this.activeFeature()]);

  /** Teste A/B da section de funcionalidades: A = grade de 12 cards, B = explorador por área. */
  readonly featuresVariant = inject(ExperimentService).variant('versao_funcionalidades', [
    'A',
    'B',
  ] as const);

  private animationStarted = false;

  selectGroup(index: number): void {
    this.activeGroup.set(index);
    this.activeFeature.set(0);
    this.analytics.event('explorar_area', { area: this.currentGroup().id });
  }

  /** Clique nos botões das lojas: a principal conversão da landing. */
  trackStore(store: 'google_play' | 'app_store'): void {
    this.analytics.event('clique_loja', { loja: store, local: 'hero' });
  }

  trackTutorial(feature: string): void {
    this.analytics.event('ver_tutorial', { funcionalidade: feature });
  }

  // Setas, Home e End trocam de aba, como no padrão de abas do WAI-ARIA
  onTabKeydown(event: KeyboardEvent, index: number): void {
    const total = this.t.features.groups.length;
    const next: Record<string, number> = {
      ArrowRight: (index + 1) % total,
      ArrowLeft: (index - 1 + total) % total,
      Home: 0,
      End: total - 1,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    this.selectGroup(next[event.key]);
    const tabs = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll(
      '[role="tab"]',
    );
    (tabs?.[next[event.key]] as HTMLElement | undefined)?.focus();
  }

  /** Número ao vivo da API ligado à funcionalidade (ex.: "17.563 clientes cadastrados no app"). */
  featureStat(item: FeatureItem): string | null {
    const data = this.stats();
    if (!data || !('stat' in item)) return null;
    const value = data[item.stat.key];
    return value > 0 ? `${value.toLocaleString('pt-BR')} ${item.stat.label}` : null;
  }

  ngOnInit(): void {
    this.fetchStats();
  }

  fetchStats(): void {
    this.loading.set(true);
    this.error.set(false);
    this.metricsService
      .getOverview()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.loading.set(false);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.setupRevealObserver();
            });
          });
        },
        error: (err) => {
          console.error('Erro ao buscar estatísticas da landing page:', err);
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  private setupRevealObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.animateNumbers();
      return;
    }

    // 1. General reveal observer for page section fades
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 },
    );
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    // 2. Dedicated observer strictly for the numbers grid
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
      const statsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animateNumbers();
              statsObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35, rootMargin: '0px' },
      );
      statsObserver.observe(statsGrid);
    }
  }

  private animateNumbers(): void {
    if (this.animationStarted) return;
    const data = this.stats();
    if (!data) return;

    this.animationStarted = true;

    const targetBarbearias = data.totalBarbeariasAtivas ?? 465;
    const targetCortes = data.totalAtendimentosRealizados ?? 8212;
    const targetMedia = data.mediaAtendimentosPorBarbearia ?? 17.7;

    const duration = 2200; // 2.2 seconds smooth roll
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easeOutExpo curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const currentBarbearias = Math.floor(targetBarbearias * ease);
      const currentCortes = Math.floor(targetCortes * ease);
      const currentMedia = (targetMedia * ease).toFixed(1);

      this.animatedBarbearias.set(currentBarbearias.toLocaleString('pt-BR'));
      this.animatedCortes.set(currentCortes.toLocaleString('pt-BR'));
      this.animatedMedia.set(
        parseFloat(currentMedia).toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
      );

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        // Final exact formatted numbers
        this.animatedBarbearias.set(targetBarbearias.toLocaleString('pt-BR'));
        this.animatedCortes.set(targetCortes.toLocaleString('pt-BR')); // e.g. 8.212
        this.animatedMedia.set(
          targetMedia.toLocaleString('pt-BR', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
        );
      }
    };

    requestAnimationFrame(frame);
  }
}
