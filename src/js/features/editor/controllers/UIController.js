// UIController - відповідає за ініціалізацію користувацького інтерфейсу
// Принцип єдиної відповідальності: тільки ініціалізація UI

import { loggers } from "../../../utils/logging/logger.js";

// Імпорт модулів UI
import { ActionPalette } from "../components/ActionPalette.js";
import { ProgramGrid } from "../components/ProgramGrid.js";
import { Controls } from "../components/Controls.js";
import { DialogManager } from "../components/DialogManager.js";
import { SnippetsPanel } from "../components/SnippetsPanel.js";

export class UIController {
  constructor(program, callbacks) {
    this.program = program;
    this.callbacks = callbacks;

    // Контейнери лейаута
    this.leftSidebar = null;
    this.mainContent = null;
    this.rightSidebar = null;
    this.transportContainer = null;

    // Ініціалізовані компоненти
    this.actionPalette = null;
    this.programGrid = null;
    this.controls = null;
    this.snippetsPanel = null;
    this.dialogManager = null;

    // Event listeners для очищення
    this.eventListeners = [];
  }

  /**
   * Ініціалізує користувацький інтерфейс
   */
  async initialize() {
    const startTime = performance.now();
    loggers.editor.info("🔧 Початок ініціалізації UI інтерфейсу...");

    try {
      // Налаштування контейнерів лейаута
      this.setupLayoutContainers();

      // Ініціалізація модулів інтерфейсу
      await this.initializeUIModules();

      const totalTime = performance.now() - startTime;
      loggers.editor.info(
        `✅ Ініціалізація UI завершена за ${totalTime.toFixed(2)}ms`,
      );

      return true;
    } catch (error) {
      loggers.editor.error("❌ Помилка ініціалізації UI:", error);
      throw error;
    }
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

    loggers.editor.debug("📍 Знайдено елементів:");
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
      selectors.forEach(selector => {
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

  /**
   * Ініціалізує модулі користувацького інтерфейсу
   */
  async initializeUIModules() {
    const modulesStartTime = performance.now();

    try {
      // Палітра діянь
      await this.initializeActionPalette();

      // Сітка програми
      await this.initializeProgramGrid();

      // Панель керування
      await this.initializeControls();

      // Панель сніпетів
      await this.initializeSnippetsPanel();

      // Менеджер діалогів
      await this.initializeDialogManager();

      const totalModulesTime = performance.now() - modulesStartTime;
      loggers.editor.info(
        `🎉 Усі модулі інтерфейсу започатковано успішно (загальний час: ${totalModulesTime.toFixed(2)}ms)!`,
      );
    } catch (error) {
      loggers.editor.error("❌ Помилка започаткування модулів ІЧ:", error);
      throw error;
    }
  }

  /**
   * Ініціалізує палітру діянь
   */
  async initializeActionPalette() {
    const paletteStartTime = performance.now();
    loggers.editor.info("🎨 Створення палітри діянь...");

    this.actionPalette = new ActionPalette(this.leftSidebar, actionKey =>
      this.callbacks.onActionSelected(actionKey),
    );
    this.actionPalette.create();

    const paletteTime = performance.now() - paletteStartTime;
    loggers.editor.info(
      `✅ Палітру діянь утворено (${paletteTime.toFixed(2)}ms)`,
    );
  }

  /**
   * Ініціалізує сітку програми
   */
  async initializeProgramGrid() {
    const gridStartTime = performance.now();
    loggers.editor.info("🎯 Створення сітки програми...");

    this.programGrid = new ProgramGrid(this.mainContent, this.program, (x, y) =>
      this.callbacks.onCellClick(x, y),
    );
    this.programGrid.create();

    // Синхронізувати висоту бічних панелей з висотою сітки
    this.syncSidebarHeight();

    const gridTime = performance.now() - gridStartTime;
    loggers.editor.debug(
      `📊 Сітка створена: ${this.program.instructions.length} інструкцій завантажено`,
    );
    loggers.editor.info(
      `✅ Сітку програми утворено (${gridTime.toFixed(2)}ms)`,
    );
  }

  /**
   * Ініціалізує панель керування
   */
  async initializeControls() {
    const controlsStartTime = performance.now();
    loggers.editor.info("🎛️ Створення панелі керування...");

    const controlsContainer = this.transportContainer || this.mainContent;
    loggers.editor.debug(
      `📍 Панель керування буде розміщена в: ${controlsContainer === this.transportContainer ? "transport container" : "main content"}`,
    );

    this.controls = new Controls(
      controlsContainer,
      this.program,
      text => this.callbacks.onImport(text), // onImport
      format => this.callbacks.onExport(format), // onExport
      () => this.callbacks.onValidate(), // onValidate
      () => this.callbacks.onClear(), // onClear
      direction => this.callbacks.onPageNavigation(direction), // onPageNavigation
    );
    this.controls.create();

    const controlsTime = performance.now() - controlsStartTime;
    loggers.editor.info(
      `✅ Панель керування утворено (${controlsTime.toFixed(2)}ms)`,
    );
  }

  /**
   * Ініціалізує панель сніпетів
   */
  async initializeSnippetsPanel() {
    const snippetsStartTime = performance.now();
    loggers.editor.info("🧩 Створення панелі сніпетів...");

    this.snippetsPanel = new SnippetsPanel(this.rightSidebar);
    this.snippetsPanel.create();

    const snippetsTime = performance.now() - snippetsStartTime;
    loggers.editor.info(
      `✅ Панель сніпетів утворено (${snippetsTime.toFixed(2)}ms)`,
    );
  }

  /**
   * Ініціалізує менеджер діалогів
   */
  async initializeDialogManager() {
    const dialogsStartTime = performance.now();
    loggers.editor.info("💬 Створення менеджера діалогів...");

    this.dialogManager = new DialogManager();

    const dialogsTime = performance.now() - dialogsStartTime;
    loggers.editor.info(
      `✅ Менеджера діалогів утворено (${dialogsTime.toFixed(2)}ms)`,
    );
  }

  /**
   * Синхронізує висоту бічних панелей з висотою сітки програми
   */
  syncSidebarHeight() {
    try {
      if (this.programGrid) {
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
      }
    } catch (error) {
      loggers.editor.error(
        "❌ Помилка синхронізації висоти бічних панелей:",
        error,
      );
    }
  }

  /**
   * Очищає ресурси та видаляє event listeners
   */
  destroy() {
    loggers.editor.debug("🧹 Очищення UIController...");

    // Очищаємо event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Знищуємо компоненти (якщо вони мають методи destroy)
    if (
      this.actionPalette &&
      typeof this.actionPalette.destroy === "function"
    ) {
      this.actionPalette.destroy();
    }
    if (this.programGrid && typeof this.programGrid.destroy === "function") {
      this.programGrid.destroy();
    }
    if (this.controls && typeof this.controls.destroy === "function") {
      this.controls.destroy();
    }
    if (
      this.snippetsPanel &&
      typeof this.snippetsPanel.destroy === "function"
    ) {
      this.snippetsPanel.destroy();
    }
    if (
      this.dialogManager &&
      typeof this.dialogManager.destroy === "function"
    ) {
      this.dialogManager.destroy();
    }

    // Очищаємо посилання
    this.actionPalette = null;
    this.programGrid = null;
    this.controls = null;
    this.snippetsPanel = null;
    this.dialogManager = null;

    loggers.editor.debug("✅ UIController очищено");
  }

  /**
   * Оновлює відображення сторінки
   * @param currentPage
   * @param maxPages
   */
  updatePageDisplay(currentPage, maxPages) {
    if (this.controls) {
      this.controls.updatePageIndicator(currentPage, maxPages);
    }
  }

  /**
   * Оновлює відображення сітки
   */
  updateGridDisplay() {
    if (this.programGrid) {
      this.programGrid.updateDisplay();
    }
  }

  /**
   * Оновлює відображення окремої клітинки
   * @param x
   * @param y
   */
  updateCellDisplay(x, y) {
    if (this.programGrid) {
      this.programGrid.updateCellDisplay(x, y);
    }
  }

  /**
   * Показує повідомлення в controls
   * @param message
   * @param type
   */
  showFeedback(message, type) {
    if (this.controls) {
      this.controls.showFeedback(message, type);
    }
  }

  /**
   * Встановлює поточну сторінку для сітки
   * @param page
   */
  setGridCurrentPage(page) {
    if (this.programGrid) {
      this.programGrid.setCurrentPage(page);
    }
  }
}
