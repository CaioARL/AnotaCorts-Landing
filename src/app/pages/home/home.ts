import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_STORE_URLS, AppStoreUrls } from '../../config/app-store.config';
import { COPY } from '../../config/copy';
import { APP_VERSION, AppVersion } from '../../config/version.config';
import { LandingMetrics, MetricsService } from '../../services/metrics.service';
import { Footer } from '../../shared/footer/footer';
import { Navbar } from '../../shared/navbar/navbar';

export type LandingStats = LandingMetrics;

@Component({
  selector: 'app-home',
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly metricsService = inject(MetricsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly storeUrls: AppStoreUrls = APP_STORE_URLS;
  readonly appVersion: AppVersion = APP_VERSION;
  readonly t = COPY.home;
  readonly brand = COPY.brand;

  readonly stats = signal<LandingStats | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<boolean>(false);

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
          requestAnimationFrame(() => requestAnimationFrame(() => this.setupRevealObserver()));
        },
        error: (err) => {
          console.error('Erro ao buscar estatísticas da landing page:', err);
          this.error.set(true);
          this.loading.set(false);
        },
      });
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
}
