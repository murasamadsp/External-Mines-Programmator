// Панель керування - окремий модуль для кнопок імпорту/експорту та інших елементів керування
// Відповідає тільки за елементи керування та їх обробники
import { UI_TIMEOUTS, UI_MESSAGES } from "../../../core/constants/ui-constants.js";
import { loggers } from "../../../utils/index.js";
import { createButton, createSection, showFeedback } from "../../../core/utils/dom-utils.js";

export class Controls {
  constructor(
    container,
    program,
    onImport,
    onExport,
    onValidate,
    onClear,
    onPageNavigation
  ) {
    this.container = container;
    this.program = program;
    this.callbacks = {
      onImport,
      onExport,
      onClear,
      onPageNavigation,
    };

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
        createSection("Import/Export", this.createImportExportContent())
      );
      this.controlsElement.appendChild(
        createSection("Program Control", this.createProgramControlContent())
      );
      this.controlsElement.appendChild(
        createSection("Page Navigation", this.createPageNavigationContent())
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
      text: "Import",
      onClick: async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (!text.trim()) {
            loggers.ui.warn("❌ Буфер обміну порожній");
            this.showFeedback("Clipboard is empty", "error");
            return;
          }

          if (this.callbacks.onImport) {
            await this.callbacks.onImport(text);
            this.showFeedback("✓ Imported from clipboard", "success");
          }
        } catch (error) {
          loggers.ui.error("❌ Помилка читання з буфера обміну:", error);
          this.showFeedback("Failed to read clipboard", "error");
        }
      }
    });
    buttonGroup.appendChild(importButton);

    const exportButton = createButton({
      id: "export-btn",
      text: "Export",
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
      }
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
      text: "Clear",
      icon: "🗑️",
      onClick: () => {
        if (this.callbacks.onClear) {
          this.callbacks.onClear();
        }
      }
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
      text: "Previous",
      icon: "⬅️",
      onClick: () => {
        if (this.callbacks.onPageNavigation) {
          this.callbacks.onPageNavigation("prev");
        }
      }
    });
    pageControls.appendChild(prevBtn);

    const pageIndicator = document.createElement("span");
    pageIndicator.id = "page-indicator";
    pageIndicator.textContent = UI_MESSAGES.pageIndicator.replace("{current}", "0").replace("{total}", "15");
    pageControls.appendChild(pageIndicator);

    const nextBtn = createButton({
      id: "next-page",
      text: "Next",
      icon: "➡️",
      onClick: () => {
        if (this.callbacks.onPageNavigation) {
          this.callbacks.onPageNavigation("next");
        }
      }
    });
    pageControls.appendChild(nextBtn);

    return pageControls;
  }

  /**
   * Shows visual feedback message
   */
  showFeedback(message, type = "info") {
    showFeedback(this.container, message, type, UI_TIMEOUTS.notification);
  }

  /**
   * Оновлює індикатор сторінки
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
}
