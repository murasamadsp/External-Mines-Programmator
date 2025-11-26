// Панель керування - окремий модуль для кнопок імпорту/експорту та інших елементів керування
// Відповідає тільки за елементи керування та їх обробники
import {
  UI_TIMEOUTS,
  UI_MESSAGES,
} from "../../../core/constants/ui-constants.js";
import { loggers } from "../../../utils/logging/logger.js";
import {
  createButton,
  createSection,
  showFeedback,
} from "../../../core/utils/dom-utils.js";
import { ProgramDecoder } from "./ProgramDecoder.js";
import { ProgramAnalyzer } from "./ProgramAnalyzer.js";

export class Controls {
  constructor(
    container,
    program,
    onImport,
    onExport,
    onValidate,
    onClear,
    onPageNavigation,
  ) {
    this.container = container;
    this.program = program;
    this.callbacks = {
      onImport,
      onExport,
      onClear,
      onPageNavigation,
    };

    this.programDecoder = new ProgramDecoder();
    this.programAnalyzer = new ProgramAnalyzer();

    loggers.ui.debug("🏗️ Controls ініціалізовано");
  }

  /**
   * Створює панель керування
   */
  create() {
    try {
      this.controlsElement = document.createElement("div");
      this.controlsElement.id = "program-controls";
      this.controlsElement.className = "program-controls";

      // Створюємо секції через DOM helpers
      this.controlsElement.appendChild(
        createSection("Import/Export", this.createImportExportContent()),
      );
      this.controlsElement.appendChild(
        createSection("Program Control", this.createProgramControlContent()),
      );
      this.controlsElement.appendChild(
        createSection("Page Navigation", this.createPageNavigationContent()),
      );
      this.controlsElement.appendChild(
        createSection("Program Decoder", this.createProgramDecoderContent()),
      );
      this.controlsElement.appendChild(
        createSection("Program Analyzer", this.createProgramAnalyzerContent()),
      );

      this.container.appendChild(this.controlsElement);

      loggers.ui.info("✅ Панель керування створена");
    } catch (error) {
      loggers.ui.error("❌ Помилка створення панелі керування:", error);
    }
  }

  /**
   * Створює контент секції імпорту/експорту
   */
  createImportExportContent() {
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "control-buttons";

    const importButton = createButton({
      id: "import-btn",
      text: "",
      icon: "📥",
      onClick: async () => {
        try {
          let text = "";
          try {
            text = await navigator.clipboard.readText();
          } catch (clipboardError) {
            loggers.ui.warn(
              "⚠️ Clipboard access denied or failed, using fallback prompt",
              clipboardError,
            );
          }

          if (!text) {
            // Fallback: Ask user to paste manually
            text = prompt(
              "Please paste the program code here (starts with $):",
            );
          }

          if (text && this.callbacks.onImport) {
            await this.callbacks.onImport(text);
            this.showFeedback("✓ Imported successfully", "success");
          }
        } catch (error) {
          loggers.ui.error("❌ Import error:", error);
          this.showFeedback("Import failed", "error");
        }
      },
    });
    buttonGroup.appendChild(importButton);

    const exportButton = createButton({
      id: "export-btn",
      text: "",
      icon: "📤",
      onClick: async () => {
        try {
          if (this.callbacks.onExport) {
            const result = await this.callbacks.onExport("base64");
            await navigator.clipboard.writeText(result);
            this.showFeedback("✓ Copied to clipboard", "success");
          }
        } catch (error) {
          loggers.ui.error("❌ Помилка запису в буфер обміну:", error);
          this.showFeedback("Failed to copy to clipboard", "error");
        }
      },
    });
    buttonGroup.appendChild(exportButton);

    return buttonGroup;
  }

  /**
   * Створює контент секції керування програмою
   */
  createProgramControlContent() {
    const controlButtons = document.createElement("div");
    controlButtons.className = "control-buttons";

    const clearBtn = createButton({
      id: "clear-program",
      text: "",
      icon: "🗑️",
      onClick: () => {
        if (this.callbacks.onClear) {
          this.callbacks.onClear();
        }
      },
    });
    controlButtons.appendChild(clearBtn);

    return controlButtons;
  }

  /**
   * Створює контент секції навігації по сторінках
   */
  createPageNavigationContent() {
    const pageControls = document.createElement("div");
    pageControls.className = "page-controls";

    const prevBtn = createButton({
      id: "prev-page",
      text: "",
      icon: "⬅️",
      onClick: () => {
        if (this.callbacks.onPageNavigation) {
          this.callbacks.onPageNavigation("prev");
        }
      },
    });
    pageControls.appendChild(prevBtn);

    const pageIndicator = document.createElement("span");
    pageIndicator.id = "page-indicator";
    pageIndicator.textContent = UI_MESSAGES.pageIndicator
      .replace("{current}", "0")
      .replace("{total}", "15");
    pageControls.appendChild(pageIndicator);

    const nextBtn = createButton({
      id: "next-page",
      text: "",
      icon: "➡️",
      onClick: () => {
        if (this.callbacks.onPageNavigation) {
          this.callbacks.onPageNavigation("next");
        }
      },
    });
    pageControls.appendChild(nextBtn);

    return pageControls;
  }

  /**
   * Shows visual feedback message
   * @param message
   * @param type
   */
  showFeedback(message, type = "info") {
    showFeedback(this.container, message, type, UI_TIMEOUTS.notification);
  }

  /**
   * Оновлює індикатор сторінки
   * @param currentPage
   * @param totalPages
   */
  updatePageIndicator(currentPage, totalPages) {
    if (!this.controlsElement) return;

    const indicator = this.controlsElement.querySelector("#page-indicator");
    if (indicator) {
      indicator.textContent = UI_MESSAGES.pageIndicator
        .replace("{current}", currentPage)
        .replace("{total}", totalPages - 1);
    }

    // Оновлюємо стан кнопок
    const prevButton = this.controlsElement.querySelector("#prev-page");
    const nextButton = this.controlsElement.querySelector("#next-page");

    if (prevButton) {
      prevButton.disabled = currentPage === 0;
    }

    if (nextButton) {
      nextButton.disabled = currentPage >= totalPages - 1;
    }
  }

  /**
   * Створює контент секції декодера програм
   * @returns {HTMLElement} Контейнер з декодером програм
   */
  createProgramDecoderContent() {
    const container = document.createElement("div");
    container.className = "program-decoder-container";

    // Створюємо кнопку для відкриття декодера
    const toggleButton = createButton({
      id: "decoder-toggle-btn",
      text: "Відкрити декодер",
      icon: "🎯",
      onClick: () => this.toggleProgramDecoder(container),
    });

    container.appendChild(toggleButton);

    return container;
  }

  /**
   * Перемикає відображення декодера програм
   * @param {HTMLElement} container - Контейнер секції
   */
  toggleProgramDecoder(container) {
    const existingDecoder = document.querySelector(".program-decoder");

    if (existingDecoder) {
      // Якщо декодер вже відкритий, закриваємо його
      existingDecoder.remove();
      const toggleBtn = container.querySelector("#decoder-toggle-btn");
      if (toggleBtn) {
        toggleBtn.textContent = "🎯 Відкрити декодер";
      }
    } else {
      // Якщо декодер закритий, відкриваємо його як окремий елемент
      const decoderUI = this.programDecoder.createUI();
      decoderUI.classList.add("program-tool-modal");

      // Додаємо обробники для закриття модального вікна
      const closeModal = () => this.toggleProgramDecoder(container);

      decoderUI.addEventListener("click", e => {
        if (e.target === decoderUI) {
          closeModal();
        }
      });

      const handleEscape = e => {
        if (e.key === "Escape") {
          closeModal();
          document.removeEventListener("keydown", handleEscape);
        }
      };
      document.addEventListener("keydown", handleEscape);

      // Додаємо в кінець body, щоб уникнути конфліктів з layout
      document.body.appendChild(decoderUI);

      const toggleBtn = container.querySelector("#decoder-toggle-btn");
      if (toggleBtn) {
        toggleBtn.textContent = "🎯 Закрити декодер";
      }

      loggers.ui.info("🎯 Декодер програм відкрито");
    }
  }

  /**
   * Створює контент секції аналізатора програм
   * @returns {HTMLElement} Контейнер з аналізатором програм
   */
  createProgramAnalyzerContent() {
    const container = document.createElement("div");
    container.className = "program-analyzer-container";

    // Створюємо кнопку для відкриття аналізатора
    const toggleButton = createButton({
      id: "analyzer-toggle-btn",
      text: "Відкрити аналізатор",
      icon: "📊",
      onClick: () => this.toggleProgramAnalyzer(container),
    });

    container.appendChild(toggleButton);

    return container;
  }

  /**
   * Перемикає відображення аналізатора програм
   * @param {HTMLElement} container - Контейнер секції
   */
  toggleProgramAnalyzer(container) {
    const existingAnalyzer = document.querySelector(".program-analyzer");

    if (existingAnalyzer) {
      // Якщо аналізатор вже відкритий, закриваємо його
      existingAnalyzer.remove();
      const toggleBtn = container.querySelector("#analyzer-toggle-btn");
      if (toggleBtn) {
        toggleBtn.textContent = "📊 Відкрити аналізатор";
      }
    } else {
      // Якщо аналізатор закритий, відкриваємо його як окремий елемент
      const analyzerUI = this.programAnalyzer.createUI();
      analyzerUI.classList.add("program-tool-modal");

      // Додаємо обробники для закриття модального вікна
      const closeModal = () => this.toggleProgramAnalyzer(container);

      analyzerUI.addEventListener("click", e => {
        if (e.target === analyzerUI) {
          closeModal();
        }
      });

      const handleEscape = e => {
        if (e.key === "Escape") {
          closeModal();
          document.removeEventListener("keydown", handleEscape);
        }
      };
      document.addEventListener("keydown", handleEscape);

      // Додаємо в кінець body, щоб уникнути конфліктів з layout
      document.body.appendChild(analyzerUI);

      // Автоматично аналізуємо поточну програму, якщо вона є
      if (
        this.program &&
        this.program.instructions &&
        this.program.instructions.length > 0
      ) {
        this.programAnalyzer.analyzeProgram(this.program.instructions);
      }

      const toggleBtn = container.querySelector("#analyzer-toggle-btn");
      if (toggleBtn) {
        toggleBtn.textContent = "📊 Закрити аналізатор";
      }

      loggers.ui.info("📊 Аналізатор програм відкрито");
    }
  }

  /**
   * Оновлює аналіз при зміні програми
   * @param {Array} instructions - Нові інструкції програми
   */
  updateProgramAnalysis(instructions) {
    // Знаходимо відкритий аналізатор і оновлюємо його
    const analyzerContainer = document.querySelector(
      ".program-analyzer-container .program-analyzer",
    );
    if (analyzerContainer && this.programAnalyzer) {
      this.programAnalyzer.analyzeProgram(instructions || []);
    }
  }
}
