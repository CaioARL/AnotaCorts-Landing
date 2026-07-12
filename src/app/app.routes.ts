import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'sobre',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'tutorial',
    loadComponent: () => import('./pages/tutorial/tutorial').then((m) => m.Tutorial),
  },
  {
    path: 'metricas',
    loadComponent: () => import('./pages/metrics/metrics').then((m) => m.Metrics),
  },
  {
    path: 'termos',
    loadComponent: () => import('./pages/terms/terms').then((m) => m.Terms),
  },
  {
    path: 'privacidade',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
];
