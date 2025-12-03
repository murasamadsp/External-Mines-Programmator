---
name: angular-interceptor
description: Generates Angular HTTP interceptors for request/response handling
---

# Angular HTTP Interceptor Generator

This skill helps you generate Angular HTTP interceptors for handling authentication, logging, error handling, and request/response modification.

## Authentication Interceptor Template

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token from storage
    const token = localStorage.getItem('authToken');

    // Clone request and add authorization header
    const authReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

    return next.handle(authReq);
  }
}
```

## Error Handling Interceptor Template

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        console.error(errorMessage);

        // Handle specific error codes
        if (error.status === 401) {
          // Handle unauthorized
          // this.authService.logout();
        }

        return throwError(() => error);
      }),
    );
  }
}
```

## Logging Interceptor Template

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();

    console.log(`Request: ${req.method} ${req.url}`);

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const endTime = Date.now();
          const duration = endTime - startTime;

          console.log(`Response: ${event.status} ${req.method} ${req.url} - ${duration}ms`);
        }
      }),
    );
  }
}
```

## Request/Response Transformation Interceptor Template

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Transform request
    const transformedReq = req.clone({
      body: this.transformRequest(req.body),
    });

    return next.handle(transformedReq).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Transform response
          return event.clone({
            body: this.transformResponse(event.body),
          });
        }
        return event;
      }),
    );
  }

  private transformRequest(body: any): any {
    // Transform request body if needed
    return body;
  }

  private transformResponse(body: any): any {
    // Transform response body if needed
    return body;
  }
}
```

## Loading Interceptor Template

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor() // private loadingService: LoadingService
  {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.activeRequests === 0) {
      // this.loadingService.show();
    }

    this.activeRequests++;

    return next.handle(req).pipe(
      finalize(() => {
        this.activeRequests--;

        if (this.activeRequests === 0) {
          // this.loadingService.hide();
        }
      }),
    );
  }
}
```

## Configuration in App Config

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loggingInterceptor])),
  ],
};

// Or using functional interceptors (Angular 15+)
export function authInterceptor(
  req: HttpRequest<any>,
  next: HttpHandler,
): Observable<HttpEvent<any>> {
  const token = localStorage.getItem('authToken');

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next.handle(authReq);
}
```

## Testing Template

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { {{Name}}Interceptor } from './{{name}}.interceptor';

describe('{{Name}}Interceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: {{Name}}Interceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should intercept requests', () => {
    httpClient.get('/test').subscribe();

    const req = httpTestingController.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBeTruthy();
  });
});
```

## Key Principles

- **Functional Interceptors**: Prefer functional interceptors over class-based for better testing
- **Order Matters**: Interceptors execute in registration order
- **Error Handling**: Always handle errors properly to prevent breaking the request chain
- **Performance**: Avoid heavy operations in interceptors
- **Immutability**: Clone requests instead of mutating them
- **Testing**: Use HttpClientTestingModule for interceptor testing</contents>
