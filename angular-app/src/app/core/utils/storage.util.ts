// Local Storage Utilities for Angular
// Provides safe access to browser localStorage with error handling

const STORAGE_KEYS = {
  PROGRAMS: 'programmator_programs',
  SETTINGS: 'programmator_settings',
  RECENT_PROGRAMS: 'programmator_recent',
  AUTOSAVE: 'programmator_autosave',
};

/**
 * Safe localStorage wrapper with error handling
 */
export class StorageUtil {
  /**
   * Get item from localStorage
   */
  static get<T = unknown>(key: string, fallback: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;

      try {
        return JSON.parse(item) as T;
      } catch {
        // If JSON parsing fails, return as string
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return fallback;
    }
  }

  /**
   * Set item in localStorage
   */
  static set(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all localStorage
   */
  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.error('Storage availability check failed:', error);
      return false;
    }
  }
}

import { Instruction } from '../models/program.model';
import { compactInstructions, expandInstructions, isProgramEmpty } from './instruction.util';

/**
 * Program-specific storage operations
 */
export class ProgramStorageUtil {
  /**
   * Autosave current program (stores compacted version)
   */
  static autosave(instructions: Instruction[]): boolean {
    // Don't save if program is empty
    if (isProgramEmpty(instructions)) {
      console.log('📦 Autosave skipped: program is empty');
      return this.clearAutosave();
    }

    // Compact instructions (remove trailing empty instructions)
    const compacted = compactInstructions(instructions);

    const autosaveData = {
      instructions: compacted,
      timestamp: Date.now(),
      version: '1.0',
    };

    console.log(
      `📦 Autosaving: ${instructions.length} → ${compacted.length} instructions (compacted)`,
    );

    return StorageUtil.set(STORAGE_KEYS.AUTOSAVE, autosaveData);
  }

  /**
   * Load autosaved program (expands to full size)
   */
  static loadAutosave(targetLength = 3072): {
    instructions: Instruction[];
    timestamp: number;
    version: string;
  } | null {
    const data = StorageUtil.get<{
      instructions: Instruction[];
      timestamp: number;
      version: string;
    }>(STORAGE_KEYS.AUTOSAVE, null);

    if (!data || !data.instructions) {
      return null;
    }

    // Don't return if program is empty
    if (isProgramEmpty(data.instructions)) {
      console.log('📦 Autosave found but program is empty, ignoring');
      return null;
    }

    // Expand instructions to target length
    const expanded = expandInstructions(data.instructions, targetLength);

    console.log(
      `📦 Loaded autosave: ${data.instructions.length} → ${expanded.length} instructions (expanded)`,
    );

    return {
      ...data,
      instructions: expanded,
    };
  }

  /**
   * Clear autosave data
   */
  static clearAutosave(): boolean {
    return StorageUtil.remove(STORAGE_KEYS.AUTOSAVE);
  }
}

/**
 * Settings storage operations
 */
export class SettingsStorageUtil {
  /**
   * Get setting value
   */
  static get<T = unknown>(key: string, defaultValue: T | null = null): T | null {
    const settings = StorageUtil.get<Record<string, unknown>>(STORAGE_KEYS.SETTINGS, {});
    return settings && settings[key] !== undefined ? (settings[key] as T) : defaultValue;
  }

  /**
   * Set setting value
   */
  static set(key: string, value: unknown): boolean {
    const settings = StorageUtil.get<Record<string, unknown>>(STORAGE_KEYS.SETTINGS, {}) || {};
    settings[key] = value;
    return StorageUtil.set(STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * Get all settings
   */
  static getAll(): Record<string, unknown> {
    return StorageUtil.get<Record<string, unknown>>(STORAGE_KEYS.SETTINGS, {}) || {};
  }

  /**
   * Reset settings to defaults
   */
  static reset(): boolean {
    return StorageUtil.set(STORAGE_KEYS.SETTINGS, {});
  }
}
