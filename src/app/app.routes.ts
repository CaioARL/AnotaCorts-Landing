import { Routes } from '@angular/router';

import { pageSeo } from './config/seo.config';

export const routes: Routes = [
  {
    path: '',
    title: pageSeo('').title,
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'sobre',
    title: pageSeo('sobre').title,
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'tutorial',
    title: pageSeo('tutorial').title,
    loadComponent: () => import('./pages/tutorial/tutorial').then((m) => m.Tutorial),
  },
  {
    path: 'metricas',
    title: pageSeo('metricas').title,
    loadComponent: () => import('./pages/metrics/metrics').then((m) => m.Metrics),
  },
  {
    path: 'termos',
    title: pageSeo('termos').title,
    loadComponent: () => import('./pages/terms/terms').then((m) => m.Terms),
  },
  {
    path: 'privacidade',
    title: pageSeo('privacidade').title,
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
];
