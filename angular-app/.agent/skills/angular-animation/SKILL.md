---
name: angular-animation
description: Generates Angular animations for smooth UI transitions and interactions
---

# Angular Animation Generator

This skill helps you generate Angular animations for smooth UI transitions, state changes, and interactive feedback following Angular animation best practices.

## Basic Animation Template

```typescript
import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-animated-component',
  template: `
    <div [@fadeInOut]="isVisible ? 'visible' : 'hidden'">Content that fades in and out</div>
  `,
  animations: [
    trigger('fadeInOut', [
      state(
        'visible',
        style({
          opacity: 1,
          transform: 'translateY(0)',
        }),
      ),
      state(
        'hidden',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
        }),
      ),
      transition('visible <=> hidden', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class AnimatedComponent {
  isVisible = true;
}
```

## Common Animation Patterns

### Fade In/Out Animation

```typescript
import { trigger, state, style, transition, animate } from '@angular/animations';

export const fadeInOutAnimation = trigger('fadeInOut', [
  state(
    'in',
    style({
      opacity: 1,
      transform: 'translateY(0)',
    }),
  ),
  state(
    'out',
    style({
      opacity: 0,
      transform: 'translateY(-10px)',
    }),
  ),
  transition('in <=> out', [animate('200ms ease-in-out')]),
]);
```

### Slide Animation

```typescript
import { trigger, state, style, transition, animate } from '@angular/animations';

export const slideInOutAnimation = trigger('slideInOut', [
  state(
    'in',
    style({
      transform: 'translateX(0)',
      opacity: 1,
    }),
  ),
  state(
    'out',
    style({
      transform: 'translateX(-100%)',
      opacity: 0,
    }),
  ),
  transition('in <=> out', [animate('300ms ease-in-out')]),
]);
```

### Scale Animation

```typescript
import { trigger, state, style, transition, animate } from '@angular/animations';

export const scaleInOutAnimation = trigger('scaleInOut', [
  state(
    'in',
    style({
      transform: 'scale(1)',
      opacity: 1,
    }),
  ),
  state(
    'out',
    style({
      transform: 'scale(0.8)',
      opacity: 0,
    }),
  ),
  transition('in <=> out', [animate('200ms ease-in-out')]),
]);
```

### Bounce Animation

```typescript
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const bounceInAnimation = trigger('bounceIn', [
  transition(':enter', [
    animate(
      '600ms ease-in',
      keyframes([
        style({ opacity: 0, transform: 'scale(0.3)', offset: 0 }),
        style({ opacity: 1, transform: 'scale(1.05)', offset: 0.5 }),
        style({ opacity: 1, transform: 'scale(0.9)', offset: 0.7 }),
        style({ opacity: 1, transform: 'scale(1)', offset: 1 }),
      ]),
    ),
  ]),
]);
```

### Loading Spinner Animation

```typescript
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const spinAnimation = trigger('spin', [
  state('spinning', style({ transform: 'rotate(0deg)' })),
  state('stopped', style({ transform: 'rotate(0deg)' })),
  transition('spinning => stopped', animate('0ms')),
  transition('stopped => spinning', [
    animate(
      '1s linear',
      keyframes([
        style({ transform: 'rotate(0deg)', offset: 0 }),
        style({ transform: 'rotate(360deg)', offset: 1 }),
      ]),
    ),
  ]),
]);
```

## Route Transition Animations

### Slide Route Animation

```typescript
import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true },
    ),
    query(':enter', [style({ left: '100%' })], { optional: true }),
    group([
      query(':leave', [animate('300ms ease-out', style({ left: '-100%' }))], { optional: true }),
      query(':enter', [animate('300ms ease-out', style({ left: '0%' }))], { optional: true }),
    ]),
  ]),
]);
```

### Fade Route Animation

```typescript
import { trigger, transition, style, query, animate } from '@angular/animations';

export const fadeInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          left: 0,
          width: '100%',
          opacity: 0,
          transform: 'translateY(50px)',
        }),
      ],
      { optional: true },
    ),
    query(':enter', [animate('600ms ease', style({ opacity: 1, transform: 'translateY(0)' }))], {
      optional: true,
    }),
  ]),
]);
```

## List Animation

```typescript
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        stagger(50, [animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]),
      ],
      { optional: true },
    ),
    query(
      ':leave',
      [
        stagger(50, [
          animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' })),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);
```

## Component Integration

### Using Animations in Components

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInOutAnimation, slideInOutAnimation } from './animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div [@fadeInOut]="showContent ? 'in' : 'out'">
        <h2>Dashboard Content</h2>
        <p>This content fades in and out</p>
      </div>

      <button (click)="toggleContent()">Toggle Content</button>

      <div [@slideInOut]="showPanel ? 'in' : 'out'" class="side-panel">
        <h3>Side Panel</h3>
        <p>This panel slides in from the side</p>
      </div>
    </div>
  `,
  animations: [fadeInOutAnimation, slideInOutAnimation],
  styles: [
    `
      .dashboard {
        position: relative;
        padding: 20px;
      }

      .side-panel {
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        height: 100%;
        background: #f8f9fa;
        padding: 20px;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class DashboardComponent {
  showContent = signal(true);
  showPanel = signal(false);

  toggleContent() {
    this.showContent.update((value) => !value);
  }

  togglePanel() {
    this.showPanel.update((value) => !value);
  }
}
```

## Advanced Animation Techniques

### Animation Callbacks

```typescript
import { Component, signal } from '@angular/core';
import { trigger, transition, style, animate, AnimationEvent } from '@angular/animations';

@Component({
  selector: 'app-animated-list',
  template: `
    <div
      [@listItemAnimation]="items.length"
      (@listItemAnimation.start)="onAnimationStart($event)"
      (@listItemAnimation.done)="onAnimationDone($event)"
    >
      <div *ngFor="let item of items; trackBy: trackByFn" [@itemAnimation]="item.state">
        {{ item.name }}
      </div>
    </div>
  `,
  animations: [
    trigger('itemAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100%)' }),
        animate('300ms ease-out'),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})
export class AnimatedListComponent {
  items = signal<Item[]>([]);

  onAnimationStart(event: AnimationEvent) {
    console.log('Animation started:', event);
  }

  onAnimationDone(event: AnimationEvent) {
    console.log('Animation completed:', event);
  }

  trackByFn(index: number, item: Item) {
    return item.id;
  }
}
```

### Animation Builder (Programmatic Animations)

```typescript
import { Component, ElementRef, inject } from '@angular/core';
import { AnimationBuilder, style, animate } from '@angular/animations';

@Component({
  selector: 'app-programmatic-animation',
  template: '<div #animatedElement>Animated Element</div>',
})
export class ProgrammaticAnimationComponent {
  private animationBuilder = inject(AnimationBuilder);
  private elementRef = inject(ElementRef);

  animateElement() {
    const element = this.elementRef.nativeElement.querySelector('#animatedElement');
    const animation = this.animationBuilder.build([
      style({ opacity: 0 }),
      animate('500ms ease-in', style({ opacity: 1 })),
    ]);

    const player = animation.create(element);
    player.play();
  }
}
```

## Performance Optimization

### Animation Performance Tips

```typescript
// Use transform and opacity for better performance
export const performantAnimation = trigger('performant', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateY(-20px) scale(0.95)'
    }),
    animate('300ms ease-out', style({
      opacity: 1,
      transform: 'translateY(0) scale(1)'
    }))
  ])
]);

// Avoid animating layout properties like width, height, top, left
// Prefer transform: translateX/Y, scale, rotate
// Use will-change CSS property for better performance

.my-element {
  will-change: transform, opacity;
}
```

## Testing Animations

```typescript
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnimatedComponent } from './animated.component';

describe('AnimatedComponent', () => {
  let component: AnimatedComponent;
  let fixture: ComponentFixture<AnimatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimatedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger animation when state changes', fakeAsync(() => {
    component.isVisible = true;
    fixture.detectChanges();

    // Wait for animation to complete
    tick(300);

    const element = fixture.nativeElement.querySelector('div');
    expect(element).toBeTruthy();
  }));
});
```

## Key Principles

- **Performance First**: Use transform and opacity for smooth animations
- **Accessibility**: Respect user's motion preferences with `prefers-reduced-motion`
- **Progressive Enhancement**: Animations should not break functionality
- **Consistent Timing**: Use consistent duration and easing functions
- **Mobile Friendly**: Consider performance on mobile devices
- **Semantic States**: Use meaningful state names and transitions
- **Testing**: Test animation triggers and completion callbacks

## Browser Support

- **Modern Browsers**: Full support for all animation features
- **IE11**: Limited support, consider fallbacks
- **Mobile**: Good support with hardware acceleration
- **Progressive Enhancement**: Always provide fallbacks for older browsers

## Integration with Universal Skills

This animation skill integrates seamlessly with other Universal Skills:

- **angular-component**: Use animations in component templates
- **angular-directive**: Create animation directives
- **angular-service**: Manage animation state centrally
- **angular-testing**: Test animation behaviors

Animations bring your Angular applications to life with smooth, professional transitions that enhance user experience and engagement! 🚀✨
