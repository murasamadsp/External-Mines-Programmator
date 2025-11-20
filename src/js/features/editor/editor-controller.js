// Користувацький інтерфейс Програматора шахт - рефакторинг
// Використовує модульну архітектуру для кращого розділення відповідальності

import {
  ProgAction,
  GRID_WIDTH,
  GRID_HEIGHT,
  MAX_PAGES,
  Program,
  Instruction,
  ProgramFormatVersion,
} from "../../core/index.js";
import { ProgramSerializer } from "../../core/services/serialization/serializer.js";
import { getActionByCode } from "../../core/constants/actions.js";
import {
  ProgramStorage,
  SettingsStorage,
} from "../../utils/helpers/storage.js";
import {
  loggers,
} from "../../utils/index.js";

// Імпорт модулів UI
import { ActionPalette } from "./components/ActionPalette.js";
import { ProgramGrid } from "./components/ProgramGrid.js";
import { Controls } from "./components/Controls.js";
import { DialogManager } from "./components/DialogManager.js";
import { SnippetsPanel } from "./components/SnippetsPanel.js";
import { DragDropManager } from "../../core/services/drag-drop-manager.js";
import { contextMenuManager } from "../../core/services/context-menu-manager.js";

export class EditorController {
  constructor() {
    loggers.ui.info("🏗️ Започаткування EditorController...");

    // Індикатор ініціалізації
    document.body.setAttribute("data-programmator-init", "started");
    console.log("🎯 Конструктор EditorController викликано");

    this.program = new Program();
    this.currentPage = 0; // Номер поточної сторінки (0-15)

    // Автозбереження
    this.autosaveTimer = null;
    this.autosaveInterval = 30000; // 30 секунд
    this.lastSaveHash = null;

    // Перевірка контейнерів лейаута
    const layoutContainer = document.querySelector(".programmer-layout");
    const oldContainer = document.querySelector(".programmer-container");

    if (!layoutContainer && !oldContainer) {
      loggers.ui.error("❌ Не знайдено контейнер програматора!");
      return;
    }

    loggers.ui.info(
      "✅ Знайдено лейаут програматора, продовжуємо ініціалізацію"
    );
    document.body.setAttribute("data-programmator-init", "layout-found");
    console.log("📍 Layout containers found, calling initializeUI");
    this.initializeUI();
  }

  /**
   * Ініціалізація користувацького інтерфейсу
   */
  initializeUI() {
    loggers.ui.info("Налаштування контейнерів лейаута...");
    this.setupLayoutContainers();

    loggers.ui.info("Ініціалізація модулів ІЧ...");
    this.initializeUIModules();

    loggers.ui.info("✅ Ініціалізація Programmator UI завершена!");
  }

  /**
   * Ініціалізує модулі користувацького інтерфейсу
   */
  initializeUIModules() {
    try {
      loggers.ui.info("🎨 Створення палітри діянь...");
      // Палітра діянь
      this.actionPalette = new ActionPalette(this.leftSidebar, actionKey =>
        this.onActionSelected(actionKey)
      );
      this.actionPalette.create();
      loggers.ui.info("✅ Палітру діянь утворено");

      loggers.ui.info("🎯 Створення сітки програми...");
      // Сітка програми
      this.programGrid = new ProgramGrid(
        this.mainContent,
        this.program,
        (x, y) => this.onCellClick(x, y)
      );
      this.programGrid.create();

      // Ініціалізувати Drag & Drop
      this.dragDropManager = new DragDropManager(this.programGrid);

      // Ініціалізувати Context Menu Manager
      // (вже ініціалізовано як singleton, просто перевіряємо)
      if (!contextMenuManager) {
        loggers.ui.error("❌ Context Menu Manager не ініціалізовано");
      }

      loggers.ui.info("✅ Сітку програми утворено");

      loggers.ui.info("🎛️ Створення панелі керування...");
      // Панель керування (тепер у transportContainer)
      this.controls = new Controls(
        this.transportContainer || this.mainContent, // Fallback to mainContent if transport not found
        this.program,
        text => this.onImport(text), // onImport
        format => this.onExport(format), // onExport
        () => this.onValidate(), // onValidate
        () => this.onClear(), // onClear
        direction => this.onPageNavigation(direction) // onPageNavigation
      );
      this.controls.create();
      loggers.ui.info("✅ Панель керування утворено");

      loggers.ui.info("🧩 Створення панелі сніпетів...");
      // Панель сніпетів (у rightSidebar)
      this.snippetsPanel = new SnippetsPanel(this.rightSidebar);
      this.snippetsPanel.create();
      loggers.ui.info("✅ Панель сніпетів утворено");

      loggers.ui.info("💬 Створення менеджера діалогів...");
      // Менеджер діалогів
      this.dialogManager = new DialogManager();
      loggers.ui.info("✅ Менеджера діалогів утворено");

      // Оновлюємо відображення
      this.updatePageDisplay();

      // Запускаємо автозбереження
      this.startAutosave();

      // Перевіряємо наявність автозбереження
      this.restoreAutosave();

      loggers.ui.info("🎉 Усі модулі ІЧ започатковано успішно!");
    } catch (error) {
      loggers.ui.error("❌ Помилка започаткування модулів ІЧ:", error);
      loggers.ui.error("Слід стеку:", error.stack);
      throw error;
    }
  }

  // ==================== CALLBACK METHODS ====================

  /**
   * Обробляє вибір дії в палітрі
   */
  onActionSelected(actionKey) {
    this.selectedAction = actionKey ? ProgAction[actionKey] : null;
    loggers.ui.debug(`🎯 Вибрано дію: ${actionKey} (${this.selectedAction})`);
  }

  /**
   * Отримує назву дії за її кодом
   */
  getActionName(actionCode) {
    if (!actionCode && actionCode !== 0) return "None";
    const actionInfo = getActionByCode(actionCode);
    return actionInfo ? actionInfo.name : `Unknown(${actionCode})`;
  }

  /**
   * Обробляє клік по клітинці сітки
   */
  async onCellClick(x, y) {
    loggers.ui.debug(`🖱️ Клік по клітинці: [${x}, ${y}]`);

    const existingInstruction = this.program.getInstructionAt(
      x,
      y,
      this.currentPage
    );

    // Якщо клітинка не порожня і дія не вибрана - видаляємо інструкцію
    if (
      existingInstruction.action !== ProgAction.None &&
      !this.selectedAction
    ) {
      loggers.ui.info(`🗑️ Видаляємо інструкцію з [${x}, ${y}]`);
      this.program.setInstructionAt(
        x,
        y,
        ProgAction.None,
        null,
        null,
        this.currentPage
      );
      this.programGrid.updateCellDisplay(x, y);
      return;
    }

    // Якщо дія вибрана - розміщуємо її
    if (this.selectedAction) {
      await this.placeActionAt(x, y, this.selectedAction);
    }
  }

  /**
   * Розміщує дію в клітинці з обробкою параметрів
   */
  async placeActionAt(x, y, actionCode) {
    let label = null;
    let value = null;

    loggers.ui.debug(
      `🔧 Розміщення дії ${actionCode} (${this.getActionName(actionCode)}) на [${x}, ${y}]`
    );

    // Перевіряємо, чи потрібен лейбл
    if (this.needsLabel(actionCode)) {
      loggers.ui.info(
        `🏷️ Дія потребує лейбл: ${this.getActionName(actionCode)}`
      );
      label = await this.dialogManager.promptForLabel();
      if (label === null) {
        loggers.ui.info("❌ Введення лейблу скасовано");
        return; // Скасовано
      }
      loggers.ui.info(`✅ Отримано лейбл: "${label}"`);
    }

    // Перевіряємо, чи потрібне значення
    if (this.needsValue(actionCode)) {
      const defaultValue = this.getDefaultValueForAction(actionCode);
      loggers.ui.info(
        `🔢 Дія потребує значення: ${this.getActionName(actionCode)}, за замовчуванням: ${defaultValue}`
      );
      value = await this.dialogManager.promptForNumber(defaultValue);
      if (value === null) {
        loggers.ui.info("❌ Введення значення скасовано");
        return; // Скасовано
      }
      loggers.ui.info(`✅ Отримано значення: ${value}`);
    }

    // Перевіряємо, чи потрібні координати
    if (this.needsCoordinates(actionCode)) {
      loggers.ui.info(
        `📍 Дія потребує координат: ${this.getActionName(actionCode)}`
      );
      const coords = await this.dialogManager.promptForCoordinates();
      if (coords === null) {
        loggers.ui.info("❌ Введення координат скасовано");
        return; // Скасовано
      }
      value = coords;
      loggers.ui.info(`✅ Отримано координати: ${coords}`);
    }

    // Розміщуємо інструкцію
    this.program.setInstructionAt(
      x,
      y,
      actionCode,
      label,
      value,
      this.currentPage
    );
    this.programGrid.updateCellDisplay(x, y);

    loggers.ui.info(`✅ Розміщено дію ${actionCode} в [${x}, ${y}]`);
  }

  /**
   * Імпорт програми
   */
  async onImport(importText) {
    try {
      this.program = await Program.fromString(importText);
      this.programGrid.updateDisplay();
      this.controls.showMessage("✅ Програма імпортована успішно");
      loggers.ui.info(
        `📥 Імпортовано програму з ${this.program.instructions.length} інструкціями`
      );
    } catch (error) {
      loggers.ui.error("❌ Помилка імпорту:", error);
      this.controls.showMessage(`❌ Помилка імпорту: ${error.message}`);
      throw error;
    }
  }

  /**
   * Експорт програми
   */
  async onExport(format) {
    try {
      let result;

      switch (format) {
        case "codes":
          const nonEmptyInstructions = this.program.instructions.filter(
            inst => inst.action !== ProgAction.None
          );
          result = nonEmptyInstructions.map(inst => inst.action).join(" ");
          break;

        case "text":
          result = await ProgramSerializer.encode(
            this.program.instructions,
            ProgramFormatVersion.Version3
          );
          break;

        case "base64":
          result = await this.program.toBase64Format();
          break;

        default:
          throw new Error(`Невідомий формат експорту: ${format}`);
      }

      loggers.ui.info(
        `📤 Експортовано в форматі ${format}, довжина: ${result.length}`
      );
      return result;
    } catch (error) {
      loggers.ui.error(`❌ Помилка експорту в форматі ${format}:`, error);
      throw error;
    }
  }

  /**
   * Валідація програми
   */
  onValidate() {
    const validation = this.program.validate();
    loggers.ui.info("🔍 Результати валідації:", validation);

    if (validation.errors.length > 0) {
      loggers.ui.error("❌ Помилки валідації:", validation.errors);
      const errorMessages = validation.errors
        .map(e => `• ${e.message}`)
        .join("\n");
      this.controls.showMessage(
        `❌ Знайдено помилок: ${validation.errors.length}\n${errorMessages}`
      );
    }

    if (validation.warnings.length > 0) {
      loggers.ui.warn("⚠️ Попередження валідації:", validation.warnings);
      const warningMessages = validation.warnings
        .map(w => `• ${w.message}`)
        .join("\n");
      this.controls.showMessage(
        `⚠️ Попередження: ${validation.warnings.length}\n${warningMessages}`
      );
    }

    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      this.controls.showMessage("✅ Програма валідна!");
    }
  }

  /**
   * Очистка програми
   */
  async onClear() {
    const confirmed = await this.dialogManager.showConfirmDialog(
      "Ви дійсно хочете очистити всю програму?",
      "Очистка програми"
    );

    if (confirmed) {
      this.program.clear();
      this.programGrid.updateDisplay();
      loggers.ui.info("🗑️ Програму очищено");
    }
  }

  /**
   * Експертні налаштування
   */
  onExpertSettings() {
    this.dialogManager.showExpertSettingsDialog(settings => {
      loggers.ui.info("💾 Збережено експертні налаштування:", settings);
      // Тут можна зберегти налаштування в localStorage або застосувати їх
      this.applyExpertSettings(settings);
    });
  }

  /**
   * Навігація по сторінках
   */
  onPageNavigation(direction) {
    if (direction === "prev") {
      this.switchToPrevPage();
    } else if (direction === "next") {
      this.switchToNextPage();
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Перевіряє, чи потрібен лейбл для дії
   */
  needsLabel(actionCode) {
    const result = [
      ProgAction.Goto,
      ProgAction.Call,
      ProgAction.CallArg,
      ProgAction.CallState,
      ProgAction.Label,
      ProgAction.YesNoGoto,
      ProgAction.NoYesGoto,
      ProgAction.DebugPause,
      ProgAction.DebugShow,
      ProgAction.CallWhenDied,
      // Команды переменных тоже могут требовать label для имени переменной
      ProgAction.SetNumberToVar,
      ProgAction.AddNumberToVar,
      ProgAction.MultNumberToVar,
      ProgAction.DivNumberToVar,
      ProgAction.SubNumberToVar,
      ProgAction.VarGreaterThanNumber,
      ProgAction.VarLessThanNumber,
      ProgAction.VarEqualsNumber,
      ProgAction.VarGreaterThanOrEqualNumber,
      ProgAction.VarLessThanOrEqualNumber,
      ProgAction.VarNotEqualsNumber,
    ].includes(actionCode);

    if (result) {
      loggers.ui.debug(
        `🏷️ Команда ${this.getActionName(actionCode)} (${actionCode}) потребує лейбл`
      );
    }

    return result;
  }

  /**
   * Перевіряє, чи потрібне значення для дії
   */
  needsValue(actionCode) {
    const result = [
      // Команды установки переменных
      ProgAction.SetNumberToVar,
      ProgAction.AddNumberToVar,
      ProgAction.MultNumberToVar,
      ProgAction.DivNumberToVar,
      ProgAction.SubNumberToVar,
      // Команды сравнения с числами
      ProgAction.VarGreaterThanNumber,
      ProgAction.VarLessThanNumber,
      ProgAction.VarEqualsNumber,
      ProgAction.VarGreaterThanOrEqualNumber,
      ProgAction.VarLessThanOrEqualNumber,
      ProgAction.VarNotEqualsNumber,
      // Другие команды, которые могут требовать значений
      ProgAction.PlaySound,
    ].includes(actionCode);

    if (result) {
      loggers.ui.debug(
        `🔢 Команда ${this.getActionName(actionCode)} (${actionCode}) потребує значення`
      );
    }

    return result;
  }

  /**
   * Перевіряє, чи потрібні координати для дії
   */
  needsCoordinates(actionCode) {
    return actionCode === ProgAction.Teleport; // Додайте інші дії з координатами
  }

  /**
   * Отримує значення за замовчуванням для дії
   */
  getDefaultValueForAction(actionCode) {
    switch (actionCode) {
      case ProgAction.SetNumberToVar:
        return 0;
      case ProgAction.AddNumberToVar:
      case ProgAction.MultNumberToVar:
      case ProgAction.DivNumberToVar:
      case ProgAction.SubNumberToVar:
        return 1; // Для операций по умолчанию 1
      case ProgAction.PlaySound:
        return 1; // ID звука по умолчанию
      case ProgAction.VarGreaterThanNumber:
      case ProgAction.VarLessThanNumber:
      case ProgAction.VarGreaterThanOrEqualNumber:
      case ProgAction.VarLessThanOrEqualNumber:
        return 0; // Сравнение с 0 по умолчанию
      case ProgAction.VarEqualsNumber:
      case ProgAction.VarNotEqualsNumber:
        return 1; // Равенство/неравенство 1 по умолчанию
      default:
        return 0;
    }
  }

  /**
   * Застосовує експертні налаштування
   */
  applyExpertSettings(settings) {
    // Перевіряємо налаштування автосохранения
    if (settings.hasOwnProperty("autoSave")) {
      if (settings.autoSave) {
        this.startAutosave();
      } else {
        this.stopAutosave();
      }
    }

    // Тут можна додати інші налаштування
    loggers.ui.debug("Застосовано експертні налаштування:", settings);
  }

  /**
   * Налаштування контейнерів лейаута для триколонкового компонування
   */
  setupLayoutContainers() {
    loggers.ui.debug("🔍 Пошук контейнерів лейаута...");

    // Отримуємо контейнери лейаута
    this.leftSidebar = document.querySelector(".programmer-sidebar-left");
    this.mainContent = document.querySelector(".programmer-main");
    this.rightSidebar = document.querySelector(".programmer-sidebar-right");
    this.transportContainer = document.querySelector("#transport-panel-container");

    loggers.ui.debug(`📍 Знайдено елементів:`);
    loggers.ui.debug(`  - Left sidebar: ${this.leftSidebar ? "✅" : "❌"}`);
    loggers.ui.debug(`  - Main content: ${this.mainContent ? "✅" : "❌"}`);
    loggers.ui.debug(`  - Right sidebar: ${this.rightSidebar ? "✅" : "❌"}`);

    if (!this.leftSidebar || !this.mainContent || !this.rightSidebar) {
      loggers.ui.warn(
        "⚠️ Деякі контейнери лейаута не знайдено, перевірка резервних..."
      );

      // Перевіряємо всі можливі селектори
      const selectors = [
        ".programmer-sidebar-left",
        ".programmer-main",
        ".programmer-sidebar-right",
        ".programmer-layout",
        ".programmer-container",
        ".container",
      ];

      loggers.ui.debug("🔍 Перевірка всіх можливих контейнерів:");
      selectors.forEach(selector => {
        const element = document.querySelector(selector);
        loggers.ui.debug(`  ${selector}: ${element ? "✅" : "❌"}`);
      });

      // Відкат до старого одинарного контейнера
      const fallbackContainer =
        document.querySelector(".programmer-container") ||
        document.querySelector(".container") ||
        document.body;

      this.leftSidebar =
        this.mainContent =
        this.rightSidebar =
          fallbackContainer;

      if (!this.leftSidebar) {
        loggers.ui.error(
          "❌ Жодні контейнери не знайдено! DOM структура пошкоджена."
        );
        loggers.ui.error(
          "📄 Поточний вміст body:",
          document.body.innerHTML.substring(0, 500)
        );
        throw new Error("Cannot find any container elements in DOM");
      }

      loggers.ui.warn(
        "⚠️ Використовується резервний контейнер:",
        this.leftSidebar.tagName
      );
    } else {
      loggers.ui.debug("✅ Усі контейнери лейаута знайдено успішно");
    }
  }

  // ==================== NAVIGATION METHODS ====================

  /**
   * Switch to the previous page
   */
  switchToPrevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.programGrid.setCurrentPage(this.currentPage);
      this.updatePageDisplay();
      this.programGrid.updateDisplay();
      loggers.ui.info(`📄 Переключено на сторінку ${this.currentPage}`);
    }
  }

  /**
   * Switch to the next page
   */
  switchToNextPage() {
    if (this.currentPage < MAX_PAGES - 1) {
      this.currentPage++;
      this.programGrid.setCurrentPage(this.currentPage);
      this.updatePageDisplay();
      this.programGrid.updateDisplay();
      loggers.ui.info(`📄 Переключено на сторінку ${this.currentPage}`);
    }
  }

  /**
   * Update page display and controls
   */
  updatePageDisplay() {
    // Оновлюємо індикатор сторінки в controls
    if (this.controls) {
      this.controls.updatePageIndicator(this.currentPage, MAX_PAGES);
    }
  }

  // ==================== AUTOSAVE METHODS ====================

  /**
   * Запускає автоматичне збереження
   */
  startAutosave() {
    // Перевіряємо, чи увімкнено автозбереження в налаштуваннях
    const autoSaveEnabled = SettingsStorage.get("autoSave", true);

    if (!autoSaveEnabled) {
      loggers.ui.info("⏸️ Автозбереження вимкнено в налаштуваннях");
      return;
    }

    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
    }

    this.autosaveTimer = setInterval(() => {
      this.performAutosave();
    }, this.autosaveInterval);

    loggers.ui.info(
      `⏰ Автозбереження запущено (інтервал: ${this.autosaveInterval / 1000} сек)`
    );
  }

  /**
   * Зупиняє автоматичне збереження
   */
  stopAutosave() {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
      loggers.ui.info("⏸️ Автозбереження зупинено");
    }
  }

  /**
   * Виконує автоматичне збереження
   */
  performAutosave() {
    try {
      const instructions = this.program.instructions;
      const currentHash = this.calculateProgramHash(instructions);

      // Перевіряємо, чи змінилася програма
      if (currentHash === this.lastSaveHash) {
        return; // Немає змін
      }

      const success = ProgramStorage.autosave(instructions);

      if (success) {
        this.lastSaveHash = currentHash;
        loggers.ui.debug(
          `💾 Автозбереження виконано успішно (${instructions.length} інструкцій)`
        );
      } else {
        loggers.ui.warn("⚠️ Помилка автозбереження");
      }
    } catch (error) {
      loggers.ui.error("❌ Критична помилка автозбереження:", error);
    }
  }

  /**
   * Розраховує хеш програми для перевірки змін
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
    try {
      const autosaveData = ProgramStorage.loadAutosave();

      if (autosaveData && autosaveData.instructions) {
        // Питаємо користувача про відновлення
        const shouldRestore = await this.dialogManager.showConfirmDialog(
          "Знайдено автосохранену програму. Відновити її?\n\n" +
            `Збережено: ${new Date(autosaveData.timestamp).toLocaleString()}\n` +
            `Інструкцій: ${autosaveData.instructions.length}`,
          "Відновлення програми"
        );

        if (shouldRestore) {
          // Відновлюємо програму
          this.program.clear();
          autosaveData.instructions.forEach((instruction, index) => {
            if (instruction && instruction.action !== undefined) {
              this.program.setInstructionAt(
                index % GRID_WIDTH,
                Math.floor(index / GRID_WIDTH),
                instruction.action,
                instruction.param1,
                instruction.param2,
                Math.floor(index / (GRID_WIDTH * GRID_HEIGHT))
              );
            }
          });

          this.updatePageDisplay();
          this.programGrid.updateDisplay();

          loggers.ui.info(
            `🔄 Автосохранена програма відновлена (${autosaveData.instructions.length} інструкцій)`
          );

          // Очищаємо автозбереження після успішного відновлення
          ProgramStorage.clearAutosave();
        }
      }
    } catch (error) {
      loggers.ui.error("❌ Помилка відновлення автозбереження:", error);
    }
  }
}
