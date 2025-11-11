// Local Storage Utilities
// Provides safe access to browser localStorage with error handling

import { safeExecute, safeExecuteAsync } from './error-handler.js';

const STORAGE_KEYS = {
  PROGRAMS: 'programmator_programs',
  SETTINGS: 'programmator_settings',
  RECENT_PROGRAMS: 'programmator_recent',
  AUTOSAVE: 'programmator_autosave'
};

/**
 * Safe localStorage wrapper with error handling
 */
export class Storage {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {*} fallback - Fallback value if not found or error
   * @returns {*} Parsed value or fallback
   */
  static get(key, fallback = null) {
    return safeExecute(() => {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;

      try {
        return JSON.parse(item);
      } catch {
        // If JSON parsing fails, return as string
        return item;
      }
    }, fallback, { operation: 'storage_get', key });
  }

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  static set(key, value) {
    return safeExecute(() => {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }, false, { operation: 'storage_set', key, value });
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  static remove(key) {
    return safeExecute(() => {
      localStorage.removeItem(key);
      return true;
    }, false, { operation: 'storage_remove', key });
  }

  /**
   * Clear all localStorage
   * @returns {boolean} Success status
   */
  static clear() {
    return safeExecute(() => {
      localStorage.clear();
      return true;
    }, false, { operation: 'storage_clear' });
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} Availability status
   */
  static isAvailable() {
    return safeExecute(() => {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    }, false, { operation: 'storage_check' });
  }
}

/**
 * Program-specific storage operations
 */
export class ProgramStorage {
  /**
   * Save program to storage
   * @param {string} name - Program name
   * @param {Array} instructions - Program instructions
   * @param {string} format - Program format
   * @returns {boolean} Success status
   */
  static saveProgram(name, instructions, format = 'Base64') {
    const programs = Storage.get(STORAGE_KEYS.PROGRAMS, {});
    programs[name] = {
      instructions,
      format,
      savedAt: new Date().toISOString(),
      version: '1.0'
    };
    return Storage.set(STORAGE_KEYS.PROGRAMS, programs);
  }

  /**
   * Load program from storage
   * @param {string} name - Program name
   * @returns {Object|null} Program data or null if not found
   */
  static loadProgram(name) {
    const programs = Storage.get(STORAGE_KEYS.PROGRAMS, {});
    return programs[name] || null;
  }

  /**
   * Get list of saved programs
   * @returns {Array} Array of program names
   */
  static getProgramList() {
    const programs = Storage.get(STORAGE_KEYS.PROGRAMS, {});
    return Object.keys(programs);
  }

  /**
   * Delete program from storage
   * @param {string} name - Program name
   * @returns {boolean} Success status
   */
  static deleteProgram(name) {
    const programs = Storage.get(STORAGE_KEYS.PROGRAMS, {});
    delete programs[name];
    return Storage.set(STORAGE_KEYS.PROGRAMS, programs);
  }

  /**
   * Autosave current program
   * @param {Array} instructions - Program instructions
   * @returns {boolean} Success status
   */
  static autosave(instructions) {
    const autosaveData = {
      instructions,
      timestamp: Date.now(),
      version: '1.0'
    };
    return Storage.set(STORAGE_KEYS.AUTOSAVE, autosaveData);
  }

  /**
   * Load autosaved program
   * @returns {Object|null} Autosave data or null
   */
  static loadAutosave() {
    return Storage.get(STORAGE_KEYS.AUTOSAVE, null);
  }

  /**
   * Clear autosave data
   * @returns {boolean} Success status
   */
  static clearAutosave() {
    return Storage.remove(STORAGE_KEYS.AUTOSAVE);
  }

  /**
   * Add program to recent list
   * @param {string} name - Program name
   * @param {string} format - Program format
   */
  static addToRecent(name, format = 'Base64') {
    const recent = Storage.get(STORAGE_KEYS.RECENT_PROGRAMS, []);
    const existingIndex = recent.findIndex(item => item.name === name);

    if (existingIndex >= 0) {
      recent.splice(existingIndex, 1);
    }

    recent.unshift({
      name,
      format,
      accessedAt: new Date().toISOString()
    });

    // Keep only last 10 recent programs
    recent.splice(10);

    Storage.set(STORAGE_KEYS.RECENT_PROGRAMS, recent);
  }

  /**
   * Get recent programs list
   * @returns {Array} Array of recent programs
   */
  static getRecentPrograms() {
    return Storage.get(STORAGE_KEYS.RECENT_PROGRAMS, []);
  }
}

/**
 * Settings storage operations
 */
export class SettingsStorage {
  /**
   * Get setting value
   * @param {string} key - Setting key
   * @param {*} defaultValue - Default value
   * @returns {*} Setting value
   */
  static get(key, defaultValue = null) {
    const settings = Storage.get(STORAGE_KEYS.SETTINGS, {});
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }

  /**
   * Set setting value
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   * @returns {boolean} Success status
   */
  static set(key, value) {
    const settings = Storage.get(STORAGE_KEYS.SETTINGS, {});
    settings[key] = value;
    return Storage.set(STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * Get all settings
   * @returns {Object} All settings
   */
  static getAll() {
    return Storage.get(STORAGE_KEYS.SETTINGS, {});
  }

  /**
   * Reset settings to defaults
   * @returns {boolean} Success status
   */
  static reset() {
    return Storage.set(STORAGE_KEYS.SETTINGS, {});
  }
}
