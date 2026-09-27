import { Routes } from '@angular/router';

import { pageSeo } from './config/seo.config';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    // A home vai no pacote inicial (é a porta de entrada e ficou leve com o globo em @defer):
    // carregá-la sob demanda somava mais idas e voltas de rede antes de desenhar o topo
    path: '',
    title: pageSeo('').title,
    component: Home,
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
