---
name: angular-performance
description: Generates Angular performance monitoring and optimization utilities
---

# Angular Performance Monitoring Generator

This skill helps you generate Angular performance monitoring utilities, optimization patterns, and profiling tools following Angular performance best practices.

## Performance Monitoring Service Template

```typescript
import { Injectable, inject, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift

  // Custom metrics
  navigationTime: number;
  bundleSize: number;
  memoryUsage: number;
  renderTime: number;
}

export interface PerformanceEvent {
  type: 'navigation' | 'interaction' | 'render' | 'error';
  name: string;
  duration?: number;
  timestamp: number;
  data?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  private metrics: Partial<PerformanceMetrics> = {};
  private events: PerformanceEvent[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeMonitoring();
    this.setupNavigationTracking();
  }

  private initializeMonitoring(): void {
    // Core Web Vitals monitoring
    this.observeWebVitals();

    // Memory monitoring
    this.observeMemoryUsage();

    // Error monitoring
    this.observeErrors();

    // Long task monitoring
    this.observeLongTasks();
  }

  private observeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.logEvent('metric', 'LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.logEvent('metric', 'FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.logEvent('metric', 'CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('Web Vitals monitoring not supported:', error);
      }
    }
  }

  private observeMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize;
        this.logEvent('metric', 'Memory Usage', memory.usedJSHeapSize);
      }, 30000); // Every 30 seconds
    }
  }

  private observeErrors(): void {
    window.addEventListener('error', (event) => {
      this.logEvent('error', event.message, undefined, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logEvent('error', 'Unhandled Promise Rejection', undefined, {
        reason: event.reason
      });
    });
  }

  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.logEvent('performance', 'Long Task', entry.duration, {
                startTime: entry.startTime,
                name: entry.name
              });
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        console.warn('Long task monitoring not supported:', error);
      }
    }
  }

  private setupNavigationTracking(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          this.metrics.navigationTime = loadTime;
          this.logEvent('navigation', 'Page Load', loadTime);
        }
      });
  }

  // Public API
  logEvent(type: PerformanceEvent['type'], name: string, duration?: number, data?: Record<string, any>): void {
    const event: PerformanceEvent = {
      type,
      name,
      duration,
      timestamp: Date.now(),
      data
    };

    this.events.push(event);

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Send to analytics/monitoring service
    this.sendToAnalytics(event);
  }

  measureRenderTime(componentName: string, startTime?: number): () => void {
    const start = startTime || performance.now();

    return () => {
      const duration = performance.now() - start;
      this.logEvent('render', `${componentName} Render`, duration);
    };
  }

  measureInteraction(name: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.logEvent('interaction', name, duration);
    };
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  getEvents(limit = 100): PerformanceEvent[] {
    return this.events.slice(-limit);
  }

  clearEvents(): void {
    this.events = [];
  }

  private sendToAnalytics(event: PerformanceEvent): void {
    // Send to your analytics service
    // Example: Google Analytics, DataDog, Sentry, etc.

    if (event.type === 'error') {
      console.error('Performance Error:', event);
      // this.errorReportingService.report(event);
    } else {
      console.log('Performance Event:', event);
      // this.analyticsService.track(event);
    }
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}
```

## Change Detection Optimization Directive

```typescript
import { Directive, DoCheck, KeyValueDiffers, KeyValueDiffer, Input } from '@angular/core';

@Directive({
  selector: '[optimizeChangeDetection]',
  standalone: true
})
export class OptimizeChangeDetectionDirective implements DoCheck {
  private differ: KeyValueDiffer<any, any> | null = null;

  @Input('optimizeChangeDetection') data: any;

  constructor(private differs: KeyValueDiffers) {}

  ngOnInit(): void {
    this.differ = this.differs.find(this.data).create();
  }

  ngDoCheck(): void {
    if (this.differ) {
      const changes = this.differ.diff(this.data);
      if (changes) {
        // Only trigger change detection if data actually changed
        console.log('Data changed, triggering change detection');
      }
    }
  }
}
```

## Lazy Loading Performance Optimization

```typescript
import { Injectable, inject } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, timer, mergeMap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkAwarePreloadingStrategy implements PreloadingStrategy {
  private connection = (navigator as any).connection;

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Don't preload on slow connections
    if (this.connection) {
      const effectiveType = this.connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return of(null);
      }
    }

    // Preload after initial load with delay
    return timer(2000).pipe(
      mergeMap(() => load())
    );
  }
}

// Bundle size monitoring
@Injectable({
  providedIn: 'root'
})
export class BundleSizeMonitor {
  private initialBundleSize = 0;

  constructor() {
    // Monitor bundle size changes
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const scripts = resources.filter(entry => entry.initiatorType === 'script');

      scripts.forEach(script => {
        console.log(`Bundle loaded: ${script.name}, Size: ${script.transferSize} bytes`);
      });

      this.initialBundleSize = scripts.reduce((total, script) => total + script.transferSize, 0);
    }
  }

  getBundleSize(): number {
    return this.initialBundleSize;
  }
}
```

## Component Performance Profiling Directive

```typescript
import { Directive, ComponentRef, ViewContainerRef, ComponentFactoryResolver, Injector, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[profilePerformance]',
  standalone: true
})
export class ProfilePerformanceDirective implements OnInit, OnDestroy {
  private startTime = 0;
  private endTime = 0;

  constructor(
    private viewContainer: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  ngOnInit(): void {
    this.startTime = performance.now();
    console.log('Component initialization started');
  }

  ngOnDestroy(): void {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;

    console.log(`Component lifecycle duration: ${duration}ms`);

    // Report to performance service
    // this.performanceService.logEvent('lifecycle', 'Component Destroy', duration);
  }

  ngAfterViewInit(): void {
    const viewInitTime = performance.now();
    console.log(`View initialization completed in ${viewInitTime - this.startTime}ms`);
  }

  ngAfterViewChecked(): void {
    // Only log if this takes too long (potential performance issue)
    const checkStart = performance.now();
    setTimeout(() => {
      const checkDuration = performance.now() - checkStart;
      if (checkDuration > 16) { // More than one frame (60fps)
        console.warn(`Slow view check: ${checkDuration}ms`);
      }
    });
  }
}
```

## Virtual Scrolling Performance Component

```typescript
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VirtualScrollItem {
  id: string;
  height: number;
  data: any;
}

@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="virtual-scroll-container" #container>
      <div
        class="virtual-scroll-viewport"
        [style.height.px]="viewportHeight"
        (scroll)="onScroll($event)"
      >
        <div
          class="virtual-scroll-content"
          [style.height.px]="totalHeight"
          [style.transform]="'translateY(' + offsetY + 'px)'"
        >
          @for (item of visibleItems; track item.id) {
            <div
              class="virtual-scroll-item"
              [style.height.px]="item.height"
            >
              <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item.data }"></ng-container>
            </div>
          }
        </div>
      </div>
    </div>

    <ng-template #itemTemplate let-item>
      <div>{{ item }}</div>
    </ng-template>
  `,
  styles: [`
    .virtual-scroll-container {
      height: 400px;
      overflow: hidden;
    }

    .virtual-scroll-viewport {
      height: 100%;
      overflow-y: auto;
    }

    .virtual-scroll-content {
      position: relative;
    }

    .virtual-scroll-item {
      position: absolute;
      left: 0;
      right: 0;
    }
  `]
})
export class VirtualScrollComponent implements OnChanges {
  @Input() items: VirtualScrollItem[] = [];
  @Input() itemHeight = 50;
  @Input() containerHeight = 400;
  @Input() bufferSize = 5;

  @Output() visibleRangeChange = new EventEmitter<{ start: number; end: number }>();

  visibleItems: VirtualScrollItem[] = [];
  viewportHeight = this.containerHeight;
  totalHeight = 0;
  offsetY = 0;

  private startIndex = 0;
  private endIndex = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.totalHeight = this.items.reduce((sum, item) => sum + item.height, 0);
      this.updateVisibleItems(0);
    }
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;

    this.updateVisibleItems(scrollTop);
  }

  private updateVisibleItems(scrollTop: number): void {
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight) + (this.bufferSize * 2);
    const endIndex = Math.min(this.items.length, startIndex + visibleCount);

    if (startIndex !== this.startIndex || endIndex !== this.endIndex) {
      this.startIndex = startIndex;
      this.endIndex = endIndex;

      this.visibleItems = this.items.slice(startIndex, endIndex);
      this.offsetY = startIndex * this.itemHeight;

      this.visibleRangeChange.emit({ start: startIndex, end: endIndex });
    }
  }
}
```

## OnPush Change Detection Strategy Component

```typescript
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-optimized-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="optimized-list">
      <div class="list-header">
        <h3>{{ title }}</h3>
        <button (click)="refresh()" class="refresh-btn">Refresh</button>
      </div>

      <div class="list-filters">
        <input
          type="text"
          [value]="filterText"
          (input)="onFilterChange($any($event.target).value)"
          placeholder="Filter items..."
          class="filter-input"
        />
      </div>

      <div class="list-content">
        @for (item of filteredItems(); track item.id) {
          <div class="list-item" [class.selected]="item.id === selectedId">
            <div class="item-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
            </div>
            <div class="item-actions">
              <button (click)="selectItem(item)" class="select-btn">Select</button>
              <button (click)="editItem(item)" class="edit-btn">Edit</button>
            </div>
          </div>
        }

        @if (filteredItems().length === 0) {
          <div class="empty-state">
            <p>No items found</p>
            <button (click)="addItem()" class="add-btn">Add First Item</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .optimized-list {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .refresh-btn {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .list-filters {
      margin-bottom: 20px;
    }

    .filter-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .list-content {
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }

    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
    }

    .list-item:hover {
      background-color: #f8f9fa;
    }

    .list-item.selected {
      background-color: #e3f2fd;
      border-left: 4px solid #007bff;
    }

    .item-content {
      flex: 1;
    }

    .item-content h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .item-content p {
      margin: 0;
      color: #666;
    }

    .item-actions {
      display: flex;
      gap: 8px;
    }

    .select-btn, .edit-btn, .add-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .select-btn {
      background: #28a745;
      color: white;
    }

    .edit-btn {
      background: #ffc107;
      color: #212529;
    }

    .add-btn {
      background: #007bff;
      color: white;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .empty-state p {
      margin-bottom: 16px;
      font-size: 18px;
    }
  `]
})
export class OptimizedListComponent implements OnChanges {
  @Input() items: any[] = [];
  @Input() title = 'Items';
  @Input() selectedId: string | null = null;

  @Output() itemSelected = new EventEmitter<any>();
  @Output() itemEdited = new EventEmitter<any>();
  @Output() itemAdded = new EventEmitter();
  @Output() refreshRequested = new EventEmitter();

  filterText = '';

  // Computed signal for filtered items
  filteredItems = () => {
    if (!this.filterText) return this.items;

    const filter = this.filterText.toLowerCase();
    return this.items.filter(item =>
      item.title.toLowerCase().includes(filter) ||
      item.description.toLowerCase().includes(filter)
    );
  };

  ngOnChanges(changes: SimpleChanges): void {
    // Only update when items actually change
    if (changes['items'] && changes['items'].currentValue !== changes['items'].previousValue) {
      console.log('Items changed, updating filtered list');
    }
  }

  onFilterChange(text: string): void {
    this.filterText = text;
    // Trigger change detection manually since we're using OnPush
    this.ngOnChanges({});
  }

  selectItem(item: any): void {
    this.itemSelected.emit(item);
  }

  editItem(item: any): void {
    this.itemEdited.emit(item);
  }

  addItem(): void {
    this.itemAdded.emit();
  }

  refresh(): void {
    this.refreshRequested.emit();
  }
}
```

## Performance Testing Utilities

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceService } from './performance.service';

@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="performance-dashboard">
      <h2>Performance Dashboard</h2>

      <div class="metrics-grid">
        <div class="metric-card">
          <h3>LCP (Largest Contentful Paint)</h3>
          <div class="metric-value">{{ metrics().lcp | number:'1.0-0' }}ms</div>
          <div class="metric-status" [class]="getLCPStatus()">{{ getLCPStatus() }}</div>
        </div>

        <div class="metric-card">
          <h3>FID (First Input Delay)</h3>
          <div class="metric-value">{{ metrics().fid | number:'1.0-0' }}ms</div>
          <div class="metric-status" [class]="getFIDStatus()">{{ getFIDStatus() }}</div>
        </div>

        <div class="metric-card">
          <h3>CLS (Cumulative Layout Shift)</h3>
          <div class="metric-value">{{ metrics().cls | number:'1.2-2' }}</div>
          <div class="metric-status" [class]="getCLSStatus()">{{ getCLSStatus() }}</div>
        </div>

        <div class="metric-card">
          <h3>Memory Usage</h3>
          <div class="metric-value">{{ metrics().memoryUsage / 1024 / 1024 | number:'1.1-1' }} MB</div>
        </div>
      </div>

      <div class="events-section">
        <h3>Recent Events</h3>
        <div class="events-list">
          @for (event of recentEvents(); track event.timestamp) {
            <div class="event-item" [class]="'event-' + event.type">
              <div class="event-info">
                <span class="event-type">{{ event.type }}</span>
                <span class="event-name">{{ event.name }}</span>
                @if (event.duration) {
                  <span class="event-duration">{{ event.duration | number:'1.0-0' }}ms</span>
                }
              </div>
              <div class="event-time">{{ formatTime(event.timestamp) }}</div>
            </div>
          }
        </div>
      </div>

      <div class="actions">
        <button (click)="runPerformanceTest()" class="test-btn">Run Performance Test</button>
        <button (click)="clearEvents()" class="clear-btn">Clear Events</button>
      </div>
    </div>
  `,
  styles: [`
    .performance-dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .metric-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    .metric-card h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 10px;
    }

    .metric-status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .metric-status.good { background: #d4edda; color: #155724; }
    .metric-status.needs-improvement { background: #fff3cd; color: #856404; }
    .metric-status.poor { background: #f8d7da; color: #721c24; }

    .events-section h3 {
      margin-bottom: 15px;
      color: #333;
    }

    .events-list {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }

    .event-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }

    .event-item:last-child {
      border-bottom: none;
    }

    .event-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .event-type {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .event-name {
      font-weight: 500;
    }

    .event-duration {
      color: #666;
      font-size: 14px;
    }

    .event-time {
      color: #999;
      font-size: 12px;
    }

    .actions {
      margin-top: 30px;
      display: flex;
      gap: 10px;
    }

    .test-btn, .clear-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .test-btn {
      background: #007bff;
      color: white;
    }

    .clear-btn {
      background: #6c757d;
      color: white;
    }
  `]
})
export class PerformanceDashboardComponent implements OnInit {
  private readonly performanceService = inject(PerformanceService);

  metrics = signal(this.performanceService.getMetrics());
  recentEvents = signal(this.performanceService.getEvents(20));

  ngOnInit(): void {
    // Update metrics every 5 seconds
    setInterval(() => {
      this.metrics.set(this.performanceService.getMetrics());
      this.recentEvents.set(this.performanceService.getEvents(20));
    }, 5000);
  }

  getLCPStatus(): string {
    const lcp = this.metrics().lcp || 0;
    if (lcp <= 2500) return 'good';
    if (lcp <= 4000) return 'needs-improvement';
    return 'poor';
  }

  getFIDStatus(): string {
    const fid = this.metrics().fid || 0;
    if (fid <= 100) return 'good';
    if (fid <= 300) return 'needs-improvement';
    return 'poor';
  }

  getCLSStatus(): string {
    const cls = this.metrics().cls || 0;
    if (cls <= 0.1) return 'good';
    if (cls <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  runPerformanceTest(): void {
    const endMeasure = this.performanceService.measureInteraction('Performance Test');

    // Simulate some work
    setTimeout(() => {
      for (let i = 0; i < 100000; i++) {
        Math.sqrt(i);
      }
      endMeasure();
    }, 100);
  }

  clearEvents(): void {
    this.performanceService.clearEvents();
    this.recentEvents.set([]);
  }
}
```

## Key Principles

- **Monitor Core Web Vitals**: LCP, FID, CLS are crucial for user experience
- **Lazy Loading**: Load components only when needed
- **Change Detection Optimization**: Use OnPush strategy and trackBy functions
- **Bundle Analysis**: Monitor and optimize bundle sizes
- **Memory Management**: Watch for memory leaks and excessive usage
- **Virtual Scrolling**: Use for large lists to improve performance
- **Profiling**: Regularly profile applications for bottlenecks
- **Progressive Enhancement**: Ensure good performance on all devices

## Integration with Universal Skills

This performance skill integrates with other Universal Skills:

- **angular-component**: Performance-optimized component patterns
- **angular-service**: Performance monitoring services
- **angular-directive**: Performance profiling directives
- **angular-routing**: Lazy loading and preloading strategies
- **angular-testing**: Performance testing utilities

Performance monitoring and optimization ensure your Angular applications deliver excellent user experience across all devices and network conditions! 🚀⚡📊