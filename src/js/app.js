// Основна точка входу Програматора шахт
// Ініціалізує додаток при готовності DOM

console.log("🚀 EMP: app.js loaded successfully");

// Ініціалізація додатка при готовності DOM
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🎯 EMP: DOMContentLoaded fired - starting initialization");

  let logger, configureLogger;

  try {
    console.log("📦 EMP: Step 1 - Loading logger only...");
    const loggerModule = await import("./utils/logger.js");
    console.log("✅ EMP: Step 1 - Logger loaded");

    logger = loggerModule.logger;
    configureLogger = loggerModule.initLogger;
    console.log("✅ EMP: Logger system initialized");

    // Налаштовуємо систему логування
    const logLevel = configureLogger();
    console.log("✅ EMP: Logger configured, level:", logLevel);

    logger.info("🚀 EMP (External Mines Programmator) запускається...");
    logger.info("🔧 LZMA стиснення готове з lzma-purejs (режим 7)");

    // Тепер ініціалізуємо додаток
    console.log("📱 EMP: Loading EditorController...");
    document.body.setAttribute("data-app-init", "loading-editor");

    try {
      const { EditorController } = await import(
        "./features/editor/editor-controller.js"
      );
      console.log("✅ EMP: EditorController вдало імпортовано");
      document.body.setAttribute("data-app-init", "editor-imported");

      let editorController;

      editorController = new EditorController();
      logger.info("✅ EditorController вдало започатковано");
      logger.debug(
        `Екземпляр EditorController утворено: ${editorController.constructor.name}`
      );
      console.log("🎉 EMP: EditorController вдало започатковано!");
      document.body.setAttribute("data-app-init", "programmator-created");
    } catch (error) {
      logger.error("❌ Не вдалося започаткувати Programmator:", error);
      logger.debug(`Подробиці помилки: ${error.stack}`);
      console.error(
        "❌ EMP: Започаткування EditorController зазнало невдачі:",
        error
      );
      document.body.setAttribute(
        "data-app-init",
        `error-${error.message.substring(0, 20)}`
      );
      throw error; // Перекидаємо помилку далі без підстрахування
    }
  } catch (error) {
    console.error("❌ EMP: Критична помилка започаткування:", error);
    console.error("Стек:", error.stack);
    throw error; // Перекидаємо помилку далі без підстрахування
  }
});

// Експорт для можливого зовнішнього використання
export {};
