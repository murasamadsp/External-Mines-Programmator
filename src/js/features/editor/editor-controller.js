// Користувацький інтерфейс Програматора шахт - рефакторинг
// Використовує модульну архітектуру для кращого розділення відповідальності

import { Program } from "../../core/models/program.js";
import { DragDropManager } from "../../core/services/drag-drop-manager.js";
import { contextMenuManager } from "../../core/services/context-menu-manager.js";
import { stateManager } from "../../core/services/state-manager.js";
import { loggers } from "../../utils/logging/logger.js";

// Імпорт нових контролерів
import { UIController } from "./controllers/UIController.js";
import { CellController } from "./controllers/CellController.js";
import { DialogController } from "./controllers/DialogController.js";
import { PersistenceController } from "./controllers/PersistenceController.js";
import { NavigationController } from "./controllers/NavigationController.js";
import { SettingsController } from "./controllers/SettingsController.js";

export class EditorController {
  constructor() {
    const startTime = performance.now();
    loggers.editor.info("🏗️ Започаткування EditorController...");

    // Індикатор ініціалізації
    document.body.setAttribute("data-programmator-init", "started");

    this.program = new Program();
    stateManager.setState({ program: this.program });
    this.currentPage = 0; // Номер поточної сторінки (0-15)
    this.pendingAction = null;

    const constructorTime = performance.now() - startTime;
    loggers.editor.debug(
      `⏱️ Конструктор EditorController виконано за ${constructorTime.toFixed(2)}ms`,
    );

    // Синхронізація висоти при зміні розміру вікна
    this.resizeHandler = () => {
      if (this.uiController) {
        this.uiController.syncSidebarHeight();
      }
    };
    window.addEventListener("resize", this.resizeHandler);

    // UI-модулі створюються асинхронно, тому чекаємо їх завершення перед
    // запуском залежних контролерів та першою синхронізацією інтерфейсу.
    this.initialize()
      .then(() => {
        loggers.editor.info("✅ EditorController вдало започатковано");
      })
      .catch((error) => {
        loggers.editor.error(
          "❌ Не вдалося започаткувати Programmator:",
          error,
        );
      });
  }

  /**
   * Повністю ініціалізує контролери та інтерфейс у правильному порядку.
   */
  async initialize() {
    await this.initializeControllers();

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
    this.initializeUI();
  }

  /**
   * Ініціалізація всіх контролерів
   */
  async initializeControllers() {
    loggers.editor.debug("🎮 Ініціалізація контролерів...");

    // Створюємо callbacks для зв'язку між контролерами
    const callbacks = {
      onActionSelected: (actionKey) => this.onActionSelected(actionKey),
      onCellClick: (x, y) => this.onCellClick(x, y),
      onImport: (text) => this.onImport(text),
      onExport: (format) => this.onExport(format),
      onValidate: () => this.onValidate(),
      onClear: () => this.onClear(),
      onPageNavigation: (direction) => this.onPageNavigation(direction),
    };

    // Ініціалізуємо контролери
    this.uiController = new UIController(this.program, callbacks);

    // Асинхронна ініціалізація UI (буде оброблена окремо)
    try {
      await this.uiController.initialize();
      const { dialogManager } = this.uiController;

      // Створюємо контролери в правильному порядку залежностей
      this.dialogController = new DialogController(dialogManager);
      this.cellController = new CellController(
        this.program,
        dialogManager,
        this.uiController,
      );
      if (this.pendingAction !== null) {
        this.cellController.setSelectedAction(this.pendingAction);
      }
      this.persistenceController = new PersistenceController(
        this.program,
        this.uiController,
        this.dialogController,
      );
      this.navigationController = new NavigationController(
        this.program,
        this.uiController,
      );
      this.settingsController = new SettingsController(
        this.persistenceController,
        this.dialogController,
      );

      // Ініціалізуємо Drag & Drop після створення сітки
      this.dragDropManager = new DragDropManager(this.uiController.programGrid);

      loggers.editor.debug("✅ Усі контролери ініціалізовано");
    } catch (error) {
      loggers.editor.error("❌ Помилка ініціалізації контролерів:", error);
      throw error;
    }
  }

  /**
   * Ініціалізація користувацького інтерфейсу
   */
  initializeUI() {
    const startTime = performance.now();
    loggers.editor.info("🔧 Початок ініціалізації UI інтерфейсу...");

    try {
      // Ініціалізуємо Context Menu Manager
      if (!contextMenuManager) {
        loggers.editor.error(
          "❌ Context Menu Manager не ініціалізовано - функціонал контекстного меню буде обмежено",
        );
      } else {
        loggers.editor.debug("✅ Context Menu Manager готовий до роботи");
      }

      // Оновлюємо відображення
      this.updatePageDisplay();

      // Запускаємо автозбереження
      if (this.persistenceController) {
        loggers.editor.debug("⏰ Запуск автозбереження");
        this.persistenceController.startAutosave();

        // Перевіряємо наявність автозбереження
        loggers.editor.debug("🔍 Перевірка автозбереження...");
        this.persistenceController.restoreAutosave();
      }

      const totalTime = performance.now() - startTime;
      loggers.editor.info(
        `✅ Ініціалізація UI завершена за ${totalTime.toFixed(2)}ms`,
      );
    } catch (error) {
      loggers.editor.error("❌ Помилка ініціалізації UI:", error);
      throw error;
    }
  }

  // ==================== CALLBACK METHODS ====================

  /**
   * Обробляє вибір дії в палітрі
   * @param actionKey
   */
  onActionSelected(actionKey) {
    this.pendingAction = actionKey;
    if (this.cellController) {
      this.cellController.setSelectedAction(actionKey);
    }
  }

  /**
   * Обробляє клік по клітинці сітки
   * @param x
   * @param y
   */
  async onCellClick(x, y) {
    if (this.cellController) {
      const currentPage =
        this.navigationController?.getCurrentPage() ?? this.currentPage;
      await this.cellController.onCellClick(x, y, currentPage);
    }
  }

  /**
   * Імпорт програми
   * @param importText
   */
  async onImport(importText) {
    if (this.persistenceController) {
      await this.persistenceController.onImport(importText);
    }
  }

  /**
   * Експорт програми
   * @param format
   */
  onExport(format) {
    if (this.persistenceController) {
      return this.persistenceController.onExport(format);
    }
  }

  /**
   * Валідація програми
   */
  onValidate() {
    if (this.persistenceController) {
      this.persistenceController.onValidate();
    }
  }

  /**
   * Очистка програми
   */
  async onClear() {
    if (this.persistenceController) {
      await this.persistenceController.onClear();
    }
  }

  /**
   * Експертні налаштування
   */
  onExpertSettings() {
    if (this.settingsController) {
      this.settingsController.showExpertSettingsDialog();
    }
  }

  /**
   * Навігація по сторінках
   * @param direction
   */
  onPageNavigation(direction) {
    if (this.navigationController) {
      this.navigationController.onPageNavigation(direction);
      this.currentPage = this.navigationController.getCurrentPage();
      stateManager.setState({ currentPage: this.currentPage });
    }
  }

  /**
   * Оновлює відображення сторінки
   */
  updatePageDisplay() {
    if (this.uiController) {
      const currentPage =
        this.navigationController?.getCurrentPage() ?? this.currentPage;
      this.uiController.updatePageDisplay(
        currentPage,
        this.navigationController?.getMaxPages() || 16,
      );
      this.currentPage = currentPage;
    }
    stateManager.setState({ currentPage: this.currentPage });
  }

  /**
   * Очищає всі ресурси та знищує контролери
   */
  destroy() {
    loggers.editor.debug("🧹 Очищення EditorController...");

    // Зупиняємо event listeners
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }

    // Знищуємо всі контролери в зворотному порядку створення
    if (
      this.settingsController &&
      typeof this.settingsController.destroy === "function"
    ) {
      this.settingsController.destroy();
    }
    if (
      this.navigationController &&
      typeof this.navigationController.destroy === "function"
    ) {
      this.navigationController.destroy();
    }
    if (
      this.persistenceController &&
      typeof this.persistenceController.destroy === "function"
    ) {
      this.persistenceController.destroy();
    }
    if (
      this.cellController &&
      typeof this.cellController.destroy === "function"
    ) {
      this.cellController.destroy();
    }
    if (
      this.dialogController &&
      typeof this.dialogController.destroy === "function"
    ) {
      this.dialogController.destroy();
    }
    if (this.uiController && typeof this.uiController.destroy === "function") {
      this.uiController.destroy();
    }

    // Знищуємо Drag & Drop менеджер
    if (
      this.dragDropManager &&
      typeof this.dragDropManager.destroy === "function"
    ) {
      this.dragDropManager.destroy();
    }

    // Очищаємо посилання
    this.program = null;
    this.uiController = null;
    this.cellController = null;
    this.dialogController = null;
    this.persistenceController = null;
    this.navigationController = null;
    this.settingsController = null;
    this.dragDropManager = null;

    loggers.editor.debug("✅ EditorController очищено");
  }
}
