// Error Handling Utilities
// Provides comprehensive error handling and user-friendly error messages

/**
 * Custom error types for the programmator
 */
export class ProgrammatorError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ProgrammatorError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends ProgrammatorError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class SerializationError extends ProgrammatorError {
  constructor(message, details = {}) {
    super(message, 'SERIALIZATION_ERROR', details);
    this.name = 'SerializationError';
  }
}

export class UIError extends ProgrammatorError {
  constructor(message, details = {}) {
    super(message, 'UI_ERROR', details);
    this.name = 'UIError';
  }
}

/**
 * Error handler that provides user-friendly error messages
 */
export class ErrorHandler {
  static handle(error, context = {}) {
    console.error('Programmator Error:', error, context);

    // Create user-friendly error message
    const userMessage = this.getUserFriendlyMessage(error);

    // Log detailed error for debugging
    this.logDetailedError(error, context);

    return {
      userMessage,
      technicalDetails: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      recoverable: this.isRecoverable(error)
    };
  }

  static getUserFriendlyMessage(error) {
    if (error instanceof ValidationError) {
      return `Validation Error: ${error.message}`;
    }

    if (error instanceof SerializationError) {
      return `Program Loading Error: ${error.message}`;
    }

    if (error instanceof UIError) {
      return `Interface Error: ${error.message}`;
    }

    // Generic errors
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection.';
    }

    if (message.includes('memory') || message.includes('out of memory')) {
      return 'Not enough memory. Try closing other applications.';
    }

    if (message.includes('permission') || message.includes('access denied')) {
      return 'Permission denied. Please check file permissions.';
    }

    if (message.includes('not found') || message.includes('404')) {
      return 'Resource not found. Please refresh the page.';
    }

    return 'An unexpected error occurred. Please try again or contact support.';
  }

  static logDetailedError(error, context) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In production, this would be sent to error reporting service
    console.error('Detailed Error Log:', JSON.stringify(errorLog, null, 2));
  }

  static isRecoverable(error) {
    // Define which errors are recoverable
    const recoverableCodes = [
      'VALIDATION_ERROR',
      'UI_ERROR'
    ];

    const recoverableMessages = [
      'network',
      'timeout',
      'permission'
    ];

    return recoverableCodes.includes(error.code) ||
           recoverableMessages.some(msg => error.message.toLowerCase().includes(msg));
  }

  static async withErrorHandling(asyncFn, context = {}) {
    try {
      return await asyncFn();
    } catch (error) {
      const handledError = this.handle(error, context);
      throw handledError;
    }
  }
}

/**
 * Safe wrapper for functions that might throw errors
 */
export function safeExecute(fn, fallback = null, context = {}) {
  try {
    return fn();
  } catch (error) {
    ErrorHandler.handle(error, context);
    return fallback;
  }
}

/**
 * Async safe wrapper
 */
export async function safeExecuteAsync(fn, fallback = null, context = {}) {
  try {
    return await fn();
  } catch (error) {
    const handledError = ErrorHandler.handle(error, context);
    return fallback;
  }
}
