import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
  },
  {
    path: 'result/:id',
    loadComponent: () => import('./result/result.component').then(c => c.ResultComponent),
  },
];
