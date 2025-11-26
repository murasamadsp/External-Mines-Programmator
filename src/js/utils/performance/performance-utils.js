// Performance utilities - утиліти для оптимізації продуктивності
/* eslint-disable prettier/prettier */

/* global requestAnimationFrame, cancelAnimationFrame */

/**
 * Debounce функція для обмеження частоти викликів
 * @param {Function} func - функція для debounce
 * @param {number} wait - час очікування в ms
 * @param {boolean} immediate - чи виконувати відразу
 * @returns {Function} debounced функція
 */
export function debounce(func, wait, immediate = false) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

/**
 * Throttle функція для обмеження частоти викликів
 * @param {Function} func - функція для throttle
 * @param {number} limit - ліміт часу в ms
 * @returns {Function} throttled функція
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * RequestAnimationFrame debounced function
 * @param {Function} func - функція для debounce через RAF
 * @returns {Function} raf-debounced функція
 */
export function rafDebounce(func) {
  let rafId = null;

  return function (...args) {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = null;
    });
  };
}

/**
 * Measure performance of a function
 * @param {Function} func - функція для вимірювання
 * @param {string} name - ім'я функції для логування
 * @returns {Function} функція з вимірюванням продуктивності
 */
export function measurePerformance(func, name = "function") {
  return async function (...args) {
    const start = performance.now();
    try {
      const result = await func.apply(this, args);
      const end = performance.now();
      console.log(`⏱️ ${name} виконано за ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(
        `❌ ${name} помилка після ${(end - start).toFixed(2)}ms:`,
        error,
      );
      throw error;
    }
  };
}

/**
 * Batch DOM updates for better performance
 */
export class DOMBatchUpdater {
  constructor() {
    this.updates = [];
    this.isScheduled = false;
  }

  /**
   * Add update to batch
   * @param {Function} updateFunc - функція оновлення DOM
   */
  addUpdate(updateFunc) {
    this.updates.push(updateFunc);
    this.scheduleBatch();
  }

  /**
   * Schedule batch execution
   */
  scheduleBatch() {
    if (!this.isScheduled) {
      this.isScheduled = true;
      requestAnimationFrame(() => {
        this.executeBatch();
      });
    }
  }

  /**
   * Execute all batched updates
   */
  executeBatch() {
    this.updates.forEach(update => update());
    this.updates = [];
    this.isScheduled = false;
  }
}
