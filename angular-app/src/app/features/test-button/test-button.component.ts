import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-button-container">
      <h2>TestButton Component</h2>
      <p>This is a TestButton component with OnPush change detection.</p>

      <div class="counter">
        <button (click)="decrement()" [disabled]="count() <= 0">-</button>
        <span class="count">{{ count() }}</span>
        <button (click)="increment()">+</button>
      </div>

      <div class="actions">
        <button (click)="reset()">Reset</button>
        <button (click)="toggleVisibility()">{{ isVisible() ? 'Hide' : 'Show' }} Extra</button>
      </div>

      @if (isVisible()) {
        <div class="extra-content">
          <p>This is additional content that can be toggled.</p>
          <p>Component uses Angular Signals for reactive state management.</p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .test-button-container {
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
      }

      .test-button-container h2 {
        color: #333;
        margin-bottom: 16px;
      }

      .counter {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin: 20px 0;
      }

      .count {
        font-size: 2rem;
        font-weight: bold;
        min-width: 60px;
        text-align: center;
        color: #007bff;
      }

      button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s;
      }

      button:not(:disabled) {
        background: #007bff;
        color: white;
      }

      button:not(:disabled):hover {
        background: #0056b3;
      }

      button:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }

      .actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-bottom: 20px;
      }

      .extra-content {
        background: white;
        padding: 16px;
        border-radius: 4px;
        border: 1px solid #eee;
      }

      .extra-content p {
        margin: 8px 0;
        color: #666;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestButtonComponent {
  // Reactive state using Signals
  readonly count = signal(0);
  readonly isVisible = signal(false);

  increment(): void {
    this.count.update((value) => value + 1);
  }

  decrement(): void {
    this.count.update((value) => Math.max(0, value - 1));
  }

  reset(): void {
    this.count.set(0);
  }

  toggleVisibility(): void {
    this.isVisible.update((visible) => !visible);
  }
}
