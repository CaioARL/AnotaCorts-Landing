import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'AnotaCorts - Gestão Digital para sua Barbearia',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'sobre',
    title: 'Sobre o AnotaCorts - Conheça o App',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'tutorial',
    title: 'Tutorial - Como usar o AnotaCorts',
    loadComponent: () => import('./pages/tutorial/tutorial').then((m) => m.Tutorial),
  },
  {
    path: 'metricas',
    title: 'Métricas da Plataforma - AnotaCorts',
    loadComponent: () => import('./pages/metrics/metrics').then((m) => m.Metrics),
  },
  {
    path: 'termos',
    title: 'Termos de Uso - AnotaCorts',
    loadComponent: () => import('./pages/terms/terms').then((m) => m.Terms),
  },
  {
    path: 'privacidade',
    title: 'Política de Privacidade - AnotaCorts',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
];
