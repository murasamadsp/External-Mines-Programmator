---
name: angular-routing
description: Generates Angular routing configurations and navigation patterns
---

# Angular Routing Generator

This skill helps you generate Angular routing configurations, lazy loading, route guards, and navigation patterns following best practices.

## Basic Route Configuration

```typescript
import { Routes } from '@angular/router';
import { EditorComponent } from './features/editor/editor.component';
import { AuthGuard } from './core/guards/auth.guard';

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
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
```

## Real Example: Admin Routes with Lazy Loading

```typescript
import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin.component').then((m) => m.AdminComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
```

## Lazy Loading Routes

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
    canLoad: [AuthGuard],
    data: { preload: false },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.routes').then((m) => m.usersRoutes),
  },
];

// Separate route file (admin.routes.ts)
export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'users',
        component: AdminUsersComponent,
      },
      {
        path: 'settings',
        component: AdminSettingsComponent,
      },
    ],
  },
];
```

## Route Guards Integration

```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'users',
        component: UsersComponent,
        canDeactivate: [UnsavedChangesGuard],
      },
    ],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
];
```

## Router Service Usage

```typescript
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private router: Router) {
    // Listen to navigation events
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Navigation to:', event.url);
      });
  }

  navigateToUser(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  navigateWithQueryParams(): void {
    this.router.navigate(['/search'], {
      queryParams: { q: 'angular', page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  goBack(): void {
    this.router.navigate(['../']);
  }

  getCurrentRoute(): string {
    return this.router.url;
  }
}
```

## Route Resolvers

```typescript
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserResolver implements Resolve<User> {
  constructor(private userService: UserService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    const userId = route.paramMap.get('id');
    return this.userService.getUser(userId!);
  }
}

// Usage in routes
export const routes: Routes = [
  {
    path: 'users/:id',
    component: UserDetailComponent,
    resolve: {
      user: UserResolver,
    },
  },
];

// Usage in component
export class UserDetailComponent {
  user: User;

  constructor(private route: ActivatedRouteSnapshot) {
    this.user = this.route.data['user'];
  }
}
```

## Preloading Strategy

```typescript
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload based on data property
    if (route.data && route.data['preload']) {
      return load();
    }

    // Preload admin routes
    if (route.path === 'admin') {
      return load();
    }

    return of(null);
  }
}

// Usage in app.config.ts
import { provideRouter, withPreloading } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withPreloading(CustomPreloadingStrategy))],
};
```

## Component Navigation

```typescript
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  template: `
    <div>
      <h2>User Detail</h2>
      <p>User ID: {{ userId }}</p>
      <p>Query Param: {{ searchQuery }}</p>

      <button (click)="goToEdit()">Edit User</button>
      <button (click)="goBack()">Back</button>
    </div>
  `,
})
export class UserDetailComponent {
  userId: string;
  searchQuery: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // Get route parameters
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id')!;
    });

    // Get query parameters
    this.route.queryParamMap.subscribe((params) => {
      this.searchQuery = params.get('q')!;
    });
  }

  goToEdit(): void {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
```

## Route Animations

```typescript
import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%'
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0%)' }))
      ], { optional: true })
    ])
  ])
]);

// Usage in app.component.html
<div [@routeAnimations]="getRouteAnimationState(outlet)">
  <router-outlet #outlet="outlet"></router-outlet>
</div>
```

## Key Principles

- **Lazy Loading**: Use lazy loading for better performance
- **Route Guards**: Implement proper authorization with guards
- **Data Property**: Use data property for route metadata
- **Resolvers**: Use resolvers for data fetching before route activation
- **Relative Navigation**: Prefer relative navigation in components
- **Route Events**: Listen to router events for analytics/logging
- **Preloading**: Implement custom preloading strategies for performance</contents>
