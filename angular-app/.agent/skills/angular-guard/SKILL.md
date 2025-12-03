---
name: angular-guard
description: Generates Angular route guards for authentication and authorization
---

# Angular Guard Generator

This skill helps you generate Angular route guards following best practices for authentication, authorization, and route protection.

## CanActivate Guard Template

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class {{Name}}Guard implements CanActivate {
  constructor(
    private router: Router,
    // private authService: AuthService
  ) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    // return this.authService.isAuthenticated$.pipe(
    //   take(1),
    //   map(isAuthenticated => {
    //     if (!isAuthenticated) {
    //       this.router.navigate(['/login']);
    //       return false;
    //     }
    //     return true;
    //   })
    // );

    // Temporary implementation
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
```

## CanActivateChild Guard Template

```typescript
import { Injectable } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class {{Name}}ChildGuard implements CanActivateChild {
  constructor(
    private router: Router,
    // private authService: AuthService
  ) {}

  canActivateChild(): Observable<boolean> | Promise<boolean> | boolean {
    // Implement child route protection logic
    return true;
  }
}
```

## CanDeactivate Guard Template

```typescript
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class {{Name}}DeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
```

## CanLoad Guard Template

```typescript
import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class {{Name}}LoadGuard implements CanLoad {
  constructor(
    private router: Router,
    // private authService: AuthService
  ) {}

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    // Check if user has permission to load this module
    return true;
  }
}
```

## Usage in Routes

```typescript
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthChildGuard],
    children: [
      {
        path: 'users',
        component: UsersComponent,
        canDeactivate: [UnsavedChangesGuard],
      },
    ],
  },
  {
    path: 'lazy-module',
    loadChildren: () => import('./lazy/lazy.module').then((m) => m.LazyModule),
    canLoad: [AuthLoadGuard],
  },
];
```

## Key Principles

- **Injectable**: Always use `providedIn: 'root'` for guards
- **Reactive**: Prefer Observable-based guards for reactive authentication
- **Navigation**: Use Router to redirect unauthorized users
- **Type Safety**: Implement proper interfaces for CanDeactivate
- **Single Responsibility**: Each guard should handle one specific concern
- **Testing**: Guards should be easily testable with dependency injection</contents>
