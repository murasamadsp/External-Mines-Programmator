// DialogController - відповідає за управління діалогами
// Принцип єдиної відповідальності: тільки діалоги та їх обробка

import { loggers } from "../../../utils/logging/logger.js";

export class DialogController {
  constructor(dialogManager) {
    this.dialogManager = dialogManager;
  }

  /**
   * Показує діалог підтвердження
   * @param message
   * @param title
   */
  async showConfirmDialog(message, title = "Підтвердження") {
    try {
      loggers.editor.debug(`💬 Показуємо діалог підтвердження: "${title}"`);
      const result = await this.dialogManager.showConfirmDialog(message, title);
      loggers.editor.debug(`✅ Діалог підтвердження: ${result ? "Так" : "Ні"}`);
      return result;
    } catch (error) {
      loggers.editor.error("❌ Помилка показу діалогу підтвердження:", error);
      throw error;
    }
  }

  /**
   * Запитує лейбл у користувача
   * @param defaultValue
   */
  async promptForLabel(defaultValue = "") {
    try {
      loggers.editor.debug("🏷️ Запит лейблу у користувача");
      const result = await this.dialogManager.promptForLabel(defaultValue);
      loggers.editor.debug(`✅ Отримано лейбл: "${result}"`);
      return result;
    } catch (error) {
      loggers.editor.error("❌ Помилка запиту лейблу:", error);
      throw error;
    }
  }

  /**
   * Запитує число у користувача
   * @param defaultValue
   */
  async promptForNumber(defaultValue = 0) {
    try {
      loggers.editor.debug(
        `🔢 Запит числа у користувача (за замовчуванням: ${defaultValue})`,
      );
      const result = await this.dialogManager.promptForNumber(defaultValue);
      loggers.editor.debug(`✅ Отримано число: ${result}`);
      return result;
    } catch (error) {
      loggers.editor.error("❌ Помилка запиту числа:", error);
      throw error;
    }
  }

  /**
   * Запитує два лейбли у користувача (для порівняння змінних)
   */
  async promptForTwoLabels() {
    try {
      loggers.editor.debug("🏷️🏷️ Запит двох лейблів у користувача");
      const result = await this.dialogManager.promptForTwoLabels();
      loggers.editor.debug(
        `✅ Отримано лейбли: "${result?.label1}" та "${result?.label2}"`,
      );
      return result;
    } catch (error) {
      loggers.editor.error("❌ Помилка запиту двох лейблів:", error);
      throw error;
    }
  }

  /**
   * Запитує координати у користувача
   */
  async promptForCoordinates() {
    try {
      loggers.editor.debug("📍 Запит координат у користувача");
      const result = await this.dialogManager.promptForCoordinates();
      loggers.editor.debug(`✅ Отримано координати: ${result}`);
      return result;
    } catch (error) {
      loggers.editor.error("❌ Помилка запиту координат:", error);
      throw error;
    }
  }

  /**
   * Показує діалог експертних налаштувань
   * @param callback
   */
  async showExpertSettingsDialog(callback) {
    try {
      loggers.editor.debug("⚙️ Показуємо діалог експертних налаштувань");
      await this.dialogManager.showExpertSettingsDialog(callback);
      loggers.editor.debug("✅ Діалог експертних налаштувань завершено");
    } catch (error) {
      loggers.editor.error("❌ Помилка діалогу експертних налаштувань:", error);
      throw error;
    }
  }

  /**
   * Показує інформаційний діалог
   * @param message
   * @param title
   */
  async showInfoDialog(message, title = "Інформація") {
    try {
      loggers.editor.debug(`ℹ️ Показуємо інформаційний діалог: "${title}"`);
      await this.dialogManager.showInfoDialog(message, title);
      loggers.editor.debug("✅ Інформаційний діалог показано");
    } catch (error) {
      loggers.editor.error("❌ Помилка інформаційного діалогу:", error);
      throw error;
    }
  }

  /**
   * Очищає ресурси діалогового контролера
   */
  destroy() {
    loggers.editor.debug("🧹 Очищення DialogController...");
    // DialogManager може мати власні методи очищення
    if (
      this.dialogManager &&
      typeof this.dialogManager.destroy === "function"
    ) {
      this.dialogManager.destroy();
    }
    this.dialogManager = null;
    loggers.editor.debug("✅ DialogController очищено");
  }
}
