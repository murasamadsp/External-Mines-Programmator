/**
 * Розширений Error Boundary для глобальної обробки помилок
 * Відловлює runtime помилки, unhandled promise rejections, та надає зручний UI
 */

import { loggers } from "./logging/logger.js";

export class EnhancedErrorBoundary {
  constructor() {
    this.errors = [];
    this.isInitialized = false;
    this.maxErrors = 10; // Максимальна кількість помилок для збереження

    this.init();
  }

  /**
   * Ініціалізація глобальних обробників помилок
   */
  init() {
    if (this.isInitialized) {
      loggers.error.warn("⚠️ EnhancedErrorBoundary вже ініціалізовано");
      return;
    }

    // Обробка runtime помилок
    window.addEventListener("error", event => {
      this.handleError({
        type: "runtime",
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString(),
      });
    });

    // Обробка необроблених promise rejections
    window.addEventListener("unhandledrejection", event => {
      this.handleError({
        type: "promise",
        message: event.reason?.message || String(event.reason),
        error: event.reason,
        timestamp: new Date().toISOString(),
      });
    });

    this.isInitialized = true;
    loggers.error.info("✅ EnhancedErrorBoundary ініціалізовано");
  }

  /**
   * Обробка помилки
   * @param {object} errorInfo - Інформація про помилку
   */
  handleError(errorInfo) {
    // Логуємо помилку
    loggers.error.error("❌ Критична помилка відловлена:", errorInfo);

    // Зберігаємо в історію
    this.errors.push(errorInfo);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift(); // Видаляємо найстарішу помилку
    }

    // Показуємо UI користувачу
    this.showErrorUI(errorInfo);

    // Опціонально: відправка на сервер моніторингу
    // this.reportToMonitoring(errorInfo);
  }

  /**
   * Показує користувачу зручне повідомлення про помилку
   * @param {object} errorInfo - Інформація про помилку
   */
  showErrorUI(errorInfo) {
    // Перевіряємо чи вже є error container
    let errorContainer = document.getElementById("error-boundary-container");

    if (!errorContainer) {
      errorContainer = document.createElement("div");
      errorContainer.id = "error-boundary-container";
      errorContainer.className = "error-boundary-container";
      document.body.appendChild(errorContainer);
    }

    // Створюємо повідомлення про помилку
    const errorElement = document.createElement("div");
    errorElement.className = "error-boundary-message";

    const errorType =
      errorInfo.type === "promise" ? "Promise Rejection" : "Runtime Error";

    errorElement.innerHTML = `
      <div class="error-header">
        <span class="error-icon">⚠️</span>
        <span class="error-title">${errorType}</span>
        <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="error-body">
        <p class="error-message">${this.sanitizeHTML(errorInfo.message)}</p>
        ${errorInfo.filename ? `<p class="error-location">📍 ${errorInfo.filename}:${errorInfo.lineno}:${errorInfo.colno}</p>` : ""}
        <p class="error-time">🕒 ${new Date(errorInfo.timestamp).toLocaleTimeString()}</p>
      </div>
      <div class="error-actions">
        <button class="error-btn" onclick="location.reload()">🔄 Перезавантажити</button>
        <button class="error-btn" onclick="this.parentElement.parentElement.remove()">Закрити</button>
      </div>
    `;

    errorContainer.appendChild(errorElement);

    // Автоматично видаляємо через 10 секунд
    setTimeout(() => {
      if (errorElement.parentElement) {
        errorElement.remove();
      }
    }, 10000);
  }

  /**
   * Очищення HTML для безпеки
   * @param {string} html - HTML строка
   * @returns {string} Очищений текст
   */
  sanitizeHTML(html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Відправка помилки на сервер моніторингу (опціонально)
   * @param {object} _errorInfo - Інформація про помилку
   */
  reportToMonitoring(_errorInfo) {
    // TODO: Інтеграція з сервісом моніторингу (Sentry, LogRocket, тощо)
    // if (window.Sentry) {
    //   window.Sentry.captureException(errorInfo.error);
    // }
  }

  /**
   * Отримання історії помилок
   * @returns {Array} Масив помилок
   */
  getErrorHistory() {
    return [...this.errors];
  }

  /**
   * Очищення історії помилок
   */
  clearErrorHistory() {
    this.errors = [];
    loggers.error.info("🧹 Історія помилок очищена");
  }

  /**
   * Знищення error boundary
   */
  destroy() {
    // Видаляємо обробники подій
    window.removeEventListener("error", this.handleError);
    window.removeEventListener("unhandledrejection", this.handleError);

    // Видаляємо UI контейнер
    const errorContainer = document.getElementById("error-boundary-container");
    if (errorContainer) {
      errorContainer.remove();
    }

    this.isInitialized = false;
    loggers.error.info("🧹 EnhancedErrorBoundary знищено");
  }
}

// Глобальний singleton instance
export const errorBoundary = new EnhancedErrorBoundary();
