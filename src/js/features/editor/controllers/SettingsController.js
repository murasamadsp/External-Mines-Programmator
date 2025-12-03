// SettingsController - відповідає за керування налаштуваннями
// Принцип єдиної відповідальності: тільки налаштування та їх застосування

import { SettingsStorage } from "../../../utils/helpers/storage.js";
import { loggers } from "../../../utils/logging/logger.js";

export class SettingsController {
  constructor(persistenceController, dialogController) {
    this.persistenceController = persistenceController;
    this.dialogController = dialogController;
  }

  /**
   * Показує діалог експертних налаштувань
   */
  async showExpertSettingsDialog() {
    const currentSettings = this.getCurrentSettings();

    const callback = settings => {
      this.applyExpertSettings(settings);
    };

    await this.dialogController.showExpertSettingsDialog(callback);
  }

  /**
   * Застосовує експертні налаштування
   * @param settings
   */
  applyExpertSettings(settings) {
    loggers.editor.debug(
      `🔧 Застосування експертних налаштувань: ${Object.keys(settings).length} параметрів`,
    );

    // Перевіряємо налаштування автосохранения
    if (settings.hasOwnProperty("autoSave")) {
      const autoSaveEnabled = settings.autoSave;
      loggers.editor.debug(
        `⏰ Автозбереження: ${autoSaveEnabled ? "увімкнено" : "вимкнено"}`,
      );

      if (autoSaveEnabled) {
        this.persistenceController.startAutosave();
      } else {
        this.persistenceController.stopAutosave();
      }
    }

    // Зберігаємо налаштування
    Object.keys(settings).forEach(key => {
      SettingsStorage.set(key, settings[key]);
    });

    // Тут можна додати інші налаштування
    loggers.editor.debug(
      "✅ Експертні налаштування застосовано успішно:",
      settings,
    );
  }

  /**
   * Скидає налаштування до значень за замовчуванням
   */
  resetToDefaults() {
    loggers.editor.debug("🔄 Скидання налаштувань до значень за замовчуванням");

    const defaultSettings = {
      autoSave: true,
      // Додайте інші налаштування за замовчуванням
    };

    this.applyExpertSettings(defaultSettings);
  }

  /**
   * Отримує поточні налаштування
   */
  getCurrentSettings() {
    return {
      autoSave: SettingsStorage.get("autoSave", true),
      // Додайте інші налаштування тут
    };
  }

  /**
   * Очищає ресурси контролера налаштувань
   */
  destroy() {
    loggers.editor.debug("🧹 Очищення SettingsController...");
    this.persistenceController = null;
    this.dialogController = null;
    loggers.editor.debug("✅ SettingsController очищено");
  }
}



