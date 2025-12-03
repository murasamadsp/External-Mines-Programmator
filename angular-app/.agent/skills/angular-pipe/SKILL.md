---
name: angular-pipe
description: Generates Angular pipes for data transformation
---

# Angular Pipe Generator

This skill helps you generate Angular pipes for data transformation, formatting, and filtering following Angular best practices.

## Pure Pipe Template

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: '{{name}}',
  standalone: true,
  pure: true
})
export class {{Name}}Pipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (!value) return value;

    // Transform logic here
    return value;
  }
}
```

## Impure Pipe Template

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: '{{name}}',
  standalone: true,
  pure: false
})
export class {{Name}}Pipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (!value) return value;

    // Transform logic here (will run on every change detection)
    return value;
  }
}
```

## Common Pipe Examples

### Filter Pipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true,
  pure: false,
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchTerm: string, property?: string): any[] {
    if (!items || !searchTerm) return items;

    return items.filter((item) => {
      const value = property ? item[property] : item;
      return value.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }
}
```

### Date Format Pipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | number, format: string = 'short'): string {
    if (!value) return '';

    const date = new Date(value);

    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'long':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'time':
        return date.toLocaleTimeString();
      default:
        return date.toISOString();
    }
  }
}
```

### Truncate Pipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 20, suffix: string = '...'): string {
    if (!value) return '';

    if (value.length <= limit) return value;

    return value.substring(0, limit - suffix.length) + suffix;
  }
}
```

### Safe HTML Pipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
```

## Usage in Templates

```html
<!-- Basic usage -->
<p>{{ user.name | titlecase }}</p>

<!-- Custom pipes -->
<p>{{ items | filter:searchTerm:'name' }}</p>
<p>{{ date | dateFormat:'long' }}</p>
<p>{{ longText | truncate:50 }}</p>
<div [innerHTML]="htmlContent | safeHtml"></div>

<!-- Chaining pipes -->
<p>{{ user.email | truncate:20 | uppercase }}</p>
```

## Testing Template

```typescript
import { {{Name}}Pipe } from './{{name}}.pipe';

describe('{{Name}}Pipe', () => {
  let pipe: {{Name}}Pipe;

  beforeEach(() => {
    pipe = new {{Name}}Pipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform value correctly', () => {
    const result = pipe.transform('test input');
    expect(result).toBe('expected output');
  });

  it('should handle null/undefined values', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeUndefined();
  });
});
```

## Key Principles

- **Standalone**: Always use `standalone: true` for modern Angular
- **Pure vs Impure**: Use pure pipes for performance, impure only when necessary
- **Type Safety**: Define proper input/output types
- **Error Handling**: Handle null/undefined values gracefully
- **Performance**: Pure pipes are more performant, avoid complex logic in templates
- **Testing**: Pipes should be thoroughly tested with edge cases</contents>
