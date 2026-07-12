import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { APP_VERSION, AppVersion } from '../../config/version.config';
import { COPY } from '../../config/copy';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

interface Slide {
  image: string;
  caption: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit, OnDestroy {
  readonly appVersion: AppVersion = APP_VERSION;
  readonly t = COPY.about;
  readonly brand = COPY.brand;
  private sanitizer = inject(DomSanitizer);
  currentSlide = signal(0);
  private autoPlayInterval: ReturnType<typeof setInterval> | null = null;

  slides: Slide[] = [
    {
      image: 'screenshots/dashboard.png',
      caption: 'Acompanhe o faturamento da sua barbearia em tempo real',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
    },
    {
      image: 'screenshots/teste.png',
      caption: 'Todas as informações do seu negócio em um só lugar',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    },
    {
      image: 'screenshots/cliente2.png',
      caption: 'Gerencie sua base de clientes com facilidade',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    },
    {
      image: 'screenshots/atendimento.png',
      caption: 'Controle atendimentos do dia',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>',
    },
    {
      image: 'screenshots/servicos.png',
      caption: 'Cadastre cortes, preços e serviços oferecidos',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/></svg>',
    },
    {
      image: 'screenshots/despesas.png',
      caption: 'Tenha controle total das despesas da barbearia',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/><line x1="2" y1="10" x2="6" y2="10"/><line x1="18" y1="10" x2="22" y2="10"/></svg>',
    },
    {
      image: 'screenshots/perfil.png',
      caption: 'Personalize seu perfil profissional',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    },
  ];

  getSafeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  nextSlide() {
    this.currentSlide.set((this.currentSlide() + 1) % this.slides.length);
    this.restartAutoPlay();
  }

  prevSlide() {
    this.currentSlide.set((this.currentSlide() - 1 + this.slides.length) % this.slides.length);
    this.restartAutoPlay();
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.restartAutoPlay();
  }

  private startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.currentSlide.set((this.currentSlide() + 1) % this.slides.length);
    }, 5000);
  }

  private stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  private restartAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
