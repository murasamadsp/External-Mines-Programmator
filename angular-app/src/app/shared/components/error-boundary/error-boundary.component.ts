import {
  Component,
  ErrorHandler,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
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
export class ErrorBoundaryComponent implements OnInit, OnDestroy {
  private readonly errorHandler = inject(ErrorHandler);
  private readonly elementRef = inject(ElementRef);

  readonly hasError = signal(false);
  readonly errorMessage = signal('');
  readonly errorStack = signal('');
  readonly showDetails = signal(false);

  // Store the original content to retry
  private originalContent: unknown = null;
  private errorEventListener?: (event: Event) => void;

  ngOnInit(): void {
    // Store reference to content for retry functionality
    this.originalContent = null;

    // Listen for global error events
    this.errorEventListener = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.error) {
        this.handleError(customEvent.detail.error, customEvent.detail.errorInfo);
      }
    };

    this.elementRef.nativeElement.addEventListener('app-error-boundary', this.errorEventListener);
  }

  ngOnDestroy(): void {
    // Clean up event listener
    if (this.errorEventListener) {
      this.elementRef.nativeElement.removeEventListener(
        'app-error-boundary',
        this.errorEventListener,
      );
    }
  }

  // This method should be called by a custom ErrorHandler
  handleError(error: Error, errorInfo?: unknown): void {
    this.hasError.set(true);
    this.errorMessage.set(error.message || 'An unexpected error occurred');
    this.errorStack.set(error.stack || '');

    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Send to error reporting service
    this.reportErrorToService();
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

  private reportErrorToService(): void {
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
