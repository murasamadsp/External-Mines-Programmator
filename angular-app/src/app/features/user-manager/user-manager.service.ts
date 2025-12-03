import { Injectable, signal, computed } from '@angular/core';

export interface UserItem {
  id: number;
  name: string;
  description?: string;
  createdAt?: Date;
}

export interface UserManagerState {
  items: UserItem[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagerService {
  // Private state signals
  private readonly _items = signal<UserItem[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public computed signals (read-only)
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Derived state
  readonly hasItems = computed(() => this._items().length > 0);
  readonly itemCount = computed(() => this._items().length);

  constructor() {
    // Initialize with default data or load from storage
    this.loadInitialData();
  }

  // Actions
  async loadItems(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockItems: UserItem[] = [
        { id: 1, name: 'Item 1', description: 'First item', createdAt: new Date() },
        { id: 2, name: 'Item 2', description: 'Second item', createdAt: new Date() },
        { id: 3, name: 'Item 3', description: 'Third item', createdAt: new Date() },
      ];

      this._items.set(mockItems);
    } catch (error) {
      this._error.set('Failed to load items');
      console.error('Error loading items:', error);
    } finally {
      this._loading.set(false);
    }
  }

  addItem(item: Omit<UserItem, 'id' | 'createdAt'>): void {
    const newItem: UserItem = {
      ...item,
      id: Date.now(),
      createdAt: new Date(),
    };
    this._items.update((items) => [...items, newItem]);
  }

  removeItem(id: number): void {
    this._items.update((items) => items.filter((item) => item.id !== id));
  }

  updateItem(id: number, updates: Partial<Omit<UserItem, 'id' | 'createdAt'>>): void {
    this._items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  clearItems(): void {
    this._items.set([]);
  }

  private async loadInitialData(): Promise<void> {
    // Load data from localStorage or API
    const stored = localStorage.getItem('userManagerItems');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        this._items.set(items);
      } catch (error) {
        console.warn('Failed to load stored userManager data:', error);
      }
    } else {
      // Load initial data
      await this.loadItems();
    }
  }
}
