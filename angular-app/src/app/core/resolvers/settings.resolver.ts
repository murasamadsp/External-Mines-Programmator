import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SettingsService } from '../services/settings.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsResolver implements Resolve<Record<string, never>> {
  private settingsService = inject(SettingsService);

  resolve(): Observable<Record<string, never>> {
    // Just return empty object - no theme to resolve
    return of({});
  }
}
