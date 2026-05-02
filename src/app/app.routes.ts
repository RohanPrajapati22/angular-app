import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'opening-stock',
        loadComponent: () => import('./pages/opening-stock/opening-stock.component').then(m => m.OpeningStockComponent)
      },
      {
        path: 'opening-stock-serialnos/:osSrno',
        loadComponent: () => import('./pages/opening-stock-serialnos/opening-stock-serialnos.component').then(m => m.OpeningStockSerialnosComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
