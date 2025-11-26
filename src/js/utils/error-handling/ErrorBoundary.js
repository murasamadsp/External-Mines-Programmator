// ErrorBoundary - глобальна обробка помилок
// Забезпечує централізоване логування та обробку помилок

import { loggers } from "../logging/logger.js";

export class ErrorBoundary {
  constructor() {
    this.isInitialized = false;
    this.errorHandlers = [];
    this.eventListeners = [];
    this.recoveryStrategies = new Map();
    this.setupRecoveryStrategies();
  }

  /**
   * Налаштовує стратегії відновлення для різних типів помилок
   */
  setupRecoveryStrategies() {
    // Стратегія відновлення для LZMA помилок
    this.recoveryStrategies.set("LZMA", {
      canRecover: (error) => error.message.includes("LZMA"),
      recover: async () => {
        loggers.error.warn("🔄 Спроба відновлення після LZMA помилки...");
        // Можна спробувати перезавантажити LZMA або показати повідомлення
        this.showUserNotification(
          "Помилка стиснення. Спробуйте перезавантажити сторінку.",
          "warning",
        );
      },
    });

    // Стратегія відновлення для мережевих помилок
    this.recoveryStrategies.set("NETWORK", {
      canRecover: (error) =>
        error.message.includes("fetch") || error.message.includes("network"),
      recover: async () => {
        loggers.error.warn(
          "🔄 Мережева помилка, спроба повторного підключення...",
        );
        // Можна спробувати повторити запит або показати offline повідомлення
        this.showUserNotification(
          "Мережева помилка. Перевірте підключення до інтернету.",
          "error",
        );
      },
    });

    // Стратегія відновлення для помилок пам'яті
    this.recoveryStrategies.set("MEMORY", {
      canRecover: (error) =>
        error.message.includes("out of memory") || error.name === "RangeError",
      recover: async () => {
        loggers.error.warn(
          "🔄 Помилка пам'яті, очищення та перезавантаження...",
        );
        // Очистити localStorage та перезавантажити
        try {
          localStorage.clear();
          sessionStorage.clear();
          setTimeout(() => window.location.reload(), 1000);
        } catch (e) {
          // Якщо навіть очищення не працює, показати повідомлення
          this.showUserNotification(
            "Критична помилка пам'яті. Перезавантажте сторінку вручну.",
            "error",
          );
        }
      },
    });
  }

  /**
   * Спробує автоматичне відновлення на основі типу помилки
   */
  async attemptRecovery(error, errorInfo) {
    for (const [strategyName, strategy] of this.recoveryStrategies) {
      if (strategy.canRecover(error)) {
        try {
          loggers.error.info(
            `🔄 Спроба відновлення за стратегією: ${strategyName}`,
          );
          await strategy.recover();
          loggers.error.info(`✅ Відновлення успішне: ${strategyName}`);
          return true;
        } catch (recoveryError) {
          loggers.error.warn(
            `❌ Відновлення не вдалося (${strategyName}):`,
            recoveryError,
          );
        }
      }
    }
    return false;
  }

  /**
   * Показує повідомлення користувачу
   */
  showUserNotification(message, type = "info") {
    // Створюємо простий toast notification
    const notification = document.createElement("div");
    notification.className = `error-notification error-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "error" ? "#e74c3c" : type === "warning" ? "#f39c12" : "#3498db"};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 300px;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Автоматично видаляємо через 5 секунд
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOut 0.3s ease-in";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
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
    const errorHandler = (event) => {
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
    const rejectionHandler = (event) => {
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

    // Спробуємо автоматичне відновлення
    this.attemptRecovery(error, errorInfo);

    // Викликаємо зареєстровані обробники
    this.errorHandlers.forEach((handler) => {
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

    // Create title
    const title = document.createElement("h2");
    title.textContent = "🚨 Сталася помилка";
    title.style.cssText = "color: #e74c3c; margin-top: 0;";
    errorBox.appendChild(title);

    // Create message paragraph
    const messagePara = document.createElement("p");
    const messageLabel = document.createElement("strong");
    messageLabel.textContent = "Повідомлення: ";
    messagePara.appendChild(messageLabel);
    messagePara.appendChild(document.createTextNode(errorInfo.message));
    errorBox.appendChild(messagePara);

    // Create timestamp paragraph
    const timePara = document.createElement("p");
    const timeLabel = document.createElement("strong");
    timeLabel.textContent = "Час: ";
    timePara.appendChild(timeLabel);
    timePara.appendChild(
      document.createTextNode(new Date(errorInfo.timestamp).toLocaleString()),
    );
    errorBox.appendChild(timePara);

    // Create buttons container
    const buttonsDiv = document.createElement("div");
    buttonsDiv.style.cssText = "margin-top: 15px;";

    // Create reload button
    const reloadBtn = document.createElement("button");
    reloadBtn.id = "reload-btn";
    reloadBtn.textContent = "Перезавантажити";
    reloadBtn.style.cssText =
      "background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;";
    buttonsDiv.appendChild(reloadBtn);

    // Create dismiss button
    const dismissBtn = document.createElement("button");
    dismissBtn.id = "dismiss-btn";
    dismissBtn.textContent = "Закрити";
    dismissBtn.style.cssText =
      "background: #95a5a6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;";
    buttonsDiv.appendChild(dismissBtn);

    errorBox.appendChild(buttonsDiv);

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
