import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseDialogComponent, DialogResult } from '../base-dialog/base-dialog';

export interface TwoLabelsValue {
  label1: string;
  label2: string;
}

@Component({
  selector: 'app-two-labels-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './two-labels-dialog.html',
  styleUrls: ['../base-dialog/base-dialog.css', './two-labels-dialog.css'],
})
export class TwoLabelsDialogComponent extends BaseDialogComponent<TwoLabelsValue> {
  title = '🏷️ Enter Variable Names';
  label1 = signal('');
  label2 = signal('');
  errorMessage = signal('');

  /**
   * Opens the two labels dialog with specified default values and title
   */
  openWithParams(
    defaultLabel1 = '',
    defaultLabel2 = '',
    customTitle?: string,
  ): Promise<DialogResult<TwoLabelsValue> | null> {
    this.label1.set(defaultLabel1);
    this.label2.set(defaultLabel2);
    if (customTitle) {
      this.title = customTitle;
    }
    this.errorMessage.set('');
    return this.open();
  }

  protected validate(): boolean {
    const val1 = this.label1().trim();
    const val2 = this.label2().trim();

    if (!val1 || !val2) {
      this.errorMessage.set('Both labels are required!');
      return false;
    }

    this.errorMessage.set('');
    return true;
  }

  protected getValue(): TwoLabelsValue {
    return {
      label1: this.label1().trim(),
      label2: this.label2().trim(),
    };
  }

  onLabel1Change(event: Event) {
    const input = event.target as HTMLInputElement;
    this.label1.set(input.value);
    this.errorMessage.set('');
  }

  onLabel2Change(event: Event) {
    const input = event.target as HTMLInputElement;
    this.label2.set(input.value);
    this.errorMessage.set('');
  }

  override onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }
}
