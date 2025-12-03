import { Component, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DialogResult<T = unknown> {
  confirmed: boolean;
  value?: T;
}

/**
 * Base dialog component providing common dialog functionality
 * All dialog components should extend this class
 */
@Component({
  selector: 'app-base-dialog',
  standalone: true,
  imports: [CommonModule],
  template: '',
  styles: [],
})
export abstract class BaseDialogComponent<T = unknown> implements OnDestroy {
  visible = signal(false);
  protected resolveCallback: ((result: DialogResult<T> | null) => void) | null = null;

  abstract title: string;

  constructor() {
    // Handle ESC key to close dialog
    effect(() => {
      if (this.visible()) {
        this.setupKeyboardHandlers();
      } else {
        this.cleanupKeyboardHandlers();
      }
    });
  }

  private keydownHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(null);
    }
  };

  private setupKeyboardHandlers() {
    document.addEventListener('keydown', this.keydownHandler);
  }

  private cleanupKeyboardHandlers() {
    document.removeEventListener('keydown', this.keydownHandler);
  }

  /**
   * Opens the dialog and returns a promise that resolves with the dialog result
   */
  open(): Promise<DialogResult<T> | null> {
    this.visible.set(true);
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  /**
   * Closes the dialog with the given result
   */
  close(result: DialogResult<T> | null) {
    this.visible.set(false);
    if (this.resolveCallback) {
      this.resolveCallback(result);
      this.resolveCallback = null;
    }
    this.cleanup();
  }

  /**
   * Closes dialog on overlay click
   */
  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close(null);
    }
  }

  /**
   * Handles keyboard events for dialog overlay
   */
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(null);
    }
  }

  /**
   * Cancels the dialog (closes with null result)
   */
  cancel() {
    this.close(null);
  }

  /**
   * Override this method to perform custom cleanup
   */
  protected cleanup() {
    // Override in subclasses if needed
  }

  /**
   * Override this method to perform validation before submission
   */
  protected abstract validate(): boolean;

  /**
   * Override this method to get the dialog result value
   */
  protected abstract getValue(): T;

  /**
   * Submits the dialog (validates and closes with result)
   */
  submit() {
    if (this.validate()) {
      const value = this.getValue();
      this.close({ confirmed: true, value });
    }
  }

  ngOnDestroy() {
    this.cleanupKeyboardHandlers();
  }
}
