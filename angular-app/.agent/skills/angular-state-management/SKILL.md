---
name: angular-state-management
description: Generates Angular state management patterns using Signals, services, and component state
---

# Angular State Management Generator

This skill helps you generate Angular state management patterns using modern Signals API, service-based state management, and component-level state patterns following Angular best practices.

## Signals-Based State Management Template

```typescript
import { Injectable, signal, computed, inject } from '@angular/core';

// State interface
export interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  loading: boolean;
  notifications: Notification[];
}

// Actions interface
export interface AppActions {
  setUser: (user: User) => void;
  clearUser: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService implements AppActions {
  // Private state signals
  private readonly _user = signal<User | null>(null);
  private readonly _theme = signal<'light' | 'dark'>('light');
  private readonly _loading = signal<boolean>(false);
  private readonly _notifications = signal<Notification[]>([]);

  // Public computed signals (read-only)
  readonly user = this._user.asReadonly();
  readonly theme = this._theme.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly notifications = this._notifications.asReadonly();

  // Derived state
  readonly isAuthenticated = computed(() => !!this._user());
  readonly hasNotifications = computed(() => this._notifications().length > 0);
  readonly unreadNotifications = computed(() =>
    this._notifications().filter(n => !n.read)
  );

  // Actions
  setUser(user: User): void {
    this._user.set(user);
    this.persistState();
  }

  clearUser(): void {
    this._user.set(null);
    this.persistState();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this._theme.set(theme);
    this.persistState();
    this.applyTheme(theme);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  addNotification(notification: Notification): void {
    this._notifications.update(notifications => [...notifications, notification]);
  }

  removeNotification(id: string): void {
    this._notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  // Persistence
  private persistState(): void {
    const state = {
      user: this._user(),
      theme: this._theme(),
    };
    localStorage.setItem('app-state', JSON.stringify(state));
  }

  private loadPersistedState(): void {
    const stored = localStorage.getItem('app-state');
    if (stored) {
      try {
        const state = JSON.parse(stored);
        if (state.user) this._user.set(state.user);
        if (state.theme) this._theme.set(state.theme);
      } catch (error) {
        console.warn('Failed to load persisted state:', error);
      }
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  constructor() {
    this.loadPersistedState();
    this.applyTheme(this._theme());
  }
}
```

## Component-Level State Management Template

```typescript
import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoFilters {
  showCompleted: boolean;
  searchText: string;
  sortBy: 'created' | 'text' | 'completed';
}

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="todo-container">
      <!-- Add Todo Form -->
      <form [formGroup]="addForm" (ngSubmit)="addTodo()" class="add-form">
        <input
          type="text"
          formControlName="text"
          placeholder="Add new todo..."
          class="todo-input"
        />
        <button type="submit" [disabled]="addForm.invalid" class="add-btn">
          Add
        </button>
      </form>

      <!-- Filters -->
      <div class="filters">
        <input
          type="text"
          [value]="filters().searchText"
          (input)="updateSearchText($any($event.target).value)"
          placeholder="Search todos..."
          class="search-input"
        />
        <label>
          <input
            type="checkbox"
            [checked]="filters().showCompleted"
            (change)="toggleShowCompleted()"
          />
          Show completed
        </label>
        <select [value]="filters().sortBy" (change)="updateSortBy($any($event.target).value)">
          <option value="created">Created</option>
          <option value="text">Text</option>
          <option value="completed">Status</option>
        </select>
      </div>

      <!-- Todo List -->
      <div class="todo-list">
        @for (todo of filteredTodos(); track todo.id) {
          <div class="todo-item" [class.completed]="todo.completed">
            <input
              type="checkbox"
              [checked]="todo.completed"
              (change)="toggleTodo(todo.id)"
              class="todo-checkbox"
            />
            <span class="todo-text">{{ todo.text }}</span>
            <button (click)="deleteTodo(todo.id)" class="delete-btn">×</button>
          </div>
        }
      </div>

      <!-- Stats -->
      <div class="stats">
        Total: {{ todos().length }} |
        Completed: {{ completedCount() }} |
        Remaining: {{ remainingCount() }}
      </div>
    </div>
  `,
  styles: [`
    .todo-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .add-form {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .todo-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .add-btn {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      align-items: center;
    }

    .search-input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .todo-list {
      margin-bottom: 20px;
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 5px;
    }

    .todo-item.completed .todo-text {
      text-decoration: line-through;
      color: #888;
    }

    .todo-text {
      flex: 1;
    }

    .delete-btn {
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .stats {
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  `]
})
export class TodoListComponent {
  private readonly fb = inject(FormBuilder);

  // State signals
  private readonly _todos = signal<Todo[]>([]);
  private readonly _filters = signal<TodoFilters>({
    showCompleted: false,
    searchText: '',
    sortBy: 'created'
  });

  // Public computed signals
  readonly todos = this._todos.asReadonly();
  readonly filters = this._filters.asReadonly();

  // Form
  readonly addForm = this.fb.group({
    text: ['', [Validators.required, Validators.minLength(1)]]
  });

  // Computed state
  readonly filteredTodos = computed(() => {
    let todos = this._todos();

    // Filter by completion status
    if (!this._filters().showCompleted) {
      todos = todos.filter(todo => !todo.completed);
    }

    // Filter by search text
    if (this._filters().searchText) {
      const searchText = this._filters().searchText.toLowerCase();
      todos = todos.filter(todo =>
        todo.text.toLowerCase().includes(searchText)
      );
    }

    // Sort
    todos = [...todos].sort((a, b) => {
      switch (this._filters().sortBy) {
        case 'text':
          return a.text.localeCompare(b.text);
        case 'completed':
          return Number(a.completed) - Number(b.completed);
        case 'created':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return todos;
  });

  readonly completedCount = computed(() =>
    this._todos().filter(todo => todo.completed).length
  );

  readonly remainingCount = computed(() =>
    this._todos().filter(todo => !todo.completed).length
  );

  // Effects for side effects
  constructor() {
    // Load todos from localStorage on init
    effect(() => {
      const stored = localStorage.getItem('todos');
      if (stored) {
        try {
          const todos = JSON.parse(stored).map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt)
          }));
          this._todos.set(todos);
        } catch (error) {
          console.warn('Failed to load todos:', error);
        }
      }
    });

    // Save todos to localStorage when they change
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this._todos()));
    });
  }

  // Actions
  addTodo(): void {
    if (this.addForm.valid) {
      const text = this.addForm.value.text?.trim();
      if (text) {
        const newTodo: Todo = {
          id: crypto.randomUUID(),
          text,
          completed: false,
          createdAt: new Date()
        };

        this._todos.update(todos => [...todos, newTodo]);
        this.addForm.reset();
      }
    }
  }

  toggleTodo(id: string): void {
    this._todos.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  deleteTodo(id: string): void {
    this._todos.update(todos => todos.filter(todo => todo.id !== id));
  }

  updateSearchText(text: string): void {
    this._filters.update(filters => ({ ...filters, searchText: text }));
  }

  toggleShowCompleted(): void {
    this._filters.update(filters => ({
      ...filters,
      showCompleted: !filters.showCompleted
    }));
  }

  updateSortBy(sortBy: 'created' | 'text' | 'completed'): void {
    this._filters.update(filters => ({ ...filters, sortBy }));
  }
}
```

## Advanced State Management with NgRx-like Patterns

```typescript
import { Injectable, signal, computed, inject } from '@angular/core';

// Action types
export type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET_VALUE'; payload: number };

// State interface
export interface CounterState {
  value: number;
  history: number[];
  isLoading: boolean;
}

// Reducer function
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        value: state.value + 1,
        history: [...state.history, state.value + 1]
      };
    case 'DECREMENT':
      return {
        ...state,
        value: state.value - 1,
        history: [...state.history, state.value - 1]
      };
    case 'RESET':
      return {
        ...state,
        value: 0,
        history: [...state.history, 0]
      };
    case 'SET_VALUE':
      return {
        ...state,
        value: action.payload,
        history: [...state.history, action.payload]
      };
    default:
      return state;
  }
}

@Injectable({
  providedIn: 'root'
})
export class CounterStore {
  private readonly _state = signal<CounterState>({
    value: 0,
    history: [0],
    isLoading: false
  });

  // Public selectors
  readonly state = this._state.asReadonly();
  readonly value = computed(() => this._state().value);
  readonly history = computed(() => this._state().history);
  readonly isLoading = computed(() => this._state().isLoading);

  // Actions
  increment(): void {
    this._state.update(state => counterReducer(state, { type: 'INCREMENT' }));
  }

  decrement(): void {
    this._state.update(state => counterReducer(state, { type: 'DECREMENT' }));
  }

  reset(): void {
    this._state.update(state => counterReducer(state, { type: 'RESET' }));
  }

  setValue(value: number): void {
    this._state.update(state => counterReducer(state, { type: 'SET_VALUE', payload: value }));
  }

  setLoading(loading: boolean): void {
    this._state.update(state => ({ ...state, isLoading: loading }));
  }

  // Selectors
  selectValue(): number {
    return this.value();
  }

  selectHistory(): number[] {
    return this.history();
  }

  selectCanDecrement(): boolean {
    return this.value() > 0;
  }
}
```

## Async State Management Template

```typescript
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AsyncStateService {
  private readonly http = inject(HttpClient);

  // Generic async state factory
  createAsyncState<T>(initialData: T | null = null): {
    state: ReturnType<typeof signal<AsyncState<T>>>;
    data: ReturnType<typeof computed>;
    loading: ReturnType<typeof computed>;
    error: ReturnType<typeof computed>;
    setData: (data: T) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string) => void;
    reset: () => void;
  } {
    const state = signal<AsyncState<T>>({
      data: initialData,
      loading: false,
      error: null
    });

    return {
      state,
      data: computed(() => state().data),
      loading: computed(() => state().loading),
      error: computed(() => state().error),
      setData: (data: T) => state.update(s => ({ ...s, data, loading: false, error: null })),
      setLoading: (loading: boolean) => state.update(s => ({ ...s, loading })),
      setError: (error: string) => state.update(s => ({ ...s, error, loading: false })),
      reset: () => state.set({ data: initialData, loading: false, error: null })
    };
  }

  // HTTP request wrapper with state management
  async httpRequest<T>(
    request: Observable<T>,
    stateManager: ReturnType<typeof this.createAsyncState<T>>
  ): Promise<T> {
    stateManager.setLoading(true);
    stateManager.setError(null);

    try {
      const result = await request.toPromise();
      if (result !== undefined) {
        stateManager.setData(result);
        return result;
      } else {
        throw new Error('Request returned undefined');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      stateManager.setError(errorMessage);
      throw error;
    } finally {
      stateManager.setLoading(false);
    }
  }
}

// Usage example
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly asyncState = inject(AsyncStateService);

  // User data state
  private readonly userState = this.asyncState.createAsyncState<User | null>(null);

  readonly user = this.userState.data;
  readonly loading = this.userState.loading;
  readonly error = this.userState.error;

  async loadUser(userId: string): Promise<User> {
    const request = this.http.get<User>(`/api/users/${userId}`);
    return this.asyncState.httpRequest(request, this.userState);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const request = this.http.patch<User>(`/api/users/${userId}`, updates);
    return this.asyncState.httpRequest(request, this.userState);
  }

  resetUser(): void {
    this.userState.reset();
  }
}
```

## Component State with Effects

```typescript
import { Component, signal, computed, effect, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="search-container">
      <input
        type="text"
        [formControl]="searchControl"
        placeholder="Search..."
        class="search-input"
      />

      @if (loading()) {
        <div class="loading">Searching...</div>
      }

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      @if (results().length > 0) {
        <div class="results">
          @for (result of results(); track result.id) {
            <div class="result-item">{{ result.name }}</div>
          }
        </div>
      }

      @if (!loading() && !error() && searchTerm() && results().length === 0) {
        <div class="no-results">No results found</div>
      }
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 400px;
      margin: 0 auto;
    }

    .search-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .loading, .error {
      padding: 10px;
      margin-top: 10px;
    }

    .loading {
      color: #007bff;
    }

    .error {
      color: #dc3545;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }

    .results {
      margin-top: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .result-item {
      padding: 10px;
      border-bottom: 1px solid #eee;
    }

    .result-item:last-child {
      border-bottom: none;
    }

    .no-results {
      padding: 20px;
      text-align: center;
      color: #666;
    }
  `]
})
export class SearchComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  // State signals
  private readonly _searchTerm = signal('');
  private readonly _results = signal<SearchResult[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public computed signals
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly results = this._results.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Form control
  readonly searchControl = this.fb.control('');

  // Effects and subscriptions
  private searchSubscription?: Subscription;

  constructor() {
    // Effect for search term changes
    effect(() => {
      const term = this._searchTerm();
      if (term.length > 2) {
        this.performSearch(term);
      } else {
        this._results.set([]);
        this._error.set(null);
      }
    });

    // Subscribe to form control changes with debouncing
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this._searchTerm.set(value || '');
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  private async performSearch(term: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock search results
      const mockResults: SearchResult[] = [
        { id: '1', name: `${term} Result 1` },
        { id: '2', name: `${term} Result 2` },
        { id: '3', name: `${term} Result 3` },
      ];

      this._results.set(mockResults);
    } catch (err) {
      this._error.set('Search failed. Please try again.');
      this._results.set([]);
    } finally {
      this._loading.set(false);
    }
  }
}

interface SearchResult {
  id: string;
  name: string;
}
```

## Key Principles

- **Signals First**: Use Angular Signals for reactive state management
- **Immutability**: Treat state as immutable, use update methods
- **Single Source of Truth**: Keep state in one place per domain
- **Computed Values**: Use computed signals for derived state
- **Effects for Side Effects**: Use effects for external interactions
- **Type Safety**: Define interfaces for all state shapes
- **Persistence**: Implement state persistence for important data
- **Error Handling**: Always handle loading and error states
- **Performance**: Use signals efficiently to avoid unnecessary re-renders

## Integration with Universal Skills

This state management skill integrates with other Universal Skills:

- **angular-service**: State services with dependency injection
- **angular-component**: Components that consume state
- **angular-form**: Form state management integration
- **angular-interceptor**: HTTP state integration
- **angular-testing**: Testing state management logic

Signals-based state management provides modern, reactive, and performant state handling for Angular applications! 🚀⚡