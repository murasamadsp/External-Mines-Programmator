import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly router = inject(Router);

  constructor() {
    // Listen to navigation events
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Navigation to:', event.url);
      });
  }

  navigateToEditor(): void {
    this.router.navigate(['/editor']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: null });
  }

  getCurrentRoute(): string {
    return this.router.url;
  }
}
