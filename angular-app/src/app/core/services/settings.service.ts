import { Injectable, signal } from '@angular/core';

// Simple settings without theme
export interface SimpleSettings {
  editor: {
    autoSave: boolean;
    autoSaveInterval: number;
    confirmBeforeLoad: boolean;
    confirmBeforeClear: boolean;
  };
  validation: {
    validateOnExport: boolean;
    showValidationErrors: boolean;
  };
  debug: {
    logToConsole: boolean;
  };
  export: {
    preserveEmptyCells: boolean;
  };
}

const DEFAULT_SETTINGS: SimpleSettings = {
  editor: {
    autoSave: true,
    autoSaveInterval: 30000,
    confirmBeforeLoad: true,
    confirmBeforeClear: true,
  },
  validation: {
    validateOnExport: true,
    showValidationErrors: true,
  },
  debug: {
    logToConsole: true,
  },
  export: {
    preserveEmptyCells: false,
  },
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settingsSignal = signal<SimpleSettings>(DEFAULT_SETTINGS);

  // Getters for each category
  editor = () => this.settingsSignal().editor;
  validation = () => this.settingsSignal().validation;
  debug = () => this.settingsSignal().debug;
  export = () => this.settingsSignal().export;

  constructor() {
    // Load from localStorage
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('app_settings_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        this.settingsSignal.set(merged);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('app_settings_v2', JSON.stringify(this.settingsSignal()));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // Simple update methods
  updateEditor(updates: Partial<SimpleSettings['editor']>): void {
    this.settingsSignal.update(settings => ({
      ...settings,
      editor: { ...settings.editor, ...updates }
    }));
    this.saveSettings();
  }

  updateValidation(updates: Partial<SimpleSettings['validation']>): void {
    this.settingsSignal.update(settings => ({
      ...settings,
      validation: { ...settings.validation, ...updates }
    }));
    this.saveSettings();
  }

  updateDebug(updates: Partial<SimpleSettings['debug']>): void {
    this.settingsSignal.update(settings => ({
      ...settings,
      debug: { ...settings.debug, ...updates }
    }));
    this.saveSettings();
  }

  updateExport(updates: Partial<SimpleSettings['export']>): void {
    this.settingsSignal.update(settings => ({
      ...settings,
      export: { ...settings.export, ...updates }
    }));
    this.saveSettings();
  }
}