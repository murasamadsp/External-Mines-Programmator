import {
  Injectable,
  inject,
  ComponentRef,
  createComponent,
  EmbeddedViewRef,
  ApplicationRef,
  EnvironmentInjector,
} from '@angular/core';
import { ToastComponent, Toast } from '../../shared/components/toast/toast.component';

/**
 * Global Toast Service
 * Manages toast notifications across the application
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private toastComponentRef: ComponentRef<ToastComponent> | null = null;

  constructor() {
    this.initializeToastContainer();
  }

  private initializeToastContainer(): void {
    // Create toast component dynamically
    this.toastComponentRef = createComponent(ToastComponent, {
      environmentInjector: this.injector,
    });

    // Attach to application
    this.appRef.attachView(this.toastComponentRef.hostView);

    // Append to body
    const domElem = (this.toastComponentRef.hostView as EmbeddedViewRef<unknown>)
      .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }

  private get toastComponent(): ToastComponent {
    if (!this.toastComponentRef) {
      this.initializeToastContainer();
    }
    return this.toastComponentRef!.instance;
  }

  /**
   * Show a success toast
   */
  success(title: string, message = '', duration = 3000): string {
    return this.toastComponent.success(title, message, duration);
  }

  /**
   * Show an error toast
   */
  error(title: string, message = '', duration = 5000): string {
    return this.toastComponent.error(title, message, duration);
  }

  /**
   * Show a warning toast
   */
  warning(title: string, message = '', duration = 4000): string {
    return this.toastComponent.warning(title, message, duration);
  }

  /**
   * Show an info toast
   */
  info(title: string, message = '', duration = 3000): string {
    return this.toastComponent.info(title, message, duration);
  }

  /**
   * Show a custom toast with action button
   */
  showWithAction(
    type: Toast['type'],
    title: string,
    message: string,
    actionLabel: string,
    actionCallback: () => void,
    duration = 0, // Don't auto-dismiss with action
  ): string {
    return this.toastComponent.show({
      type,
      title,
      message,
      duration,
      action: {
        label: actionLabel,
        callback: actionCallback,
      },
    });
  }

  /**
   * Remove a specific toast
   */
  remove(id: string): void {
    this.toastComponent.removeToast(id);
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toastComponent.clear();
  }

  /**
   * Show validation warnings with action to view details
   */
  showValidationWarnings(count: number, onViewDetails: () => void): string {
    return this.showWithAction(
      'warning',
      `⚠️ ${count} Validation Warnings`,
      'Click to view details',
      'View',
      onViewDetails,
      0, // Keep visible until dismissed
    );
  }

  /**
   * Show validation errors
   */
  showValidationErrors(count: number, errors: string[]): string {
    const message = errors.slice(0, 3).join('\n');
    const more = errors.length > 3 ? `\n...and ${errors.length - 3} more` : '';
    return this.error(`❌ ${count} Validation Errors`, message + more, 8000);
  }
}
