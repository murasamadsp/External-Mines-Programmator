// Користувацький інтерфейс Програматора шахт - рефакторинг
// Використовує модульну архітектуру для кращого розділення відповідальності

import { ProgAction } from "../../core/constants/actions.js";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  MAX_PAGES,
} from "../../core/constants/grid.js";
import { Program, Instruction } from "../../core/models/program.js";
import { ProgramSerializer } from "../../core/services/serialization/serializer.js";
import { getActionByCode } from "../../core/constants/actions.js";
import {
  ProgramStorage,
  SettingsStorage,
} from "../../utils/helpers/storage.js";
import { loggers } from "../../utils/index.js";

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
    const startTime = performance.now();
    loggers.editor.info("🏗️ Започаткування EditorController...");

    // Індикатор ініціалізації
    document.body.setAttribute("data-programmator-init", "started");
    console.log("🎯 Конструктор EditorController викликано");

    this.program = new Program();
    this.currentPage = 0; // Номер поточної сторінки (0-15)

    const constructorTime = performance.now() - startTime;
    loggers.editor.debug(
      `⏱️ Конструктор EditorController виконано за ${constructorTime.toFixed(2)}ms`,
    );

    // Автозбереження
    this.autosaveTimer = null;
    this.autosaveInterval = 30000; // 30 секунд
    this.lastSaveHash = null;

    // Синхронізація висоти при зміні розміру вікна
    window.addEventListener("resize", () => {
      this.syncSidebarHeight();
    });

    // Перевірка контейнерів лейаута
    const layoutContainer = document.querySelector(".programmer-layout");
    const oldContainer = document.querySelector(".programmer-container");

    if (!layoutContainer && !oldContainer) {
      loggers.editor.error("❌ Не знайдено контейнер програматора!");
      return;
    }

    loggers.editor.info(
      "✅ Знайдено лейаут програматора, продовжуємо ініціалізацію",
    );
    document.body.setAttribute("data-programmator-init", "layout-found");
    console.log("📍 Layout containers found, calling initializeUI");
    this.initializeUI();
  }

  /**
   * Синхронізує висоту бічних панелей з висотою сітки програми
   */
  syncSidebarHeight() {
    try {
      const programGrid = document.getElementById("program-grid");
      if (programGrid) {
        const gridHeight = programGrid.offsetHeight;
        document.documentElement.style.setProperty(
          "--program-grid-height",
          `${gridHeight}px`,
        );
        loggers.editor.debug(
          `🔄 Синхронізовано висоту бічних панелей: ${gridHeight}px`,
        );
      }
    } catch (error) {
      loggers.editor.error(
        "❌ Помилка синхронізації висоти бічних панелей:",
        error,
      );
    }
  }

  /**
   * Ініціалізація користувацького інтерфейсу
   */
  initializeUI() {
    const startTime = performance.now();
    loggers.editor.info("🔧 Початок ініціалізації UI інтерфейсу...");

    loggers.editor.info("📐 Налаштування контейнерів лейаута...");
    this.setupLayoutContainers();

    loggers.editor.info("🎮 Ініціалізація модулів інтерфейсу...");
    this.initializeUIModules();

    const totalTime = performance.now() - startTime;
    loggers.editor.info(
      `✅ Ініціалізація UI завершена за ${totalTime.toFixed(2)}ms`,
    );
  }

  /**
   * Ініціалізує модулі користувацького інтерфейсу
   */
  initializeUIModules() {
    const modulesStartTime = performance.now();
    try {
      // Палітра діянь
      const paletteStartTime = performance.now();
      loggers.editor.info("🎨 Створення палітри діянь...");
      this.actionPalette = new ActionPalette(this.leftSidebar, (actionKey) =>
        this.onActionSelected(actionKey),
      );
      this.actionPalette.create();
      const paletteTime = performance.now() - paletteStartTime;
      loggers.editor.info(
        `✅ Палітру діянь утворено (${paletteTime.toFixed(2)}ms)`,
      );

      // Сітка програми
      const gridStartTime = performance.now();
      loggers.editor.info("🎯 Створення сітки програми...");
      this.programGrid = new ProgramGrid(
        this.mainContent,
        this.program,
        (x, y) => this.onCellClick(x, y),
      );
      this.programGrid.create();

      // Синхронізувати висоту бічних панелей з висотою сітки
      this.syncSidebarHeight();

      const gridTime = performance.now() - gridStartTime;
      loggers.editor.debug(
        `📊 Сітка створена: ${this.program.instructions.length} інструкцій завантажено`,
      );

      // Ініціалізувати Drag & Drop
      loggers.editor.debug("🎮 Ініціалізація Drag & Drop менеджера...");
      this.dragDropManager = new DragDropManager(this.programGrid);

      // Ініціалізувати Context Menu Manager
      if (!contextMenuManager) {
        loggers.editor.error(
          "❌ Context Menu Manager не ініціалізовано - функціонал контекстного меню буде обмежено",
        );
      } else {
        loggers.editor.debug("✅ Context Menu Manager готовий до роботи");
      }

      loggers.editor.info(
        `✅ Сітку програми утворено (${gridTime.toFixed(2)}ms)`,
      );

      // Панель керування
      const controlsStartTime = performance.now();
      loggers.editor.info("🎛️ Створення панелі керування...");
      const controlsContainer = this.transportContainer || this.mainContent;
      loggers.editor.debug(
        `📍 Панель керування буде розміщена в: ${controlsContainer === this.transportContainer ? "transport container" : "main content"}`,
      );

      this.controls = new Controls(
        controlsContainer,
        this.program,
        (text) => this.onImport(text), // onImport
        (format) => this.onExport(format), // onExport
        () => this.onValidate(), // onValidate
        () => this.onClear(), // onClear
        (direction) => this.onPageNavigation(direction), // onPageNavigation
      );
      this.controls.create();
      const controlsTime = performance.now() - controlsStartTime;
      loggers.editor.info(
        `✅ Панель керування утворено (${controlsTime.toFixed(2)}ms)`,
      );

      // Панель сніпетів
      const snippetsStartTime = performance.now();
      loggers.editor.info("🧩 Створення панелі сніпетів...");
      this.snippetsPanel = new SnippetsPanel(this.rightSidebar);
      this.snippetsPanel.create();
      const snippetsTime = performance.now() - snippetsStartTime;
      loggers.editor.info(
        `✅ Панель сніпетів утворено (${snippetsTime.toFixed(2)}ms)`,
      );

      // Менеджер діалогів
      const dialogsStartTime = performance.now();
      loggers.editor.info("💬 Створення менеджера діалогів...");
      this.dialogManager = new DialogManager();
      const dialogsTime = performance.now() - dialogsStartTime;
      loggers.editor.info(
        `✅ Менеджера діалогів утворено (${dialogsTime.toFixed(2)}ms)`,
      );

      // Оновлюємо відображення
      this.updatePageDisplay();

      // Запускаємо автозбереження
      loggers.editor.debug(
        `⏰ Запуск автозбереження (інтервал: ${this.autosaveInterval}ms)`,
      );
      this.startAutosave();

      // Перевіряємо наявність автозбереження
      loggers.editor.debug("🔍 Перевірка автозбереження...");
      this.restoreAutosave();

      const totalModulesTime = performance.now() - modulesStartTime;
      loggers.editor.info(
        `🎉 Усі модулі інтерфейсу започатковано успішно (загальний час: ${totalModulesTime.toFixed(2)}ms)!`,
      );
    } catch (error) {
      loggers.editor.error("❌ Помилка започаткування модулів ІЧ:", error);
      loggers.editor.error("Слід стеку:", error.stack);
      throw error;
    }
  }

  // ==================== CALLBACK METHODS ====================

  /**
   * Обробляє вибір дії в палітрі
   */
  onActionSelected(actionKey) {
    this.selectedAction = actionKey ? ProgAction[actionKey] : null;
    loggers.editor.debug(
      `🎯 Вибрано дію: ${actionKey} (${this.selectedAction})`,
    );
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
    loggers.editor.debug(
      `🖱️ Клік по клітинці: [${x}, ${y}] (сторінка ${this.currentPage})`,
    );

    const existingInstruction = this.program.getInstructionAt(
      x,
      y,
      this.currentPage,
    );

    // Якщо клітинка не порожня і дія не вибрана - видаляємо інструкцію
    if (
      existingInstruction.action !== ProgAction.None &&
      !this.selectedAction
    ) {
      const actionName = this.getActionName(existingInstruction.action);
      loggers.editor.info(
        `🗑️ Видаляємо інструкцію "${actionName}" з [${x}, ${y}]`,
      );
      this.program.setInstructionAt(
        x,
        y,
        ProgAction.None,
        null,
        null,
        this.currentPage,
      );
      this.programGrid.updateCellDisplay(x, y);
      loggers.editor.debug(`✅ Інструкцію видалено, клітинка тепер порожня`);
      return;
    }

    // Якщо дія вибрана - розміщуємо її
    if (this.selectedAction) {
      await this.placeActionAt(x, y, this.selectedAction);
    } else {
      loggers.editor.debug(
        `ℹ️ Клік по порожній клітинці без вибраної дії - ігнорується`,
      );
    }
  }

  /**
   * Розміщує дію в клітинці з обробкою параметрів
   */
  async placeActionAt(x, y, actionCode) {
    const startTime = performance.now();
    let label = null;
    let value = null;

    const actionName = this.getActionName(actionCode);
    loggers.editor.debug(
      `🔧 Розміщення дії ${actionCode} (${actionName}) на [${x}, ${y}] (сторінка ${this.currentPage})`,
    );

    // Перевіряємо, чи потрібен лейбл
    if (this.needsLabel(actionCode)) {
      loggers.editor.info(
        `🏷️ Дія потребує лейбл: ${this.getActionName(actionCode)}`,
      );
      label = await this.dialogManager.promptForLabel();
      if (label === null) {
        loggers.editor.info("❌ Введення лейблу скасовано");
        return; // Скасовано
      }
      loggers.editor.info(`✅ Отримано лейбл: "${label}"`);
    }

    // Перевіряємо, чи потрібне значення
    if (this.needsValue(actionCode)) {
      const defaultValue = this.getDefaultValueForAction(actionCode);
      loggers.editor.info(
        `🔢 Дія потребує значення: ${this.getActionName(actionCode)}, за замовчуванням: ${defaultValue}`,
      );
      value = await this.dialogManager.promptForNumber(defaultValue);
      if (value === null) {
        loggers.editor.info("❌ Введення значення скасовано");
        return; // Скасовано
      }
      loggers.editor.info(`✅ Отримано значення: ${value}`);
    }

    // Перевіряємо, чи потрібні координати
    if (this.needsCoordinates(actionCode)) {
      loggers.editor.info(
        `📍 Дія потребує координат: ${this.getActionName(actionCode)}`,
      );
      const coords = await this.dialogManager.promptForCoordinates();
      if (coords === null) {
        loggers.editor.info("❌ Введення координат скасовано");
        return; // Скасовано
      }
      value = coords;
      loggers.editor.info(`✅ Отримано координати: ${coords}`);
    }

    // Розміщуємо інструкцію
    // Розміщуємо інструкцію
    this.program.setInstructionAt(
      x,
      y,
      actionCode,
      label,
      value,
      this.currentPage,
    );
    this.programGrid.updateCellDisplay(x, y);

    const totalTime = performance.now() - startTime;
    const details = [];
    if (label) details.push(`лейбл: "${label}"`);
    if (value !== null && value !== undefined)
      details.push(`значення: ${value}`);
    const detailsStr = details.length > 0 ? ` (${details.join(", ")})` : "";

    loggers.editor.info(
      `✅ Розміщено дію "${actionName}" в [${x}, ${y}]${detailsStr} (${totalTime.toFixed(2)}ms)`,
    );
  }

  /**
   * Імпорт програми
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

      this.program = await Program.fromString(importText);

      // CRITICAL: Update the reference in ProgramGrid!
      this.programGrid.program = this.program;
      loggers.editor.debug(`✅ Updated ProgramGrid reference to new program`);

      const importTime = performance.now() - startTime;
      const instructionCount = this.program.instructions.length;
      const nonEmptyCount = this.program.instructions.filter(
        (inst) => inst.action !== ProgAction.None,
      ).length;

      this.programGrid.updateDisplay();
      this.controls.showFeedback("✅ Програма імпортована успішно", "success");

      loggers.editor.info(
        `📥 Імпортовано програму: ${instructionCount} інструкцій (${nonEmptyCount} не порожніх) за ${importTime.toFixed(2)}ms`,
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
      loggers.editor.error(`Full error:`, error);
      if (error?.stack) {
        loggers.editor.error(`Stack trace:`, error.stack);
      }
      this.controls.showFeedback(
        `❌ Помилка імпорту: ${error?.message || "Unknown error"}`,
        "error",
      );
      throw error;
    }
  }

  /**
   * Експорт програми
   */
  async onExport(format) {
    const startTime = performance.now();
    try {
      loggers.editor.info(`📤 Початок експорту в форматі ${format}...`);

      let result;
      const instructionCount = this.program.instructions.length;
      const nonEmptyCount = this.program.instructions.filter(
        (inst) => inst.action !== ProgAction.None,
      ).length;

      switch (format) {
        case "codes":
          const nonEmptyInstructions = this.program.instructions.filter(
            (inst) => inst.action !== ProgAction.None,
          );
          result = nonEmptyInstructions.map((inst) => inst.action).join(" ");
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
      (inst) => inst.action !== ProgAction.None,
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
        .map((e) => `• ${e.message}`)
        .join("\n");
      this.controls.showFeedback(
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
        .map((w) => `• ${w.message}`)
        .join("\n");
      this.controls.showFeedback(
        `⚠️ Попередження: ${validation.warnings.length}\n${warningMessages}`,
        "info",
      );
    }

    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      loggers.validation.info(
        "✅ Програма пройшла валідацію без помилок та попереджень",
      );
      this.controls.showFeedback("✅ Програма валідна!", "success");
    }
  }

  /**
   * Очистка програми
   */
  async onClear() {
    const startTime = performance.now();
    const instructionCount = this.program.instructions.length;
    const nonEmptyCount = this.program.instructions.filter(
      (inst) => inst.action !== ProgAction.None,
    ).length;

    loggers.editor.debug(
      `🗑️ Запит на очистку програми (${instructionCount} інструкцій, ${nonEmptyCount} не порожніх)`,
    );

    const confirmed = await this.dialogManager.showConfirmDialog(
      "Ви дійсно хочете очистити всю програму?",
      "Очистка програми",
    );

    if (confirmed) {
      this.program.clear();
      this.programGrid.updateDisplay();

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
   * Експертні налаштування
   */
  onExpertSettings() {
    loggers.editor.debug("⚙️ Відкриття діалогу експертних налаштувань");

    this.dialogManager.showExpertSettingsDialog((settings) => {
      loggers.editor.info(
        `💾 Збережено експертні налаштування: ${Object.keys(settings).length} параметрів`,
      );
      loggers.editor.debug("💾 Деталі налаштувань:", settings);

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
      loggers.editor.debug(
        `🏷️ Команда ${this.getActionName(actionCode)} (${actionCode}) потребує лейбл`,
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
      loggers.editor.debug(
        `🔢 Команда ${this.getActionName(actionCode)} (${actionCode}) потребує значення`,
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
   * Налаштування контейнерів лейаута для триколонкового компонування
   */
  setupLayoutContainers() {
    loggers.editor.debug("🔍 Пошук контейнерів лейаута...");

    // Отримуємо контейнери лейаута
    this.leftSidebar = document.querySelector(".programmer-sidebar-left");
    this.mainContent = document.querySelector(".programmer-main");
    this.rightSidebar = document.querySelector(".programmer-sidebar-right");
    this.transportContainer = document.querySelector(
      "#transport-panel-container",
    );

    loggers.editor.debug(`📍 Знайдено елементів:`);
    loggers.editor.debug(`  - Left sidebar: ${this.leftSidebar ? "✅" : "❌"}`);
    loggers.editor.debug(`  - Main content: ${this.mainContent ? "✅" : "❌"}`);
    loggers.editor.debug(
      `  - Right sidebar: ${this.rightSidebar ? "✅" : "❌"}`,
    );

    if (!this.leftSidebar || !this.mainContent || !this.rightSidebar) {
      loggers.editor.warn(
        "⚠️ Деякі контейнери лейаута не знайдено, перевірка резервних...",
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

      loggers.editor.debug("🔍 Перевірка всіх можливих контейнерів:");
      selectors.forEach((selector) => {
        const element = document.querySelector(selector);
        loggers.editor.debug(`  ${selector}: ${element ? "✅" : "❌"}`);
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
        loggers.editor.error(
          "❌ Жодні контейнери не знайдено! DOM структура пошкоджена.",
        );
        loggers.editor.error(
          "📄 Поточний вміст body:",
          document.body.innerHTML.substring(0, 500),
        );
        throw new Error("Cannot find any container elements in DOM");
      }

      loggers.editor.warn(
        "⚠️ Використовується резервний контейнер:",
        this.leftSidebar.tagName,
      );
    } else {
      loggers.editor.debug("✅ Усі контейнери лейаута знайдено успішно");
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
      loggers.editor.info(`📄 Переключено на сторінку ${this.currentPage}`);
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
      loggers.editor.info(`📄 Переключено на сторінку ${this.currentPage}`);
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
      this.performAutosave();
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
    const startTime = performance.now();
    try {
      const instructions = this.program.instructions;

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

      // Не показуємо діалог якщо немає інструкцій для відновлення
      if (
        autosaveData &&
        autosaveData.instructions &&
        autosaveData.instructions.length > 0
      ) {
        // Питаємо користувача про відновлення
        const shouldRestore = await this.dialogManager.showConfirmDialog(
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
              this.program.setInstructionAt(
                index % GRID_WIDTH,
                Math.floor(index / GRID_WIDTH),
                instruction.action,
                instruction.param1,
                instruction.param2,
                Math.floor(index / (GRID_WIDTH * GRID_HEIGHT)),
              );
            }
          });

          this.updatePageDisplay();
          this.programGrid.updateDisplay();

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
}
