// Основна точка входу Програматора шахт
// Ініціалізує додаток при готовності DOM

// Активація глобального захисту від розширень браузера
import { setupGlobalInputProtection } from "./core/utils/dom-utils.js";
setupGlobalInputProtection();

/**
 * Ініціалізує систему логування
 * @returns {Promise<{logger: any, logLevel: string}>} Об'єкт з екземпляром логгера та рівнем логування
 */
async function initializeLogger() {
  const loggerModule = await import("./utils/logging/logger.js");
  const { logger: importedLogger } = loggerModule;

  const { configureLogger } = await import("./utils/logging/logger-config.js");
  const logLevel = configureLogger();

  return { logger: importedLogger, logLevel };
}

/**
 * Ініціалізує глобальну обробку помилок
 * @param {any} logger - екземпляр логгера
 */
async function initializeErrorBoundary(logger) {
  const { errorBoundary } = await import(
    "./utils/error-handling/ErrorBoundary.js"
  );
  errorBoundary.initialize();
  logger.debug("🛡️ ErrorBoundary ініціалізовано");
}

/**
 * Ініціалізує основний додаток
 * @param {any} logger - екземпляр логгера
 */
async function initializeApp(logger) {
  logger.debug("Завантаження EditorController...");
  document.body.setAttribute("data-app-init", "loading-editor");

  const { EditorController } = await import(
    "./features/editor/editor-controller.js"
  );
  logger.debug("EditorController вдало імпортовано");
  document.body.setAttribute("data-app-init", "editor-imported");

  const editorController = new EditorController();
  window.editorController = editorController; // Expose for testing
  logger.info("✅ EditorController вдало започатковано");
  logger.debug(
    `Екземпляр EditorController утворено: ${editorController.constructor.name}`,
  );
  document.body.setAttribute("data-app-init", "programmator-created");
}

// Ініціалізація додатка при готовності DOM
document.addEventListener("DOMContentLoaded", async () => {
  let logger;

  try {
    const { logger: initializedLogger, logLevel } = await initializeLogger();
    logger = initializedLogger;
    logger.debug("Система логування налаштована, рівень:", logLevel);

    await initializeErrorBoundary(logger);

    logger.info("🚀 EMP (External Mines Programmator) запускається...");
    logger.info("🔧 LZMA стиснення готове з lzma-purejs (режим 7)");

    await initializeApp(logger);
  } catch (error) {
    if (logger) {
      logger.error("❌ Не вдалося започаткувати Programmator:", error);
      logger.debug(`Подробиці помилки: ${error.stack}`);
    }
    document.body.setAttribute(
      "data-app-init",
      `error-${error.message.substring(0, 20)}`,
    );
    throw error;
  }
});

// Експорт для можливого зовнішнього використання
export {};
