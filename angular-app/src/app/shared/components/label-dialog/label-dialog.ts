import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseDialogComponent, DialogResult } from '../base-dialog/base-dialog';

@Component({
  selector: 'app-label-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './label-dialog.html',
  styleUrls: ['../base-dialog/base-dialog.css', './label-dialog.css'],
})
export class LabelDialogComponent extends BaseDialogComponent<string> {
  title = '🏷️ Enter Label';
  value = signal('');
  errorMessage = signal('');

  /**
   * Opens the label dialog with specified default value
   */
  openWithParams(defaultValue = ''): Promise<DialogResult<string> | null> {
    this.value.set(defaultValue);
    this.errorMessage.set('');
    return this.open();
  }

  protected validate(): boolean {
    const val = this.value().trim();

    if (!val) {
      this.errorMessage.set('Label cannot be empty!');
      return false;
    }

    this.errorMessage.set('');
    return true;
  }

  protected getValue(): string {
    return this.value().trim();
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this.errorMessage.set(''); // Clear error on input change
  }

  override onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }
}
