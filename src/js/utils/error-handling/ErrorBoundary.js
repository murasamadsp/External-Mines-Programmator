// ErrorBoundary - глобальна обробка помилок
// Забезпечує централізоване логування та обробку помилок

import { loggers } from "../logging/logger.js";

export class ErrorBoundary {
  constructor() {
    this.isInitialized = false;
    this.errorHandlers = [];
    this.eventListeners = [];
  }

  /**
   * Ініціалізує глобальну обробку помилок
   */
  initialize() {
    if (this.isInitialized) {
      console.warn("⚠️ ErrorBoundary вже ініціалізовано");
      return;
    }

    console.info("🛡️ Ініціалізація ErrorBoundary...");

    // Обробка необроблених помилок
    const errorHandler = event => {
      this.handleError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: "unhandled_error",
      });
    };
    window.addEventListener("error", errorHandler);
    this.eventListeners.push({ type: "error", handler: errorHandler });

    // Обробка необроблених відхилень промісів
    const rejectionHandler = event => {
      this.handleError(event.reason, {
        type: "unhandled_promise_rejection",
        promise: event.promise,
      });
    };
    window.addEventListener("unhandledrejection", rejectionHandler);
    this.eventListeners.push({
      type: "unhandledrejection",
      handler: rejectionHandler,
    });

    this.isInitialized = true;
    console.info("✅ ErrorBoundary ініціалізовано");
  }

  /**
   * Обробляє помилку
   * @param {Error} error - об'єкт помилки
   * @param {object} context - контекст помилки
   */
  handleError(error, context = {}) {
    const errorInfo = {
      error,
      message: error?.message || "Unknown error",
      stack: error?.stack || "No stack trace",
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Логуємо помилку (безпечний спосіб)
    try {
      loggers.error.error("🚨 Критична помилка:", errorInfo);
    } catch (_loggerError) {
      console.error("🚨 Критична помилка:", errorInfo);
    }

    // Викликаємо зареєстровані обробники
    this.errorHandlers.forEach(handler => {
      try {
        handler(errorInfo);
      } catch (handlerError) {
        try {
          loggers.error.error("❌ Помилка в error handler:", handlerError);
        } catch (_loggerError2) {
          console.error("❌ Помилка в error handler:", handlerError);
        }
      }
    });

    // Показуємо користувачу повідомлення про помилку
    this.showErrorToUser(errorInfo);
  }

  /**
   * Реєструє обробник помилок
   * @param {Function} handler - функція обробки помилки
   */
  addErrorHandler(handler) {
    if (typeof handler === "function") {
      this.errorHandlers.push(handler);
      console.debug("➕ Додано error handler");
    } else {
      console.warn("⚠️ Спроба додати некоректний error handler");
    }
  }

  /**
   * Видаляє обробник помилок
   * @param {Function} handler - функція обробки помилки для видалення
   */
  removeErrorHandler(handler) {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
      console.debug("➖ Видалено error handler");
    }
  }

  /**
   * Показує повідомлення про помилку користувачу
   * @param {object} errorInfo - інформація про помилку
   */
  showErrorToUser(errorInfo) {
    const overlay = this.createErrorOverlay(errorInfo);
    document.body.appendChild(overlay);
    this.setupErrorOverlayHandlers(overlay);
  }

  /**
   * Створює overlay для повідомлення про помилку
   * @param {object} errorInfo - інформація про помилку
   * @returns {HTMLElement} overlay елемент
   */
  createErrorOverlay(errorInfo) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
      justify-content: center; z-index: 10000; font-family: Arial, sans-serif;
    `;

    const errorBox = document.createElement("div");
    errorBox.style.cssText = `
      background: white; padding: 20px; border-radius: 8px; max-width: 500px;
      max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    errorBox.innerHTML = `
      <h2 style="color: #e74c3c; margin-top: 0;">🚨 Сталася помилка</h2>
      <p><strong>Повідомлення:</strong> ${errorInfo.message}</p>
      <p><strong>Час:</strong> ${new Date(errorInfo.timestamp).toLocaleString()}</p>
      <div style="margin-top: 15px;">
        <button id="reload-btn" style="background: #3498db; color: white; border: none;
          padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Перезавантажити</button>
        <button id="dismiss-btn" style="background: #95a5a6; color: white; border: none;
          padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Закрити</button>
      </div>
    `;

    overlay.appendChild(errorBox);
    return overlay;
  }

  /**
   * Налаштовує обробники подій для overlay
   * @param {HTMLElement} overlay - overlay елемент
   */
  setupErrorOverlayHandlers(overlay) {
    const reloadBtn = overlay.querySelector("#reload-btn");
    const dismissBtn = overlay.querySelector("#dismiss-btn");

    reloadBtn.addEventListener("click", () => window.location.reload());
    dismissBtn.addEventListener("click", () =>
      document.body.removeChild(overlay),
    );
  }

  /**
   * Очищає ресурси
   */
  destroy() {
    if (!this.isInitialized) return;

    console.debug("🧹 Очищення ErrorBoundary...");

    // Видаляємо всі зареєстровані event listeners
    this.eventListeners.forEach(({ type, handler }) => {
      window.removeEventListener(type, handler);
    });
    this.eventListeners = [];

    this.errorHandlers = [];
    this.isInitialized = false;

    console.debug("✅ ErrorBoundary очищено");
  }
}

// Експортуємо singleton instance
export const errorBoundary = new ErrorBoundary();
