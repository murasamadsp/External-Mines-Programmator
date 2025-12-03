// Сітка програми - окремий модуль для відображення та взаємодії з сіткою
// Відповідає тільки за візуалізацію та обробку кліків по клітинках

import { GRID_WIDTH, GRID_HEIGHT } from "../../../core/constants/grid.js";
import { ProgAction } from "../../../core/constants/actions.js";
import { loggers } from "../../../utils/logging/logger.js";
import {
  ACTION_DATA,
  getActionByCode,
} from "../../../core/constants/actions.js";
import { contextMenuManager } from "../../../core/services/context-menu-manager.js";
import { Instruction } from "../../../core/types/instruction.js";

export class ProgramGrid {
  constructor(container, program, onCellClick) {
    this.container = container;
    this.program = program;
    this.onCellClick = onCellClick;
    this.currentPage = 0; // Current page being displayed
    this.gridCells = new Map(); // Map для швидкого доступу до клітинок
    this.cursorPosition = null; // Linear index of the active cell

    // Grid dimensions
    this.gridWidth = GRID_WIDTH;
    this.gridHeight = GRID_HEIGHT;

    loggers.ui.debug("🏗️ ProgramGrid ініціалізовано");
  }

  /**
   * Створює сітку програми
   * Ініціалізує DOM структуру та рендерить початковий стан
   */
  create() {
    try {
      this.gridContainer = this.createGridContainer();
      this.container.appendChild(this.gridContainer);
      this.renderGrid();

      // Встановлюємо висоту sidebar'ів після повного рендерингу
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.adjustSidebarHeights();
        }, 10);
      });

      loggers.ui.info("✅ Сітка програми створена");
    } catch (error) {
      loggers.ui.error("❌ Помилка створення сітки програми:", error);
      throw error;
    }
  }

  /**
   * Створює контейнер сітки
   * @returns {HTMLElement} DOM елемент сітки
   */
  createGridContainer() {
    const grid = document.createElement("div");
    grid.id = "program-grid";
    grid.className = "program-grid";
    return grid;
  }

  /**
   * Встановлює висоту sidebar'ів рівну висоті центральної області (панель управління + сітка)
   */
  adjustSidebarHeights() {
    // Знаходимо центральну область (.programmer-main)
    const programmerMain = document.querySelector(".programmer-main");
    if (!programmerMain) {
      loggers.ui.warn("❌ .programmer-main не знайдено");
      return;
    }

    // Отримуємо повну висоту центральної області (панель управління + сітка)
    const totalHeight = programmerMain.offsetHeight;

    // Знаходимо sidebar'и і встановлюємо їм висоту
    const sidebars = document.querySelectorAll(".programmer-sidebar");
    sidebars.forEach(sidebar => {
      sidebar.style.height = `${totalHeight}px`;
      sidebar.style.maxHeight = `${totalHeight}px`;
    });

    loggers.ui.debug(
      `✅ Висота sidebar'ів встановлена: ${totalHeight}px (= панель управління + сітка)`,
    );
  }

  /**
   * Створює окрему клітинку
   * @param x
   * @param y
   */
  createCell(x, y) {
    const cell = document.createElement("div");
    cell.className = "program-cell"; // Fixed: changed from grid-cell to program-cell
    cell.setAttribute("data-x", x);
    cell.setAttribute("data-y", y);
    // cell.textContent = `${x},${y}`; // Debug: coordinates removed

    // Додаємо обробник кліку
    cell.addEventListener("click", () => {
      this.handleCellClick(x, y);
    });

    // Додаємо обробник контекстного меню (правий клік)
    cell.addEventListener("contextmenu", e => {
      e.preventDefault();
      this.handleCellContextMenu(e, x, y);
    });

    // Drag & Drop handlers
    cell.addEventListener("dragover", e => this.handleDragOver(e, x, y));
    cell.addEventListener("dragleave", e => this.handleDragLeave(e, x, y));
    cell.addEventListener("drop", e => this.handleDrop(e, x, y));

    // Зберігаємо посилання на клітинку
    const key = `${x}-${y}`;
    this.gridCells.set(key, cell);

    return cell;
  }

  handleDragOver(e, x, y) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const cell = this.getCellElement(x, y);
    if (cell) cell.classList.add("drop-target");
  }

  handleDragLeave(e, x, y) {
    const cell = this.getCellElement(x, y);
    if (cell) cell.classList.remove("drop-target");
  }

  handleDrop(e, x, y) {
    e.preventDefault();
    const cell = this.getCellElement(x, y);
    if (cell) cell.classList.remove("drop-target");

    try {
      const data = e.dataTransfer.getData("application/json");
      if (!data) return;

      const payload = JSON.parse(data);
      // Handle drop from palette (action code) or internal move (if implemented later)
      if (payload.action !== undefined) {
        // It's an instruction object or action code
        const actionCode = payload.action;
        // Call the external handler if provided, or update directly if we had access to controller
        // Since ProgramGrid is view-only, we should trigger a callback or event
        // But for now, let's assume we need to notify the controller via a custom event or callback
        // The current architecture seems to rely on onCellClick.
        // We might need to extend the constructor to accept onDrop or similar.
        // For now, let's dispatch a custom event on the container

        const dropEvent = new CustomEvent("program-grid-drop", {
          detail: { x, y, action: actionCode, payload },
          bubbles: true,
        });
        this.container.dispatchEvent(dropEvent);

        loggers.ui.debug(`📥 Dropped action ${actionCode} at [${x}, ${y}]`);
      }
    } catch (err) {
      loggers.ui.error("❌ Drop handling error:", err);
    }
  }

  /**
   * Обробляє клік по клітинці
   * @param x
   * @param y
   */
  handleCellClick(x, y) {
    const position = y * GRID_WIDTH + x;
    this.setCursorPosition(position);

    if (this.onCellClick) {
      this.onCellClick(x, y);
    }
  }

  /**
   * Обробляє контекстне меню (правий клік) по клітинці
   * @param e
   * @param x
   * @param y
   */
  handleCellContextMenu(e, x, y) {
    const position = y * GRID_WIDTH + x; // Convert x,y to linear position
    const cellElement = e.target.closest(".program-cell");

    contextMenuManager.showProgramCellMenu(cellElement, position);
  }

  /**
   * Рендерить всю сітку з оптимізацією
   * Використовує batch updates для покращення продуктивності
   */
  renderGrid() {
    if (!this.gridContainer) {
      loggers.ui.error("❌ Grid container не знайдено!");
      return;
    }

    // Використовуємо requestAnimationFrame для плавності
    requestAnimationFrame(() => {
      const startTime = performance.now();

      // Очищаємо існуючу сітку
      this.gridContainer.innerHTML = "";
      this.gridCells.clear();

      // Створюємо DocumentFragment для batch updates
      const fragment = document.createDocumentFragment();

      // Створюємо всі клітинки
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          const cell = this.createCellElement(x, y);
          fragment.appendChild(cell);
        }
      }

      // Додаємо всі клітинки одним batch update
      this.gridContainer.appendChild(fragment);

      // Тепер оновлюємо вміст клітинок
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          this.updateCellDisplay(x, y);
        }
      }

      const renderTime = performance.now() - startTime;
      loggers.ui.debug(`🎨 Grid відрендерено за ${renderTime.toFixed(2)}ms`);

      // Логуємо попередження якщо рендер занадто повільний
      if (renderTime > 16) {
        // 16ms = 60fps
        loggers.ui.warn(
          `⚠️ Повільний рендер сітки: ${renderTime.toFixed(2)}ms (target: <16ms)`,
        );
      }

      this.adjustSidebarHeights();
    });
  }

  /**
   * Створює DOM елемент клітинки
   * @param {number} x - X координата
   * @param {number} y - Y координата
   * @returns {HTMLElement} DOM елемент клітинки
   */
  createCellElement(x, y) {
    const cell = document.createElement("div");
    cell.className = "program-cell";
    cell.setAttribute("data-x", x);
    cell.setAttribute("data-y", y);

    // Додаємо обробник кліку
    cell.addEventListener("click", () => {
      this.handleCellClick(x, y);
    });

    // Додаємо обробник контекстного меню
    cell.addEventListener("contextmenu", e => {
      e.preventDefault();
      this.handleCellContextMenu(e, x, y);
    });

    // Drag & Drop handlers
    cell.addEventListener("dragover", e => this.handleDragOver(e, x, y));
    cell.addEventListener("dragleave", e => this.handleDragLeave(e, x, y));
    cell.addEventListener("drop", e => this.handleDrop(e, x, y));

    // Зберігаємо посилання на клітинку
    const key = `${x}-${y}`;
    this.gridCells.set(key, cell);

    return cell;
  }

  /**
   * Оновлює відображення всієї сітки
   */
  updateDisplay() {
    try {
      loggers.ui.debug(
        `🔄 ProgramGrid updateDisplay called, current page: ${this.currentPage}`,
      );
      loggers.ui.debug(
        `📊 Program has ${this.program.instructions.length} total instructions`,
      );

      const pageInstructions = this.program.getPageInstructions(
        this.currentPage,
      );
      loggers.ui.debug(
        `📄 Page ${this.currentPage} has ${pageInstructions.length} instructions`,
      );

      const nonEmpty = pageInstructions.filter(i => i.action !== 0).length;
      loggers.ui.debug(
        `📌 Non-empty instructions on page ${this.currentPage}: ${nonEmpty}`,
      );

      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          try {
            this.updateCellDisplay(x, y);
          } catch (cellError) {
            loggers.ui.error(`❌ Error updating cell [${x}, ${y}]:`, cellError);
          }
        }
      }
      loggers.ui.debug("✅ ProgramGrid updateDisplay completed");
    } catch (error) {
      loggers.ui.error("❌ Error in updateDisplay:", error);
    }
  }

  /**
   * Оновлює відображення окремої клітинки
   * @param x
   * @param y
   */
  /**
   * Оновлює відображення клітинки з оптимізацією
   * Використовує dirty-checking для мінімізації DOM операцій
   * @param {number} x - X координата
   * @param {number} y - Y координата
   */
  updateCellDisplay(x, y) {
    try {
      const key = `${x}-${y}`;
      const cell = this.gridCells.get(key);

      if (!cell) return;

      const instruction = this.program.getInstructionAt(x, y, this.currentPage);

      // Отримуємо поточний стан клітинки
      const currentState = cell.dataset.state || "";
      const newState = this.getCellState(instruction);

      // Dirty-checking: оновлюємо тільки якщо стан змінився
      if (currentState === newState) {
        return; // Немає змін, пропускаємо оновлення
      }

      // Зберігаємо новий стан
      cell.dataset.state = newState;

      // Очищаємо клітинку
      cell.textContent = "";
      cell.className = "program-cell"; // Reset classes

      // Якщо інструкція порожня
      if (
        !instruction ||
        instruction.action === ProgAction.None ||
        instruction.action === 0
      ) {
        cell.classList.add("empty");
        return;
      }

      // Додаємо клас з дією
      cell.classList.add("has-action");

      // Add action code as data attribute for specific styling
      cell.setAttribute("data-action", instruction.action);

      // Get metadata
      const actionInfo = getActionByCode(instruction.action);
      const data = actionInfo ? ACTION_DATA[actionInfo.name] : null;

      // Create content container (cube face)
      const content = document.createElement("div");
      content.className = "cell-content";

      // 1. Icon (Emoji)
      const iconSpan = document.createElement("div");
      iconSpan.className = "action-icon";

      // Extract emoji from label if possible, otherwise use default
      let labelText =
        data?.label || actionInfo?.name || String(instruction.action);
      let emoji = "";
      let name = labelText;

      // Simple heuristic: if label starts with emoji (non-ascii or specific chars), split it
      // The metadata format is usually "EMOJI Name"
      // Fixed regex: removed nested brackets and pipes which caused SyntaxError
      const match = labelText.match(
        /^([\u{1F300}-\u{1F9FF}\u2700-\u27BF\u2600-\u26FF\u2000-\u3300\u{1F000}-\u{1FAFF}↑↓←→↖↗↘↙↺↻]+)\s*(.*)/u,
      );

      if (match) {
        emoji = match[1];
        name = match[2];
      } else {
        // Fallback if no emoji found or different format
        emoji = "";
        name = labelText;
      }

      iconSpan.textContent = emoji;
      content.appendChild(iconSpan);

      // 2. Name (Text)
      const nameSpan = document.createElement("div");
      nameSpan.className = "action-name";
      nameSpan.textContent = name;
      content.appendChild(nameSpan);

      // 3. Value/Label (if any)
      if (
        instruction.label ||
        (instruction.value !== null && instruction.value !== undefined)
      ) {
        const valueSpan = document.createElement("div");
        valueSpan.className = "action-value";

        let valueText = "";
        if (instruction.label) {
          // Handle variable format "A:B"
          if (instruction.label.includes(":")) {
            valueText = instruction.label.replace(":", "→");
          } else {
            valueText = instruction.label;
          }
        }

        if (instruction.value !== null && instruction.value !== undefined) {
          valueText += (valueText ? "=" : "") + instruction.value;
        }

        valueSpan.textContent = valueText;
        content.appendChild(valueSpan);
        cell.classList.add("has-value");
      }

      cell.appendChild(content);

      // Додаємо tooltip з повним описом
      const description = this.getActionDescription(instruction);
      cell.title = description;
    } catch (error) {
      loggers.ui.error(`❌ Помилка відображення клітинки [${x}, ${y}]:`, error);
      const cell = this.gridCells.get(`${x}-${y}`);
      if (cell) {
        cell.textContent = "ERR";
        cell.classList.add("error");
        cell.title = `Error: ${error.message}`;
      }
    }
  }

  /**
   * Генерує стан клітинки для dirty-checking
   * @param {Instruction} instruction - Інструкція
   * @returns {string} Серіалізований стан клітинки
   */
  getCellState(instruction) {
    if (
      !instruction ||
      instruction.action === ProgAction.None ||
      instruction.action === 0
    ) {
      return "empty";
    }
    return `${instruction.action}|${instruction.label || ""}|${instruction.value || ""}`;
  }

  /**
   * Отримує повний label дії для відображення (як в палитрі)
   * @param instruction - Instruction object with action, label, value
   */
  getActionShortCode(instruction) {
    if (!instruction) return "";

    const actionCode =
      instruction instanceof Instruction
        ? instruction.action
        : typeof instruction === "number"
          ? instruction
          : instruction.action;

    if (!actionCode || actionCode === ProgAction.None || actionCode === 0) {
      return "";
    }

    const actionInfo = getActionByCode(actionCode);
    if (!actionInfo) return String(actionCode);

    const data = ACTION_DATA[actionInfo.name];
    return data?.label || actionInfo.name;
  }

  /**
   * Отримує опис інструкції для tooltip
   * @param instruction
   */
  getActionDescription(instruction) {
    const actionInfo = getActionByCode(instruction.action);
    if (!actionInfo) return `Action: ${instruction.action}`;

    const data = ACTION_DATA[actionInfo.name];
    let description = data ? data.tooltip : actionInfo.name;

    if (instruction.label) {
      // Перевіряємо, чи це операція з двома лейблами (містить ":")
      if (instruction.label.includes(":")) {
        const [label1, label2] = instruction.label.split(":");
        description += ` (Vars: "${label1}" та "${label2}")`;
      } else {
        description += ` (Label: "${instruction.label}")`;
      }
    }

    if (instruction.value !== null && instruction.value !== undefined) {
      description += ` (Value: ${instruction.value})`;
    }

    return description;
  }

  /**
   * Встановлює висоту sidebar'ів рівну висоті центральної області (панель управління + сітка)
   */
  adjustSidebarHeights() {
    // Знаходимо центральну область (.programmer-main)
    const programmerMain = document.querySelector(".programmer-main");
    if (!programmerMain) {
      loggers.ui.warn("❌ .programmer-main не знайдено");
      return;
    }

    // Отримуємо повну висоту центральної області (панель управління + сітка)
    const totalHeight = programmerMain.offsetHeight;

    // Знаходимо sidebar'и і встановлюємо їм висоту
    const sidebars = document.querySelectorAll(".programmer-sidebar");
    sidebars.forEach(sidebar => {
      sidebar.style.height = `${totalHeight}px`;
      sidebar.style.maxHeight = `${totalHeight}px`;
    });

    loggers.ui.debug(
      `✅ Висота sidebar'ів встановлена: ${totalHeight}px (= панель управління + сітка)`,
    );
  }

  /**
   * Виділяє клітинку
   * @param x
   * @param y
   * @param highlight
   */
  highlightCell(x, y, highlight = true) {
    const key = `${x}-${y}`;
    const cell = this.gridCells.get(key);

    if (cell) {
      if (highlight) {
        cell.classList.add("highlighted");
      } else {
        cell.classList.remove("highlighted");
      }
    }
  }

  /**
   * Очищає всі виділення
   */
  clearHighlights() {
    this.gridCells.forEach(cell => {
      cell.classList.remove("highlighted");
    });
  }

  /**
   * Отримує елемент клітинки
   * @param x
   * @param y
   */
  getCellElement(x, y) {
    const key = `${x}-${y}`;
    return this.gridCells.get(key);
  }

  /**
   * Get current cursor position (linear index)
   * @returns {number|null} Linear index or null
   */

  /**
   * Get current cursor position (linear index)
   * @returns {number|null} Linear index or null
   */
  getCursorPosition() {
    return this.cursorPosition;
  }

  /**
   * Set the cursor position and update visual feedback
   * @param {number|null} position - Linear index or null to clear
   */
  setCursorPosition(position) {
    // Remove previous cursor
    if (this.cursorPosition !== null) {
      const prevX = this.cursorPosition % GRID_WIDTH;
      const prevY = Math.floor(this.cursorPosition / GRID_WIDTH);
      const prevCell = this.getCellElement(prevX, prevY);
      if (prevCell) {
        prevCell.classList.remove("active-cursor");
      }
    }

    this.cursorPosition = position;

    // Add new cursor
    if (this.cursorPosition !== null) {
      const x = this.cursorPosition % GRID_WIDTH;
      const y = Math.floor(this.cursorPosition / GRID_WIDTH);
      const cell = this.getCellElement(x, y);
      if (cell) {
        cell.classList.add("active-cursor");
      }
    }
  }

  /**
   * Update cell display by linear position
   * @param {number} position - Linear index
   * @param {Instruction} instruction - Instruction object
   */
  updateCell(position, instruction) {
    const x = position % GRID_WIDTH;
    const y = Math.floor(position / GRID_WIDTH);
    this.updateCellDisplay(x, y);
  }

  /**
   * Set the current page to display
   * @param {number} page - Page number (0-15)
   */
  setCurrentPage(page) {
    this.currentPage = page;
    loggers.ui.debug(`🔖 ProgramGrid страница изменена на ${page}`);
  }

  /**
   * Знищує сітку та очищає ресурси
   */
  destroy() {
    this.gridCells.clear();
    const grid = this.container.querySelector("#program-grid");
    if (grid) {
      grid.remove();
    }
    loggers.ui.debug("🗑️ ProgramGrid знищено");
  }
}
