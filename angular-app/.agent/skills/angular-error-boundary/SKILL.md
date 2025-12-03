---
name: angular-error-boundary
description: Generates Angular error boundary components for graceful error handling
---

# Angular Error Boundary Generator

This skill helps you generate Angular error boundary components for graceful error handling, debugging, and user experience improvement following best practices.

## Error Boundary Component Template

```typescript
import { Component, ErrorHandler, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-boundary">
      @if (!hasError()) {
        <ng-content></ng-content>
      } @else {
        <div class="error-fallback">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">Something went wrong</h3>
          <p class="error-message">{{ errorMessage() }}</p>

          @if (showDetails()) {
            <details class="error-details">
              <summary>Error Details</summary>
              <pre class="error-stack">{{ errorStack() }}</pre>
            </details>
          }

          <div class="error-actions">
            <button class="btn-retry" (click)="retry()">Try Again</button>
            <button class="btn-report" (click)="reportError()">Report Issue</button>
            <button class="btn-toggle" (click)="toggleDetails()">
              {{ showDetails() ? 'Hide' : 'Show' }} Details
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .error-boundary {
        width: 100%;
        height: 100%;
      }

      .error-fallback {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        margin: 1rem 0;
      }

      .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .error-title {
        color: #dc3545;
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
      }

      .error-message {
        color: #6c757d;
        margin: 0 0 1rem 0;
        max-width: 500px;
      }

      .error-details {
        width: 100%;
        max-width: 600px;
        margin: 1rem 0;
      }

      .error-stack {
        background: #f1f3f4;
        padding: 1rem;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.875rem;
        white-space: pre-wrap;
        word-break: break-word;
        text-align: left;
        overflow-x: auto;
      }

      .error-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .btn-retry,
      .btn-report,
      .btn-toggle {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .btn-retry {
        background: #007bff;
        color: white;
      }

      .btn-report {
        background: #ffc107;
        color: #212529;
      }

      .btn-toggle {
        background: #6c757d;
        color: white;
      }
    `,
  ],
})
export class ErrorBoundaryComponent {
  private errorHandler = inject(ErrorHandler);

  readonly hasError = signal(false);
  readonly errorMessage = signal('');
  readonly errorStack = signal('');
  readonly showDetails = signal(false);

  // Store the original content to retry
  private originalContent: any = null;

  ngOnInit() {
    // Store reference to content for retry functionality
    this.originalContent = null;
  }

  // This method should be called by a custom ErrorHandler
  handleError(error: Error, errorInfo?: any) {
    this.hasError.set(true);
    this.errorMessage.set(error.message || 'An unexpected error occurred');
    this.errorStack.set(error.stack || '');

    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Send to error reporting service
    this.reportErrorToService(error, errorInfo);
  }

  retry() {
    this.hasError.set(false);
    this.errorMessage.set('');
    this.errorStack.set('');
    this.showDetails.set(false);

    // Optionally trigger change detection or re-initialize content
    // This would require additional logic based on your use case
  }

  reportError() {
    const errorReport = {
      message: this.errorMessage(),
      stack: this.errorStack(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Send to error reporting service (implement based on your needs)
    console.log('Error report:', errorReport);

    // For demo purposes, show alert
    alert('Error reported! Check console for details.');
  }

  toggleDetails() {
    this.showDetails.update((show) => !show);
  }

  private reportErrorToService(error: Error, errorInfo?: any) {
    // Implement your error reporting logic here
    // Examples: Sentry, LogRocket, custom API endpoint, etc.

    try {
      // Example: Send to custom API
      // this.http.post('/api/errors', { error, errorInfo }).subscribe();
      // Example: Send to analytics service
      // this.analytics.trackError(error);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}
```

## Custom Error Handler Template

```typescript
import { ErrorHandler, Injectable, NgZone } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private ngZone: NgZone) {}

  handleError(error: any): void {
    // Run error handling inside Angular zone
    this.ngZone.run(() => {
      // Log error to console
      console.error('Global Error Handler:', error);

      // Extract error information
      const errorMessage = this.extractErrorMessage(error);
      const errorStack = this.extractErrorStack(error);

      // Try to find error boundary components and notify them
      this.notifyErrorBoundaries(error, { message: errorMessage, stack: errorStack });

      // Send to error reporting service
      this.reportError(error, { message: errorMessage, stack: errorStack });
    });
  }

  private extractErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (error?.rejection instanceof Error) {
      return error.rejection.message;
    }

    return error?.toString() || 'Unknown error';
  }

  private extractErrorStack(error: any): string {
    if (error instanceof Error) {
      return error.stack || '';
    }

    if (error?.rejection instanceof Error) {
      return error.rejection.stack || '';
    }

    return '';
  }

  private notifyErrorBoundaries(error: any, errorInfo: any): void {
    // Find all error boundary components in the DOM and notify them
    // This is a simplified approach - you might want more sophisticated logic

    const errorBoundaries = document.querySelectorAll('app-error-boundary');

    errorBoundaries.forEach((boundary) => {
      // Use a custom event or service to notify the component
      const event = new CustomEvent('error-boundary-error', {
        detail: { error, errorInfo },
        bubbles: true,
      });
      boundary.dispatchEvent(event);
    });
  }

  private reportError(error: any, errorInfo: any): void {
    // Implement error reporting logic
    const errorReport = {
      ...errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(), // Implement based on your auth system
    };

    // Send to your error reporting service
    // this.http.post('/api/errors', errorReport).subscribe();
  }

  private getCurrentUserId(): string | null {
    // Implement based on your authentication system
    return localStorage.getItem('userId');
  }
}
```

## Usage in App Component

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ErrorBoundaryComponent } from './shared/components/error-boundary/error-boundary.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ErrorBoundaryComponent],
  template: `
    <app-error-boundary>
      <router-outlet></router-outlet>
    </app-error-boundary>
  `,
})
export class AppComponent {}
```

## Usage Around Specific Components

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorBoundaryComponent } from './shared/components/error-boundary/error-boundary.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ErrorBoundaryComponent],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      <!-- Wrap complex sections in error boundaries -->
      <app-error-boundary>
        <app-complex-chart></app-complex-chart>
      </app-error-boundary>

      <app-error-boundary>
        <app-data-table></app-data-table>
      </app-error-boundary>
    </div>
  `,
})
export class DashboardComponent {}
```

## Configuration in App Config

```typescript
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './core/error/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    // ... other providers
  ],
};
```

## Testing Template

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorBoundaryComponent } from './error-boundary.component';

describe('ErrorBoundaryComponent', () => {
  let component: ErrorBoundaryComponent;
  let fixture: ComponentFixture<ErrorBoundaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBoundaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorBoundaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show content when no error', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.error-fallback')).toBeFalsy();
  });

  it('should show error fallback when error occurs', () => {
    const testError = new Error('Test error');
    component.handleError(testError);

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.error-fallback')).toBeTruthy();
    expect(compiled.querySelector('.error-title')).toBeTruthy();
  });

  it('should retry and hide error', () => {
    const testError = new Error('Test error');
    component.handleError(testError);
    fixture.detectChanges();

    component.retry();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(component.hasError()).toBeFalsy();
    expect(compiled.querySelector('.error-fallback')).toBeFalsy();
  });

  it('should toggle error details', () => {
    const testError = new Error('Test error');
    component.handleError(testError);
    fixture.detectChanges();

    expect(component.showDetails()).toBeFalsy();

    component.toggleDetails();
    expect(component.showDetails()).toBeTruthy();

    component.toggleDetails();
    expect(component.showDetails()).toBeFalsy();
  });
});
```

## Integration with Monitoring Services

```typescript
// Sentry Integration
import * as Sentry from '@sentry/angular';

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    Sentry.captureException(error.originalError || error);
    console.error(error);
  }
}

// Application Insights Integration
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

@Injectable()
export class AppInsightsErrorHandler implements ErrorHandler {
  private appInsights = new ApplicationInsights({
    config: {
      instrumentationKey: 'your-key',
    },
  });

  constructor() {
    this.appInsights.loadAppInsights();
  }

  handleError(error: any): void {
    this.appInsights.trackException({
      exception: error,
      severityLevel: 3, // Error
    });
    console.error(error);
  }
}
```

## Key Principles

- **Graceful Degradation**: Show user-friendly error messages instead of crashing
- **Error Reporting**: Automatically report errors for debugging and monitoring
- **Retry Logic**: Allow users to retry failed operations
- **Development Debugging**: Show detailed error information in development
- **Performance**: Error boundaries should not impact normal operation performance
- **Accessibility**: Error messages should be accessible to screen readers
- **Testing**: Error scenarios should be thoroughly tested
- **Monitoring**: Integrate with error monitoring services for production insights</contents>
  </xai:function_call name="Shell">
  <parameter name="command">mkdir -p /Users/murasama/Projects/External-Mines-Programmator/angular-app/src/app/core/error
