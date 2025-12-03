import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CounterState {
  value: number;
  history: number[];
  isLoading: boolean;
}

type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET_VALUE'; payload: number };

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="counter-container">
      <h2>Counter Demo</h2>

      <div class="counter-display">
        <div class="counter-value">{{ value() }}</div>
        <div class="counter-buttons">
          <button (click)="decrement()" [disabled]="!canDecrement()" class="btn">-</button>
          <button (click)="increment()" class="btn">+</button>
          <button (click)="reset()" class="btn reset">Reset</button>
        </div>
      </div>

      <div class="counter-controls">
        <input
          type="number"
          [value]="value()"
          (input)="setValue($any($event.target).value)"
          class="value-input"
        />
      </div>

      <div class="counter-history">
        <h3>History</h3>
        <div class="history-list">
          @for (entry of history(); track $index) {
            <span class="history-entry">{{ entry }}</span>
          }
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading">Processing...</div>
      }
    </div>
  `,
  styles: [
    `
      .counter-container {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
      }

      .counter-display {
        text-align: center;
        margin-bottom: 20px;
      }

      .counter-value {
        font-size: 3rem;
        font-weight: bold;
        color: #007bff;
        margin-bottom: 15px;
      }

      .counter-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1.2rem;
        font-weight: bold;
      }

      .btn:not(.reset) {
        background: #007bff;
        color: white;
      }

      .btn.reset {
        background: #dc3545;
        color: white;
      }

      .btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }

      .counter-controls {
        margin-bottom: 20px;
      }

      .value-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        text-align: center;
      }

      .counter-history h3 {
        margin-bottom: 10px;
        color: #333;
      }

      .history-list {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .history-entry {
        background: #e9ecef;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.9rem;
      }

      .loading {
        text-align: center;
        color: #007bff;
        font-style: italic;
        margin-top: 10px;
      }
    `,
  ],
})
export class CounterComponent implements OnInit {
  // Private state signal
  private readonly _state = signal<CounterState>({
    value: 0,
    history: [0],
    isLoading: false,
  });

  // Public computed signals (read-only)
  readonly state = this._state.asReadonly();
  readonly value = computed(() => this._state().value);
  readonly history = computed(() => this._state().history);
  readonly isLoading = computed(() => this._state().isLoading);

  // Derived state
  readonly canDecrement = computed(() => this.value() > 0);

  // Reducer function (pure function)
  private counterReducer(state: CounterState, action: CounterAction): CounterState {
    switch (action.type) {
      case 'INCREMENT':
        return {
          ...state,
          value: state.value + 1,
          history: [...state.history, state.value + 1],
        };
      case 'DECREMENT':
        return {
          ...state,
          value: state.value - 1,
          history: [...state.history, state.value - 1],
        };
      case 'RESET':
        return {
          ...state,
          value: 0,
          history: [...state.history, 0],
        };
      case 'SET_VALUE': {
        const newValue = isNaN(action.payload) ? 0 : action.payload;
        return {
          ...state,
          value: newValue,
          history: [...state.history, newValue],
        };
      }
      default:
        return state;
    }
  }

  // Actions
  increment(): void {
    this._state.update((state) => this.counterReducer(state, { type: 'INCREMENT' }));
  }

  decrement(): void {
    this._state.update((state) => this.counterReducer(state, { type: 'DECREMENT' }));
  }

  reset(): void {
    this._state.update((state) => this.counterReducer(state, { type: 'RESET' }));
  }

  setValue(value: string): void {
    const numValue = parseInt(value, 10);
    this._state.update((state) =>
      this.counterReducer(state, { type: 'SET_VALUE', payload: numValue }),
    );
  }

  // Async action example
  async incrementAsync(): Promise<void> {
    this._state.update((state) => ({ ...state, isLoading: true }));

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this._state.update((state) => ({
      ...this.counterReducer(state, { type: 'INCREMENT' }),
      isLoading: false,
    }));
  }

  constructor() {
    // Load persisted state on initialization
    this.loadPersistedState();
  }

  private loadPersistedState(): void {
    const stored = localStorage.getItem('counter-state');
    if (stored) {
      try {
        const state = JSON.parse(stored);
        this._state.set(state);
      } catch (error) {
        console.warn('Failed to load counter state:', error);
      }
    }
  }

  private persistState(): void {
    localStorage.setItem('counter-state', JSON.stringify(this._state()));
  }

  // Persist state whenever it changes
  ngOnInit(): void {
    // Use effect to persist state changes
    import('@angular/core').then(({ effect }) => {
      effect(() => {
        this.persistState();
      });
    });
  }
}
