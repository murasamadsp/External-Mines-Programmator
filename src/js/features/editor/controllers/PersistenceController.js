// PersistenceController - відповідає за збереження та завантаження програм
// Принцип єдиної відповідальності: тільки persistence операції

import { Program } from "../../../core/models/program.js";
import {
  ProgramStorage,
  SettingsStorage,
} from "../../../utils/helpers/storage.js";
import { ProgAction } from "../../../core/constants/actions.js";
import { loggers } from "../../../utils/logging/logger.js";

export class PersistenceController {
  constructor(program, uiController, dialogController) {
    this.program = program;
    this.uiController = uiController;
    this.dialogController = dialogController;

    // Автозбереження
    this.autosaveTimer = null;
    this.autosaveInterval = 30000; // 30 секунд
    this.lastSaveHash = null;
    this.isDestroyed = false;
  }

  /**
   * Імпорт програми з тексту
   * @param importText
   */
  async onImport(importText) {
    const startTime = performance.now();
    try {
      loggers.editor.info(
        `📥 Початок імпорту (розмір тексту: ${importText.length} символів)...`,
      );
      loggers.editor.debug(
        `Import text preview: ${importText.substring(0, 200)}...`,
      );

      // Завантажуємо програму з рядка
      const newProgram = await Program.fromString(importText);

      // Просто замінюємо посилання на програму
      // Program.fromString вже правильно створює всі інструкції
      this.program.instructions = newProgram.instructions;

      // Оновлюємо посилання в UI компонентах
      if (this.uiController.programGrid) {
        this.uiController.programGrid.program = this.program;
      }

      const importTime = performance.now() - startTime;
      const instructionCount = this.program.instructions.length;
      const nonEmptyCount = this.program.instructions.filter(
        inst => inst.action !== ProgAction.None,
      ).length;

      // Оновлюємо відображення сітки
      this.uiController.updateGridDisplay();
      this.uiController.showFeedback(
        "✅ Програма імпортована успішно",
        "success",
      );

      loggers.editor.info(
        `📥 Імпортована програма: ${instructionCount} інструкцій (${nonEmptyCount} не порожніх) за ${importTime.toFixed(2)}ms`,
      );
    } catch (error) {
      const errorTime = performance.now() - startTime;
      loggers.editor.error(
        `❌ Помилка імпорту після ${errorTime.toFixed(2)}ms:`,
      );
      loggers.editor.error(
        `Error message: ${error?.message || "Unknown error"}`,
      );
      loggers.editor.error(`Error name: ${error?.name || "Unknown"}`);
      loggers.editor.error("Full error:", error);
      if (error?.stack) {
        loggers.editor.error("Stack trace:", error.stack);
      }
      this.uiController.showFeedback(
        `❌ Помилка імпорту: ${error?.message || "Unknown error"}`,
        "error",
      );
      throw error;
    }
  }

  /**
   * Експорт програми в різних форматах
   * @param format
   */
  async onExport(format) {
    const startTime = performance.now();
    try {
      loggers.editor.info(`📤 Початок експорту в форматі ${format}...`);

      let result;
      const instructionCount = this.program.instructions.length;
      const nonEmptyCount = this.program.instructions.filter(
        inst => inst.action !== ProgAction.None,
      ).length;

      switch (format) {
        case "codes":
          const nonEmptyInstructions = this.program.instructions.filter(
            inst => inst.action !== ProgAction.None,
          );
          result = nonEmptyInstructions.map(inst => inst.action).join(" ");
          loggers.editor.debug(
            `📋 Експорт кодів: ${nonEmptyCount} інструкцій → ${result.length} символів`,
          );
          break;

        case "text":
        case "base64":
          result = await this.program.toBase64Format();
          loggers.editor.debug(
            `📦 Експорт Base64: ${instructionCount} інструкцій → ${result.length} символів`,
          );
          break;

        default:
          throw new Error(`Невідомий формат експорту: ${format}`);
      }

      const exportTime = performance.now() - startTime;
      loggers.editor.info(
        `📤 Експортовано в форматі ${format}: ${result.length} символів за ${exportTime.toFixed(2)}ms`,
      );
      return result;
    } catch (error) {
      const errorTime = performance.now() - startTime;
      loggers.editor.error(
        `❌ Помилка експорту в форматі ${format} після ${errorTime.toFixed(2)}ms:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Валідація програми
   */
  onValidate() {
    const startTime = performance.now();
    const instructionCount = this.program.instructions.length;
    const nonEmptyCount = this.program.instructions.filter(
      inst => inst.action !== ProgAction.None,
    ).length;

    loggers.validation.info(
      `🔍 Початок валідації: ${instructionCount} інструкцій (${nonEmptyCount} не порожніх)`,
    );

    const validation = this.program.validate();
    const validationTime = performance.now() - startTime;

    loggers.validation.info(
      `🔍 Результати валідації: ${validation.errors.length} помилок, ${validation.warnings.length} попереджень (за ${validationTime.toFixed(2)}ms)`,
    );

    if (validation.errors.length > 0) {
      loggers.validation.error(
        `❌ Знайдено ${validation.errors.length} помилок валідації:`,
        validation.errors,
      );
      const errorMessages = validation.errors
        .map(e => `• ${e.message}`)
        .join("\n");
      this.uiController.showFeedback(
        `❌ Знайдено помилок: ${validation.errors.length}\n${errorMessages}`,
        "error",
      );
    }

    if (validation.warnings.length > 0) {
      loggers.validation.warn(
        `⚠️ Знайдено ${validation.warnings.length} попереджень валідації:`,
        validation.warnings,
      );
      const warningMessages = validation.warnings
        .map(w => `• ${w.message}`)
        .join("\n");
      this.uiController.showFeedback(
        `⚠️ Попередження: ${validation.warnings.length}\n${warningMessages}`,
        "info",
      );
    }

    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      loggers.validation.info(
        "✅ Програма пройшла валідацію без помилок та попереджень",
      );
      this.uiController.showFeedback("✅ Програма валідна!", "success");
    }
  }

  /**
   * Очистка програми
   */
  async onClear() {
    const startTime = performance.now();
    const instructionCount = this.program.instructions.length;
    const nonEmptyCount = this.program.instructions.filter(
      inst => inst.action !== ProgAction.None,
    ).length;

    loggers.editor.debug(
      `🗑️ Запит на очистку програми (${instructionCount} інструкцій, ${nonEmptyCount} не порожніх)`,
    );

    const confirmed = await this.dialogController.showConfirmDialog(
      "Ви дійсно хочете очистити всю програму?",
      "Очистка програми",
    );

    if (confirmed) {
      this.program.clear();
      this.uiController.updateGridDisplay();

      // Очищаємо автозбереження після очищення програми
      ProgramStorage.clearAutosave();
      this.lastSaveHash = null;

      const clearTime = performance.now() - startTime;
      loggers.editor.info(
        `🗑️ Програму очищено: видалено ${nonEmptyCount} інструкцій за ${clearTime.toFixed(2)}ms`,
      );
    } else {
      loggers.editor.debug("❌ Очистку програми скасовано користувачем");
    }
  }

  /**
   * Запускає автоматичне збереження
   */
  startAutosave() {
    // Перевіряємо, чи увімкнено автозбереження в налаштуваннях
    const autoSaveEnabled = SettingsStorage.get("autoSave", true);

    if (!autoSaveEnabled) {
      loggers.editor.info(
        "⏸️ Автозбереження вимкнено в налаштуваннях користувача",
      );
      return;
    }

    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      loggers.editor.debug("🔄 Перезапуск таймера автозбереження");
    }

    this.autosaveTimer = setInterval(() => {
      if (!this.isDestroyed) {
        this.performAutosave();
      }
    }, this.autosaveInterval);

    loggers.editor.info(
      `⏰ Автозбереження запущено (інтервал: ${this.autosaveInterval / 1000} сек)`,
    );
  }

  /**
   * Зупиняє автоматичне збереження
   */
  stopAutosave() {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
      loggers.editor.info("⏸️ Автозбереження зупинено");
    }
  }

  /**
   * Виконує автоматичне збереження
   */
  performAutosave() {
    if (this.isDestroyed) return;

    const startTime = performance.now();
    try {
      const { instructions } = this.program;

      // Не зберігаємо якщо немає інструкцій
      if (instructions.length === 0) {
        loggers.editor.debug(
          "🔄 Автозбереження: немає інструкцій для збереження",
        );
        return;
      }

      const currentHash = this.calculateProgramHash(instructions);

      // Перевіряємо, чи змінилася програма
      if (currentHash === this.lastSaveHash) {
        loggers.editor.debug(
          "🔄 Автозбереження: немає змін з останнього збереження",
        );
        return; // Немає змін
      }

      loggers.editor.debug(
        `💾 Виконання автозбереження (${instructions.length} інструкцій)...`,
      );
      const success = ProgramStorage.autosave(instructions);

      if (success) {
        this.lastSaveHash = currentHash;
        const saveTime = performance.now() - startTime;
        loggers.editor.debug(
          `💾 Автозбереження виконано успішно: ${instructions.length} інструкцій за ${saveTime.toFixed(2)}ms`,
        );
      } else {
        loggers.editor.warn("⚠️ Помилка автозбереження - дані не збережено");
      }
    } catch (error) {
      const errorTime = performance.now() - startTime;
      loggers.editor.error(
        `❌ Критична помилка автозбереження після ${errorTime.toFixed(2)}ms:`,
        error,
      );
    }
  }

  /**
   * Розраховує хеш програми для перевірки змін
   * @param instructions
   */
  calculateProgramHash(instructions) {
    const data = JSON.stringify(instructions);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Відновлює автосохранену програму
   */
  async restoreAutosave() {
    if (this.isDestroyed) return;

    try {
      const autosaveData = ProgramStorage.loadAutosave();

      // Не показуємо діалог якщо немає інструкцій для відновлення
      if (
        autosaveData &&
        autosaveData.instructions &&
        autosaveData.instructions.length > 0
      ) {
        // Питаємо користувача про відновлення
        const shouldRestore = await this.dialogController.showConfirmDialog(
          "Знайдено автосохранену програму. Відновити її?\n\n" +
            `Збережено: ${new Date(autosaveData.timestamp).toLocaleString()}\n` +
            `Інструкцій: ${autosaveData.instructions.length}`,
          "Відновлення програми",
        );

        if (shouldRestore) {
          // Відновлюємо програму
          this.program.clear();
          autosaveData.instructions.forEach((instruction, index) => {
            if (instruction && instruction.action !== undefined) {
              const x = index % 16; // GRID_WIDTH
              const y = Math.floor(index / 16) % 15; // GRID_HEIGHT
              const page = Math.floor(index / (16 * 15)); // GRID_WIDTH * GRID_HEIGHT
              this.program.setInstructionAt(
                x,
                y,
                instruction.action,
                instruction.param1,
                instruction.param2,
                page,
              );
            }
          });

          this.uiController.updatePageDisplay(0, 16); // MAX_PAGES
          this.uiController.updateGridDisplay();

          loggers.editor.info(
            `🔄 Автосохранена програма відновлена (${autosaveData.instructions.length} інструкцій)`,
          );

          // Очищаємо автозбереження після успішного відновлення
          ProgramStorage.clearAutosave();
        }
      }
    } catch (error) {
      loggers.editor.error("❌ Помилка відновлення автозбереження:", error);
    }
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
        this.startAutosave();
      } else {
        this.stopAutosave();
      }
    }

    // Тут можна додати інші налаштування
    loggers.editor.debug(
      "✅ Експертні налаштування застосовано успішно:",
      settings,
    );
  }

  /**
   * Очищає ресурси контролера збереження
   */
  destroy() {
    loggers.editor.debug("🧹 Очищення PersistenceController...");
    this.isDestroyed = true;
    this.stopAutosave();
    this.program = null;
    this.uiController = null;
    this.dialogController = null;
    loggers.editor.debug("✅ PersistenceController очищено");
  }
}
