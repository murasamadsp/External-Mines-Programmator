import { Routes } from '@angular/router';
import { EditorComponent } from './features/editor/editor.component';
import { AuthGuard } from './core/guards/auth.guard';
import { SettingsResolver } from './core/resolvers/settings.resolver';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/editor',
    pathMatch: 'full',
  },
  {
    path: 'editor',
    component: EditorComponent,
    data: { title: 'Program Editor' },
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
    canLoad: [AuthGuard],
    data: { preload: false },
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
    resolve: {
      settings: SettingsResolver,
    },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
