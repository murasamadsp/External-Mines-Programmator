import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';

interface ErrorInfo {
  message: string;
  stack: string;
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private ngZone = inject(NgZone);

  handleError(error: unknown): void {
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

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (
      error &&
      typeof error === 'object' &&
      'rejection' in error &&
      error.rejection instanceof Error
    ) {
      return error.rejection.message;
    }

    return String(error || 'Unknown error');
  }

  private extractErrorStack(error: unknown): string {
    if (error instanceof Error) {
      return error.stack || '';
    }

    if (
      error &&
      typeof error === 'object' &&
      'rejection' in error &&
      error.rejection instanceof Error
    ) {
      return error.rejection.stack || '';
    }

    return '';
  }

  private notifyErrorBoundaries(error: unknown, errorInfo: ErrorInfo): void {
    // Find all error boundary components in the DOM and notify them
    // This is a simplified approach - you might want more sophisticated logic

    const errorBoundaries = document.querySelectorAll('app-error-boundary');

    errorBoundaries.forEach((boundary) => {
      // Use a custom event to notify the component
      const event = new CustomEvent('app-error-boundary', {
        detail: { error, errorInfo },
        bubbles: true,
      });
      boundary.dispatchEvent(event);
    });
  }

  private reportError(error: unknown, errorInfo: ErrorInfo): void {
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
    console.log('Error reported:', errorReport);
  }

  private getCurrentUserId(): string | null {
    // Implement based on your authentication system
    return localStorage.getItem('userId');
  }
}
