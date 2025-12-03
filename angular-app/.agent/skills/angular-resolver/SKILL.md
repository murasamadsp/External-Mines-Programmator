---
name: angular-resolver
description: Generates Angular route resolvers for data fetching and route guards
---

# Angular Resolver Generator

This skill helps you generate Angular route resolvers for pre-fetching data before route activation, ensuring components receive required data immediately upon loading.

## Basic Resolver Template

```typescript
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { {{ServiceName}} } from '../services/{{service-name}}.service';
import { {{ModelName}} } from '../models/{{model-name}}.model';

@Injectable({
  providedIn: 'root',
})
export class {{Name}}Resolver implements Resolve<{{ModelName}}> {
  constructor(private {{serviceName}}: {{ServiceName}}) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<{{ModelName}}> {
    const id = route.paramMap.get('id');
    return this.{{serviceName}}.getById(id!);
  }
}
```

## Resolver with Error Handling Template

```typescript
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { {{ServiceName}} } from '../services/{{service-name}}.service';
import { {{ModelName}} } from '../models/{{model-name}}.model';

@Injectable({
  providedIn: 'root',
})
export class {{Name}}Resolver implements Resolve<{{ModelName}} | null> {
  constructor(
    private {{serviceName}}: {{ServiceName}},
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<{{ModelName}} | null> {
    const id = route.paramMap.get('id');

    return this.{{serviceName}}.getById(id!).pipe(
      catchError(() => {
        this.router.navigate(['/not-found']);
        return EMPTY;
      })
    );
  }
}
```

## Array/List Resolver Template

```typescript
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { {{ServiceName}} } from '../services/{{service-name}}.service';
import { {{ModelName}} } from '../models/{{model-name}}.model';

@Injectable({
  providedIn: 'root',
})
export class {{Name}}ListResolver implements Resolve<{{ModelName}}[]> {
  constructor(private {{serviceName}}: {{ServiceName}}) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<{{ModelName}}[]> {
    // Get query parameters for filtering/pagination
    const params = route.queryParams;
    return this.{{serviceName}}.getList(params);
  }
}
```

## Conditional Resolver Template

```typescript
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { {{ServiceName}} } from '../services/{{service-name}}.service';
import { {{ModelName}} } from '../models/{{model-name}}.model';

@Injectable({
  providedIn: 'root',
})
export class {{Name}}Resolver implements Resolve<{{ModelName}} | null> {
  constructor(private {{serviceName}}: {{ServiceName}}) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<{{ModelName}} | null> {
    const id = route.paramMap.get('id');

    // Return null if no ID (for create mode)
    if (!id) {
      return of(null);
    }

    // Fetch data for edit mode
    return this.{{serviceName}}.getById(id);
  }
}
```

## Common Resolver Examples

### User Resolver

```typescript
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserResolver implements Resolve<User> {
  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
    const userId = route.paramMap.get('id');

    return this.userService.getUser(userId!).pipe(
      catchError(() => {
        this.router.navigate(['/users']);
        return EMPTY;
      }),
    );
  }
}
```

### Settings Resolver

```typescript
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsService } from '../services/settings.service';
import { AppSettings } from '../models/app-settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsResolver implements Resolve<AppSettings> {
  constructor(private settingsService: SettingsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AppSettings> {
    return forkJoin({
      userSettings: this.settingsService.getUserSettings(),
      appConfig: this.settingsService.getAppConfig(),
    }).pipe(
      map(({ userSettings, appConfig }) => ({
        ...userSettings,
        ...appConfig,
      })),
    );
  }
}
```

## Usage in Routes

```typescript
import { Routes } from '@angular/router';
import { {{Name}}Resolver } from './resolvers/{{name}}.resolver';

export const routes: Routes = [
  {
    path: 'item/:id',
    component: ItemDetailComponent,
    resolve: {
      item: {{Name}}Resolver,
    },
  },
  {
    path: 'items',
    component: ItemsListComponent,
    resolve: {
      items: {{Name}}ListResolver,
    },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    resolve: {
      settings: SettingsResolver,
    },
  },
];
```

## Usage in Components

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { {{ModelName}} } from '../models/{{model-name}}.model';

@Component({
  selector: 'app-{{name}}-detail',
  template: `
    <div *ngIf="data">
      <!-- Use resolved data -->
      <h2>{{ data.name }}</h2>
    </div>
    <div *ngIf="!data">
      <p>Loading...</p>
    </div>
  `,
})
export class {{Name}}DetailComponent implements OnInit {
  data: {{ModelName}};

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Data is available immediately
    this.data = this.route.snapshot.data['{{name}}'];
  }
}
```

## Testing Template

```typescript
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { {{Name}}Resolver } from './{{name}}.resolver';
import { {{ServiceName}} } from '../services/{{service-name}}.service';

describe('{{Name}}Resolver', () => {
  let resolver: {{Name}}Resolver;
  let {{serviceName}}: jasmine.SpyObj<{{ServiceName}}>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('{{ServiceName}}', ['getById']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {{Name}}Resolver,
        { provide: {{ServiceName}}, useValue: spy },
      ],
    });

    resolver = TestBed.inject({{Name}}Resolver);
    {{serviceName}} = TestBed.inject({{ServiceName}}) as jasmine.SpyObj<{{ServiceName}}>;
  });

  it('should resolve data', (done) => {
    const mockData = { id: 1, name: 'Test' };
    {{serviceName}}.getById.and.returnValue(of(mockData));

    const route = { paramMap: { get: () => '1' } } as any;

    resolver.resolve(route, {} as any).subscribe((data) => {
      expect(data).toEqual(mockData);
      done();
    });
  });
});
```

## Key Principles

- **Pre-fetching**: Resolvers run before route activation to ensure data availability
- **Error Handling**: Handle errors gracefully, potentially redirecting users
- **Type Safety**: Define proper return types for resolved data
- **Observables**: Return Observable streams that complete after first emission
- **Single Responsibility**: Each resolver should handle one data concern
- **Testing**: Resolvers should be unit tested with mock services
- **Performance**: Consider caching strategies for frequently accessed data</contents>
  </xai:function_call name="Shell">
  <parameter name="command">mkdir -p /Users/murasama/Projects/External-Mines-Programmator/angular-app/.agent/skills/angular-directive
