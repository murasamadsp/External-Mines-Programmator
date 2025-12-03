import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseDialogComponent, DialogResult } from '../base-dialog/base-dialog';

export interface CoordinatesValue {
  x: number;
  y: number;
}

@Component({
  selector: 'app-coordinates-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coordinates-dialog.html',
  styleUrls: ['../base-dialog/base-dialog.css', './coordinates-dialog.css'],
})
export class CoordinatesDialogComponent extends BaseDialogComponent<CoordinatesValue> {
  title = '📍 Enter Coordinates';
  x = signal(0);
  y = signal(0);
  errorMessage = signal('');

  /**
   * Opens the coordinates dialog with specified default values
   */
  openWithParams(defaultX = 0, defaultY = 0): Promise<DialogResult<CoordinatesValue> | null> {
    this.x.set(defaultX);
    this.y.set(defaultY);
    this.errorMessage.set('');
    return this.open();
  }

  protected validate(): boolean {
    const xVal = this.x();
    const yVal = this.y();

    if (isNaN(xVal) || isNaN(yVal)) {
      this.errorMessage.set('Both X and Y must be valid numbers!');
      return false;
    }

    if (xVal < 0 || xVal > 15 || yVal < 0 || yVal > 15) {
      this.errorMessage.set('Coordinates must be between 0 and 15');
      return false;
    }

    this.errorMessage.set('');
    return true;
  }

  protected getValue(): CoordinatesValue {
    return { x: this.x(), y: this.y() };
  }

  onXChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.x.set(parseInt(input.value, 10));
    this.errorMessage.set('');
  }

  onYChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.y.set(parseInt(input.value, 10));
    this.errorMessage.set('');
  }

  override onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }
}
