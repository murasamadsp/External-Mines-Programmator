#!/usr/bin/env node

/**
 * Universal Skills Component Generator
 * Generates Angular components using skill templates
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface SkillTemplate {
  template: (kebabCase: string, pascalCase: string, camelCase: string) => string;
  fileName: (kebabCase: string) => string;
}

// Get command line arguments
const args: string[] = process.argv.slice(2);
const [skillName, componentName]: [string | undefined, string | undefined] = [args[0], args[1]];

if (!skillName || !componentName) {
  console.log(`
Universal Skills Component Generator

Usage: node generate-component.ts <skill-name> <component-name>

Available skills:
- angular-component: Basic component with OnPush strategy
- angular-service: Service with Signals state management
- angular-directive: Custom directive template

Examples:
  node generate-component.ts angular-component my-button
  node generate-component.ts angular-service user-data
  node generate-component.ts angular-directive highlight
`);
  process.exit(1);
}

// Convert component name to proper formats
const pascalCase: string = componentName
  .split('-')
  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

const camelCase: string = componentName
  .split('-')
  .map((word: string, index: number) =>
    index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
  )
  .join('');

const kebabCase: string = componentName;

// Skill templates
const templates: Record<string, SkillTemplate> = {
  'angular-component': {
    template: (kebabCase: string, pascalCase: string, camelCase: string): string => {
      return `import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-${kebabCase}',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="${kebabCase}-container">
      <h2>${pascalCase} Component</h2>
      <p>This is a ${pascalCase} component with OnPush change detection.</p>

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
  \`,
  styles: [\`
    .${kebabCase}-container {
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .${kebabCase}-container h2 {
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
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ${pascalCase}Component {
  // Reactive state using Signals
  readonly count = signal(0);
  readonly isVisible = signal(false);

  increment(): void {
    this.count.update(value => value + 1);
  }

  decrement(): void {
    this.count.update(value => Math.max(0, value - 1));
  }

  reset(): void {
    this.count.set(0);
  }

  toggleVisibility(): void {
    this.isVisible.update(visible => !visible);
  }
}`;
    },
    fileName: (kebabCase: string): string => `${kebabCase}.component.ts`,
  },

  'angular-service': {
    template: (kebabCase: string, pascalCase: string, camelCase: string): string => {
      return `import { Injectable, signal, computed } from '@angular/core';

export interface ${pascalCase}State {
  items: any[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ${pascalCase}Service {
  // Private state signals
  private readonly _items = signal<any[]>([]);
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
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockItems = [
        { id: 1, name: 'Item 1', description: 'First item' },
        { id: 2, name: 'Item 2', description: 'Second item' },
        { id: 3, name: 'Item 3', description: 'Third item' },
      ];

      this._items.set(mockItems);
    } catch (error) {
      this._error.set('Failed to load items');
      console.error('Error loading items:', error);
    } finally {
      this._loading.set(false);
    }
  }

  addItem(item: any): void {
    this._items.update(items => [...items, { ...item, id: Date.now() }]);
  }

  removeItem(id: number): void {
    this._items.update(items => items.filter(item => item.id !== id));
  }

  updateItem(id: number, updates: Partial<any>): void {
    this._items.update(items =>
      items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }

  clearItems(): void {
    this._items.set([]);
  }

  private async loadInitialData(): Promise<void> {
    // Load data from localStorage or API
    const stored = localStorage.getItem('${camelCase}Items');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        this._items.set(items);
      } catch (error) {
        console.warn('Failed to load stored ${camelCase} data:', error);
      }
    } else {
      // Load initial data
      await this.loadItems();
    }
  }
}`;
    },
    fileName: (kebabCase: string): string => `${kebabCase}.service.ts`,
  },

  'angular-directive': {
    template: (kebabCase: string, pascalCase: string, camelCase: string): string => {
      return `import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[app${pascalCase}]',
  standalone: true,
})
export class ${pascalCase}Directive implements OnInit {
  @Input() app${pascalCase} = '';

  private readonly el = inject(ElementRef);

  ngOnInit(): void {
    this.applyDirective();
  }

  private applyDirective(): void {
    const element = this.el.nativeElement as HTMLElement;

    // Add visual styling
    element.style.border = '2px solid #007bff';
    element.style.borderRadius = '4px';
    element.style.padding = '8px';
    element.style.backgroundColor = '#f8f9fa';

    // Add data attribute for identification
    element.setAttribute('data-${kebabCase}', this.app${pascalCase} || 'active');

    // Add hover effect
    element.addEventListener('mouseenter', () => {
      element.style.backgroundColor = '#e9ecef';
      element.style.transform = 'scale(1.02)';
      element.style.transition = 'all 0.2s ease';
    });

    element.addEventListener('mouseleave', () => {
      element.style.backgroundColor = '#f8f9fa';
      element.style.transform = 'scale(1)';
    });

    console.log('${pascalCase} directive applied to element');
  }
}`;
    },
    fileName: (kebabCase: string): string => `${kebabCase}.directive.ts`,
  },
};

// Check if skill exists
if (!templates[skillName]) {
  console.error('❌ Error: Skill "' + skillName + '" not found.');
  console.log('\nAvailable skills:');
  Object.keys(templates).forEach((skill: string) => {
    console.log('  - ' + skill);
  });
  process.exit(1);
}

// Get template
const template: SkillTemplate = templates[skillName];

// Process template
const processedTemplate: string = template.template(kebabCase, pascalCase, camelCase);

// Get filename
const fileName: string = template.fileName(kebabCase);

// Create directory structure
const componentDir: string = path.join(process.cwd(), 'src', 'app', 'features', kebabCase);
const filePath: string = path.join(componentDir, fileName);

try {
  // Create directory
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
    console.log('📁 Created directory: ' + componentDir);
  }

  // Write file
  fs.writeFileSync(filePath, processedTemplate, 'utf8');
  console.log('✅ Generated ' + skillName + ': ' + filePath);

  // Try to format the file with prettier if available
  try {
    execSync('npx prettier --write "' + filePath + '"', { stdio: 'pipe' });
    console.log('🎨 Formatted file with Prettier');
  } catch (error: any) {
    // Prettier not available or failed, continue
  }

  console.log('\n🎉 Component generated successfully!');
  console.log('📍 Location: ' + filePath);
  console.log('🔧 Skill used: ' + skillName);

  // Provide usage instructions
  if (skillName === 'angular-component') {
    console.log('\n📖 Usage:');
    console.log('  1. Import the component in your module or another component');
    console.log('  2. Add <app-' + kebabCase + '></app-' + kebabCase + '> to your template');
  } else if (skillName === 'angular-service') {
    console.log('\n📖 Usage:');
    console.log(
      '  1. Inject the service in your component: private ' +
        camelCase +
        'Service = inject(' +
        pascalCase +
        'Service)',
    );
    console.log('  2. Use reactive signals: this.' + camelCase + 'Service.items()');
  } else if (skillName === 'angular-directive') {
    console.log('\n📖 Usage:');
    console.log('  1. Add the directive to any element: <div app' + pascalCase + '>...</div>');
    console.log(
      '  2. Optionally pass data: <div [app' + pascalCase + ']="' + "'value'" + '">...</div>',
    );
  }
} catch (error: any) {
  console.error('❌ Error generating component:', error.message);
  process.exit(1);
}
