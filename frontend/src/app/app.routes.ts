import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent),
  },
  {
    path: 'result/:id',
    loadComponent: () => import('./pages/result/result.component').then(c => c.ResultComponent),
  },
];
