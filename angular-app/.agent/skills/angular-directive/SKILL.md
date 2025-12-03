---
name: angular-directive
description: Generates Angular directives for DOM manipulation and behavior enhancement
---

# Angular Directive Generator

This skill helps you generate Angular directives for DOM manipulation, behavior enhancement, and reusable functionality following Angular best practices.

## Attribute Directive Template

```typescript
import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[app{{Name}}]',
  standalone: true,
})
export class {{Name}}Directive implements OnInit, OnDestroy {
  @Input('app{{Name}}') config: any;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // Initialize directive logic
    this.applyDirective();
  }

  ngOnDestroy(): void {
    // Clean up resources
  }

  private applyDirective(): void {
    // Apply directive behavior
    const element = this.el.nativeElement;
    // Manipulate DOM or add behavior
  }
}
```

## Structural Directive Template

```typescript
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[app{{Name}}]',
  standalone: true,
})
export class {{Name}}Directive {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set app{{Name}}(condition: any) {
    if (condition && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!condition && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
```

## Common Directive Examples

### Focus Directive

```typescript
import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements OnInit {
  @Input() appAutofocus: boolean = true;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (this.appAutofocus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      });
    }
  }
}
```

### Click Outside Directive

```typescript
import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() appClickOutside = new EventEmitter<void>();

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.appClickOutside.emit();
    }
  }
}
```

### Debounce Click Directive

```typescript
import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appDebounceClick]',
  standalone: true,
})
export class DebounceClickDirective {
  @Input() debounceTime = 300;
  @Output() appDebounceClick = new EventEmitter();

  private timeout: any;

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.appDebounceClick.emit(event);
    }, this.debounceTime);
  }
}
```

### Lazy Load Images Directive

```typescript
import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements OnInit {
  @Input('appLazyLoad') src: string;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit(): void {
    const img = this.el.nativeElement;

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = this.src;
          observer.unobserve(img);
        }
      });
    });

    observer.observe(img);
  }
}
```

## Usage in Templates

```html
<!-- Attribute directive -->
<div [appHighlight]="color">Highlighted text</div>

<!-- Structural directive -->
<div *appUnless="condition">Content shown when condition is false</div>

<!-- Click outside -->
<div appClickOutside (appClickOutside)="closeDropdown()">...</div>

<!-- Debounce click -->
<button appDebounceClick (appDebounceClick)="handleClick()">Click me</button>

<!-- Lazy load image -->
<img appLazyLoad="image-url.jpg" alt="Lazy loaded image" />
```

## Testing Template

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { {{Name}}Directive } from './{{name}}.directive';

describe('{{Name}}Directive', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent, {{Name}}Directive],
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = fixture.debugElement.query(By.directive({{Name}}Directive));
    expect(directive).toBeTruthy();
  });

  it('should apply directive behavior', () => {
    // Test directive functionality
  });
});

// Test component
@Component({
  template: `<div app{{Name}}>Test</div>`,
  standalone: true,
})
class TestComponent {}
```

## Key Principles

- **Standalone**: Always use `standalone: true` for modern Angular
- **Host Listeners**: Use `@HostListener` for DOM events
- **ElementRef**: Access native DOM elements when necessary
- **Renderer2**: Prefer Renderer2 over direct DOM manipulation for SSR compatibility
- **Performance**: Be mindful of directive performance impact
- **Single Responsibility**: Each directive should have one clear purpose
- **Testing**: Directives should be thoroughly tested with DOM interactions</contents>
  </xai:function_call name="Shell">
  <parameter name="command">mkdir -p /Users/murasama/Projects/External-Mines-Programmator/angular-app/.agent/skills/angular-resolver
