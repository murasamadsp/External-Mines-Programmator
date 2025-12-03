import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseDialogComponent, DialogResult } from '../base-dialog/base-dialog';

@Component({
  selector: 'app-number-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './number-dialog.html',
  styleUrls: ['../base-dialog/base-dialog.css', './number-dialog.css'],
})
export class NumberDialogComponent extends BaseDialogComponent<number> {
  title = '🔢 Enter Number';
  value = signal(0);
  min = signal(0);
  max = signal(9999);
  errorMessage = signal('');

  /**
   * Opens the number dialog with specified parameters
   */
  openWithParams(defaultValue = 0, min = 0, max = 9999): Promise<DialogResult<number> | null> {
    this.value.set(defaultValue);
    this.min.set(min);
    this.max.set(max);
    this.title = `🔢 Enter Number (${min}-${max})`;
    this.errorMessage.set('');
    return this.open();
  }

  protected validate(): boolean {
    const val = this.value();

    if (isNaN(val)) {
      this.errorMessage.set('Not a valid number!');
      return false;
    }

    if (val < this.min() || val > this.max()) {
      this.errorMessage.set(`Value must be between ${this.min()} and ${this.max()}`);
      return false;
    }

    this.errorMessage.set('');
    return true;
  }

  protected getValue(): number {
    return this.value();
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value.set(parseInt(input.value, 10));
    this.errorMessage.set(''); // Clear error on input change
  }

  override onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }
}
