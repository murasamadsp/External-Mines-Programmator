import { Injectable, isDevMode } from '@angular/core';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private isDevelopment = isDevMode();

  private formatMessage(
    level: LogLevel,
    component: string,
    message: string,
    data?: unknown,
  ): string {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`;

    if (data !== undefined) {
      return `${formattedMessage} ${JSON.stringify(data, null, 2)}`;
    }

    return formattedMessage;
  }

  debug(component: string, message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', component, message, data));
    }
  }

  info(component: string, message: string, data?: unknown): void {
    console.info(this.formatMessage('info', component, message, data));
  }

  warn(component: string, message: string, data?: unknown): void {
    console.warn(this.formatMessage('warn', component, message, data));
  }

  error(component: string, message: string, error?: unknown): void {
    const errorData =
      error instanceof Error ? { message: error.message, stack: error.stack } : error;

    console.error(this.formatMessage('error', component, message, errorData));
  }

  // Performance logging
  time(component: string, label: string): void {
    if (this.isDevelopment) {
      console.time(`[${component}] ${label}`);
    }
  }

  timeEnd(component: string, label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(`[${component}] ${label}`);
    }
  }

  // User action tracking
  action(component: string, action: string, details?: unknown): void {
    this.info(component, `User action: ${action}`, details);
  }

  // Component lifecycle
  lifecycle(component: string, event: string, data?: unknown): void {
    this.debug(component, `Lifecycle: ${event}`, data);
  }
}


