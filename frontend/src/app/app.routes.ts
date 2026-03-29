import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/listagem/listagem.component').then(m => m.ListagemComponent)
  },
  {
    path: 'cadastrar',
    loadComponent: () => import('./components/formulario/formulario.component').then(m => m.FormularioComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./components/formulario/formulario.component').then(m => m.FormularioComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { path: '**', redirectTo: '' }
];
