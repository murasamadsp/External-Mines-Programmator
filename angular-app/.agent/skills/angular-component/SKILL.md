---
name: angular-component
description: Generates Angular components with best practices and patterns
---

# Angular Component Generator

This skill helps you generate Angular components following modern best practices: standalone components, OnPush change detection, and proper separation of concerns.

## Basic Component Template

```typescript
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-{{name}}',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './{{name}}.component.html',
  styleUrls: ['./{{name}}.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class {{Name}}Component {
  // State
  readonly title = signal('{{Name}} Component');

  // Actions
  updateTitle(newTitle: string): void {
    this.title.set(newTitle);
  }
}
```

## Component with Input/Output

```typescript
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-{{name}}',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './{{name}}.component.html',
  styleUrls: ['./{{name}}.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class {{Name}}Component {
  // Inputs
  readonly data = input.required<{{Type}}>();
  readonly disabled = input(false);

  // Outputs
  readonly selected = output<{{Type}}>();

  // Actions
  onSelect(): void {
    this.selected.emit(this.data());
  }
}
```

## Component with Service Injection

```typescript
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { {{Name}}Service } from './{{name}}.service';

@Component({
  selector: 'app-{{name}}',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './{{name}}.component.html',
  styleUrls: ['./{{name}}.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class {{Name}}Component {
  private readonly {{name}}Service = inject({{Name}}Service);

  // State
  readonly items = signal<{{Type}}[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    // this.{{name}}Service.getData().subscribe({
    //   next: (data) => this.items.set(data),
    //   complete: () => this.loading.set(false)
    // });
  }
}
```

## Template File ({{name}}.component.html)

```html
<div class="component-container">
  <h2>{{ title() }}</h2>

  <div class="content">
    <!-- Component content here -->
    <p>{{ description }}</p>
  </div>

  <div class="actions">
    <button type="button" (click)="onAction()" [disabled]="disabled()">Action Button</button>
  </div>
</div>
```

## Styles File ({{name}}.component.css)

```css
.component-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.content {
  flex: 1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background: #f5f5f5;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

## Testing Template

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { {{Name}}Component } from './{{name}}.component';

describe('{{Name}}Component', () => {
  let component: {{Name}}Component;
  let fixture: ComponentFixture<{{Name}}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [{{Name}}Component]
    }).compileComponents();

    fixture = TestBed.createComponent({{Name}}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update title', () => {
    component.updateTitle('New Title');
    expect(component.title()).toBe('New Title');
  });
});
```

## Usage Examples

```html
<!-- Basic usage -->
<app-{{name}}></app-{{name}}>

<!-- With inputs -->
<app-{{name}} [data]="myData" [disabled]="isDisabled" (selected)="onItemSelected($event)">
</app-{{name}}>
```

## Key Principles

- **Standalone**: Always use `standalone: true` for modern Angular
- **OnPush**: Always use `ChangeDetectionStrategy.OnPush` for performance
- **Signals**: Use signals for reactive state management
- **Inject Function**: Use `inject()` for dependency injection in constructors
- **Input/Output**: Use new `input()` and `output()` functions for Angular 17+
- **Type Safety**: Define proper TypeScript types
- **Separation**: Keep template, styles, and logic separate
- **Testing**: Components should be thoroughly tested
