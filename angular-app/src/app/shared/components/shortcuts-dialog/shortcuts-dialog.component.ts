import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

@Component({
  selector: 'app-shortcuts-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div
        class="shortcuts-backdrop"
        (click)="close()"
        (keydown.escape)="close()"
        role="button"
        tabindex="0"
        aria-label="Close shortcuts dialog"
      >
        <div class="shortcuts-dialog" role="presentation">
          <div class="shortcuts-header">
            <h2 id="shortcuts-title" class="shortcuts-title">⌨️ Keyboard Shortcuts</h2>
            <button
              class="shortcuts-close"
              (click)="close()"
              (keydown.enter)="close()"
              (keydown.space)="close()"
              aria-label="Close"
              tabindex="0"
            >
              ×
            </button>
          </div>

          <div class="shortcuts-body">
            @for (category of categories; track category) {
              <div class="shortcuts-category">
                <h3 class="category-title">{{ category }}</h3>
                <div class="shortcuts-list">
                  @for (shortcut of getShortcutsByCategory(category); track shortcut.description) {
                    <div class="shortcut-item">
                      <span class="shortcut-description">{{ shortcut.description }}</span>
                      <div class="shortcut-keys">
                        @for (key of shortcut.keys; track $index) {
                          <kbd class="shortcut-key">{{ key }}</kbd>
                          @if ($index < shortcut.keys.length - 1) {
                            <span class="key-separator">+</span>
                          }
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <div class="shortcuts-footer">
            <p class="shortcuts-hint">Press <kbd>?</kbd> to toggle this dialog</p>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .shortcuts-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1040;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--md-sys-spacing-3);
        animation: md-fade-in var(--md-sys-transition-fast);
      }

      .shortcuts-dialog {
        max-width: 700px;
        max-height: 90vh;
        width: 100%;
        background: var(--md-sys-color-surface);
        border: 1px solid var(--md-sys-color-outline);
        border-radius: var(--md-sys-corner-lg);
        box-shadow: var(--md-sys-shadow-lg);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: md-scale-in var(--md-sys-transition);
      }

      .shortcuts-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--md-sys-spacing-3);
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
        background: var(--md-sys-color-surface);
      }

      .shortcuts-title {
        margin: 0;
        font-size: var(--md-sys-typescale-headline);
        font-weight: var(--md-sys-font-weight-medium);
        color: var(--md-sys-color-on-surface);
      }

      .shortcuts-close {
        width: 32px;
        height: 32px;
        padding: 0;
        background: transparent;
        border: none;
        color: var(--md-sys-color-on-surface-variant);
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        border-radius: var(--md-sys-corner-full);
        transition: all var(--md-sys-transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .shortcuts-close:hover {
        background: var(--md-sys-color-surface-variant);
        color: var(--md-sys-color-on-surface);
      }

      .shortcuts-body {
        padding: var(--md-sys-spacing-3);
        overflow-y: auto;
        flex: 1;
      }

      .shortcuts-category {
        margin-bottom: var(--md-sys-spacing-4);
      }

      .shortcuts-category:last-child {
        margin-bottom: 0;
      }

      .category-title {
        margin: 0 0 var(--md-sys-spacing-2) 0;
        font-size: var(--md-sys-typescale-title);
        font-weight: var(--md-sys-font-weight-medium);
        color: var(--md-sys-color-primary);
      }

      .shortcuts-list {
        display: flex;
        flex-direction: column;
        gap: var(--md-sys-spacing-1);
      }

      .shortcut-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--md-sys-spacing-1) var(--md-sys-spacing-2);
        background: var(--md-sys-color-surface-variant);
        border-radius: var(--md-sys-corner-sm);
        border: 1px solid transparent;
        transition: all var(--md-sys-transition-fast);
      }

      .shortcut-item:hover {
        background: var(--md-sys-color-surface-container);
        border-color: var(--md-sys-color-outline-variant);
      }

      .shortcut-description {
        font-size: var(--md-sys-typescale-body);
        color: var(--md-sys-color-on-surface);
      }

      .shortcut-keys {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .shortcut-key {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 24px;
        padding: 0 6px;
        background: var(--md-sys-color-surface);
        border: 1px solid var(--md-sys-color-outline);
        border-radius: var(--md-sys-corner-xs);
        font-family: 'Roboto Mono', monospace;
        font-size: var(--md-sys-typescale-caption);
        font-weight: var(--md-sys-font-weight-medium);
        color: var(--md-sys-color-on-surface);
        box-shadow: 0 1px 0 var(--md-sys-color-outline);
      }

      .key-separator {
        color: var(--md-sys-color-on-surface-variant);
        font-size: var(--md-sys-typescale-caption);
        margin: 0 2px;
      }

      .shortcuts-footer {
        padding: var(--md-sys-spacing-2);
        border-top: 1px solid var(--md-sys-color-outline-variant);
        background: var(--md-sys-color-surface);
      }

      .shortcuts-hint {
        margin: 0;
        text-align: center;
        font-size: var(--md-sys-typescale-label);
        color: var(--md-sys-color-on-surface-variant);
      }

      .shortcuts-hint kbd {
        margin: 0 4px;
        font-family: 'Roboto Mono', monospace;
        background: var(--md-sys-color-surface-variant);
        padding: 2px 6px;
        border-radius: var(--md-sys-corner-xs);
      }

      @media (max-width: 640px) {
        .shortcuts-dialog {
          max-width: none;
          max-height: none;
          height: 100%;
          border-radius: 0;
        }

        .shortcut-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }
    `,
  ],
})
export class ShortcutsDialogComponent {
  isOpen = signal(false);

  shortcuts: Shortcut[] = [
    // Navigation
    { keys: ['←', '→', '↑', '↓'], description: 'Navigate grid', category: 'Navigation' },
    { keys: ['Ctrl', 'PageUp'], description: 'Previous page', category: 'Navigation' },
    { keys: ['Ctrl', 'PageDown'], description: 'Next page', category: 'Navigation' },
    { keys: ['Home'], description: 'First cell', category: 'Navigation' },
    { keys: ['End'], description: 'Last cell', category: 'Navigation' },

    // Editing
    { keys: ['Delete'], description: 'Remove instruction', category: 'Editing' },
    { keys: ['Backspace'], description: 'Clear cell', category: 'Editing' },
    { keys: ['Ctrl', 'Z'], description: 'Undo', category: 'Editing' },
    { keys: ['Ctrl', 'Y'], description: 'Redo', category: 'Editing' },
    { keys: ['Ctrl', 'C'], description: 'Copy instruction', category: 'Editing' },
    { keys: ['Ctrl', 'V'], description: 'Paste instruction', category: 'Editing' },
    { keys: ['Ctrl', 'X'], description: 'Cut instruction', category: 'Editing' },

    // Actions
    { keys: ['Ctrl', 'S'], description: 'Export program', category: 'Actions' },
    { keys: ['Ctrl', 'O'], description: 'Import program', category: 'Actions' },
    { keys: ['Ctrl', 'N'], description: 'New program', category: 'Actions' },
    { keys: ['Ctrl', 'V'], description: 'Validate program', category: 'Actions' },

    // View
    { keys: ['F'], description: 'Toggle fullscreen', category: 'View' },
    { keys: ['?'], description: 'Show shortcuts', category: 'View' },
    { keys: ['Esc'], description: 'Close dialog', category: 'View' },
  ];

  categories = [...new Set(this.shortcuts.map((s) => s.category))];

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  getShortcutsByCategory(category: string): Shortcut[] {
    return this.shortcuts.filter((s) => s.category === category);
  }
}
