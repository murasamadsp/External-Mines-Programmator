---
name: angular-service
description: Generates an Angular service using Signals for state management
---

# Angular Service Generator

This skill helps you generate Angular services following the project's pattern: `Injectable({providedIn: 'root'})` and Signals for state.

## Usage

When creating a new service, use this template:

```typescript
import { Injectable, signal, computed } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class {{Name}}Service {
  // State
  private stateSignal = signal<{{Type}}>(initialValue);

  // Computed
  readonly state = this.stateSignal.asReadonly();
  readonly derivedState = computed(() => this.stateSignal().someProp);

  constructor() {}

  // Actions
  updateState(newValue: {{Type}}) {
    this.stateSignal.set(newValue);
  }

  modifyState(prop: any) {
    this.stateSignal.update(state => ({ ...state, prop }));
  }
}
```

## Real Example: Settings Service

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { SettingsStorageUtil } from '../utils/storage.util';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  // State
  private settingsSignal = signal<Record<string, unknown>>(SettingsStorageUtil.getAll());

  // Computed
  readonly settings = this.settingsSignal.asReadonly();
  readonly allSettings = computed(() => this.settingsSignal());

  constructor() {}

  // Actions
  get<T = unknown>(key: string, defaultValue: T | null = null): T | null {
    const currentSettings = this.settingsSignal();
    return (currentSettings[key] as T) ?? SettingsStorageUtil.get<T>(key, defaultValue);
  }

  set(key: string, value: unknown): boolean {
    const success = SettingsStorageUtil.set(key, value);
    if (success) {
      this.settingsSignal.update((settings) => ({ ...settings, [key]: value }));
    }
    return success;
  }

  getAll(): Record<string, unknown> {
    return this.settingsSignal();
  }

  reset(): boolean {
    const success = SettingsStorageUtil.reset();
    if (success) {
      this.settingsSignal.set({});
    }
    return success;
  }
}
```

## Key Principles

- Use `signal` for private mutable state.
- Expose `asReadonly()` signals or `computed` values for public consumption.
- Use `set` or `update` methods for state modification.
- Always `providedIn: 'root'`.
- Signals provide reactive state management with automatic change detection.
