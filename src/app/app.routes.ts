import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'tdr-assessment',
    loadComponent: () =>
      import('./features/pages/tdr-assessment/tdr-assessment').then((m) => m.TdrAssessment),
  },
  {
    path: '**',
    loadComponent: () => import('./features/pages/not-found/not-found').then((m) => m.NotFound),
  },
];
