/**
 * @fileoverview Simple settings model for the External Mines Programmator
 * @description Basic configuration system without theme selection
 */

/**
 * Editor-related settings (used in simple settings)
 */
export interface EditorSettings {
  /** Enable auto-save functionality */
  autoSave: boolean;

  /** Auto-save interval in seconds */
  autoSaveInterval: number;

  /** Confirm before clearing program */
  confirmBeforeClear: boolean;

  /** Confirm before loading program */
  confirmBeforeLoad: boolean;
}

/**
 * Validation settings (used in simple settings)
 */
export interface ValidationSettings {
  /** Validate on export */
  validateOnExport: boolean;

  /** Show validation errors */
  showValidationErrors: boolean;
}

/**
 * Export settings (used in simple settings)
 */
export interface ExportSettings {
  /** Preserve empty cells */
  preserveEmptyCells: boolean;
}

/**
 * Debug settings (used in simple settings)
 */
export interface DebugSettings {
  /** Log to console */
  logToConsole: boolean;
}

/**
 * Simple application settings (without theme)
 */
export interface AppSettings {
  editor: EditorSettings;
  validation: ValidationSettings;
  export: ExportSettings;
  debug: DebugSettings;
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: AppSettings = {
  editor: {
    autoSave: true,
    autoSaveInterval: 30000,
    confirmBeforeClear: true,
    confirmBeforeLoad: true,
  },
  validation: {
    validateOnExport: true,
    showValidationErrors: true,
  },
  export: {
    preserveEmptyCells: false,
  },
  debug: {
    logToConsole: true,
  },
};


