import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="help-button"
      (click)="toggleShortcuts()"
      [attr.aria-label]="'Show keyboard shortcuts'"
      title="Keyboard Shortcuts (Press ?)"
    >
      <span class="help-icon">?</span>
    </button>
  `,
  styles: [
    `
      .help-button {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: var(--z-fixed, 1030);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        padding: 0;
        background: var(--color-primary);
        border: none;
        border-radius: var(--radius-full);
        color: white;
        font-size: 24px;
        font-weight: var(--font-weight-bold);
        cursor: pointer;
        box-shadow: var(--shadow-xl);
        transition: all var(--transition-fast);
      }

      .help-button:hover {
        transform: scale(1.1);
        box-shadow:
          var(--shadow-xl),
          0 0 0 4px rgba(59, 130, 246, 0.2);
        background: var(--color-primary-hover);
      }

      .help-button:active {
        transform: scale(0.95);
      }

      .help-icon {
        line-height: 1;
      }

      @media (max-width: 640px) {
        .help-button {
          bottom: 12px;
          left: 12px;
          width: 44px;
          height: 44px;
          font-size: 20px;
        }
      }
    `,
  ],
})
export class HelpButtonComponent {
  toggleShortcuts(): void {
    // This will be triggered via ViewChild in parent
    console.log('Help button clicked');
  }
}
