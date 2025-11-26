// Основна точка входу Програматора шахт
// Ініціалізує додаток при готовності DOM

// Активація глобального захисту від розширень браузера
import { setupGlobalInputProtection } from './core/utils/dom-utils.js';
setupGlobalInputProtection();

// Ініціалізація додатка при готовності DOM
document.addEventListener("DOMContentLoaded", async () => {
  let logger, configureLogger;

  try {
    const loggerModule = await import("./utils/logger.js");
    logger = loggerModule.logger;

    // Налаштовуємо систему логування через logger-config
    const { configureLogger } = await import("./utils/logger-config.js");
    const logLevel = configureLogger();
    logger.debug("Система логування налаштована, рівень:", logLevel);

    logger.info("🚀 EMP (External Mines Programmator) запускається...");
    logger.info("🔧 LZMA стиснення готове з lzma-purejs (режим 7)");

    // Тепер ініціалізуємо додаток
    logger.debug("Завантаження EditorController...");
    document.body.setAttribute("data-app-init", "loading-editor");

    try {
      const { EditorController } = await import(
        "./features/editor/editor-controller.js"
      );
      logger.debug("EditorController вдало імпортовано");
      document.body.setAttribute("data-app-init", "editor-imported");

      const editorController = new EditorController();
      window.editorController = editorController; // Expose for testing
      logger.info("✅ EditorController вдало започатковано");
      logger.debug(
        `Екземпляр EditorController утворено: ${editorController.constructor.name}`
      );
      document.body.setAttribute("data-app-init", "programmator-created");
    } catch (error) {
      logger.error("❌ Не вдалося започаткувати Programmator:", error);
      logger.debug(`Подробиці помилки: ${error.stack}`);
      document.body.setAttribute(
        "data-app-init",
        `error-${error.message.substring(0, 20)}`
      );
      throw error; // Перекидаємо помилку далі без підстрахування
    }
  } catch (error) {
    logger.error("❌ Критична помилка започаткування:", error);
    logger.error("Стек:", error.stack);
    throw error; // Перекидаємо помилку далі без підстрахування
  }
});

// Експорт для можливого зовнішнього використання
export {};
