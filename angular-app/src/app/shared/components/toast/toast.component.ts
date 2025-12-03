import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: { label: string; callback: () => void };
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div
          class="toast toast-{{ toast.type }}"
          [@slideIn]
          (click)="onToastClick()"
          tabindex="0"
          (keydown.enter)="onToastClick()"
          (keydown.space)="onToastClick()"
        >
          <div class="toast-icon">
            {{ getIcon(toast.type) }}
          </div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            @if (toast.message) {
              <div class="toast-message">{{ toast.message }}</div>
            }
          </div>
          @if (toast.action) {
            <button
              class="toast-action"
              (click)="onActionClick(toast, $event)"
              (keydown.enter)="onActionClick(toast, $event)"
              (keydown.space)="onActionClick(toast, $event)"
              tabindex="0"
            >
              {{ toast.action.label }}
            </button>
          }
          <button
            class="toast-close"
            (click)="removeToast(toast.id, $event)"
            (keydown.enter)="removeToast(toast.id, $event)"
            (keydown.space)="removeToast(toast.id, $event)"
            aria-label="Close"
            tabindex="0"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: var(--z-toast, 1080);
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 420px;
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: var(--surface-bg-elevated);
        backdrop-filter: blur(12px);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        border-left: 4px solid;
        pointer-events: auto;
        cursor: pointer;
        transition: all var(--transition-fast);
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .toast:hover {
        transform: translateX(-4px);
        box-shadow:
          var(--shadow-xl),
          0 0 0 1px rgba(255, 255, 255, 0.1);
      }

      .toast-success {
        border-left-color: var(--color-success);
      }

      .toast-error {
        border-left-color: var(--color-danger);
      }

      .toast-warning {
        border-left-color: var(--color-warning);
      }

      .toast-info {
        border-left-color: var(--color-primary);
      }

      .toast-icon {
        font-size: 24px;
        flex-shrink: 0;
        line-height: 1;
      }

      .toast-content {
        flex: 1;
        min-width: 0;
      }

      .toast-title {
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        color: var(--color-text-primary);
        margin-bottom: 4px;
      }

      .toast-message {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        line-height: 1.4;
        word-break: break-word;
      }

      .toast-action {
        padding: 6px 12px;
        background: var(--color-primary);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: background var(--transition-fast);
      }

      .toast-action:hover {
        background: var(--color-primary-hover);
      }

      .toast-close {
        padding: 0;
        width: 24px;
        height: 24px;
        background: transparent;
        border: none;
        color: var(--color-text-secondary);
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
        flex-shrink: 0;
      }

      .toast-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text-primary);
      }

      @media (max-width: 640px) {
        .toast-container {
          left: 12px;
          right: 12px;
          max-width: none;
        }
      }
    `,
  ],
})
export class ToastComponent {
  toasts = signal<Toast[]>([]);

  show(toast: Omit<Toast, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    this.toasts.update((toasts) => [...toasts, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, newToast.duration);
    }

    return id;
  }

  removeToast(id: string, event?: Event): void {
    event?.stopPropagation();
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  onToastClick(): void {
    // Allow clicking on toast to dismiss (optional behavior)
  }

  onActionClick(toast: Toast, event: Event): void {
    event.stopPropagation();
    toast.action?.callback();
    this.removeToast(toast.id);
  }

  getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
    }
  }

  // Public API methods
  success(title: string, message = '', duration = 3000): string {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message = '', duration = 5000): string {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message = '', duration = 4000): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message = '', duration = 3000): string {
    return this.show({ type: 'info', title, message, duration });
  }

  clear(): void {
    this.toasts.set([]);
  }
}
