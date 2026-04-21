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
    path: 'termos',
    loadComponent: () => import('./pages/terms/terms').then((m) => m.Terms),
  },
  {
    path: 'privacidade',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
];
