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
import { Instruction } from "../../../core/models/program.js";

export class ProgramGrid {
  constructor(container, program, onCellClick) {
    this.container = container;
    this.program = program;
    this.onCellClick = onCellClick;
    this.currentPage = 0; // Current page being displayed
    this.gridCells = new Map(); // Map для швидкого доступу до клітинок
    this.cursorPosition = null; // Linear index of the active cell

    loggers.ui.debug("🏗️ ProgramGrid ініціалізовано");
  }

  /**
   * Створює сітку програми (16x12)
   */
  create() {
    try {
      const grid = document.createElement("div");
      grid.id = "program-grid";
      grid.className = "program-grid";

      // Створюємо сітку клітинок
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          const cell = this.createCell(x, y);
          grid.appendChild(cell);
        }
      }

      this.container.appendChild(grid);

      // Встановлюємо висоту sidebar'ів після повного рендерингу
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.adjustSidebarHeights();
        }, 10);
      });

      loggers.ui.info("✅ Сітка програми створена");
    } catch (error) {
      loggers.ui.error("❌ Помилка створення сітки програми:", error);
    }
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
    sidebars.forEach((sidebar) => {
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
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.handleCellContextMenu(e, x, y);
    });

    // Зберігаємо посилання на клітинку
    const key = `${x}-${y}`;
    this.gridCells.set(key, cell);

    return cell;
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

      const nonEmpty = pageInstructions.filter((i) => i.action !== 0).length;
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
  updateCellDisplay(x, y) {
    try {
      const key = `${x}-${y}`;
      const cell = this.gridCells.get(key);

      if (!cell) return;

      const instruction = this.program.getInstructionAt(x, y, this.currentPage);

      // Очищаємо клітинку
      cell.textContent = "";
      cell.className = "program-cell"; // Fixed: changed from grid-cell to program-cell

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

      // Відображаємо повний label дії (як в палитрі)
      const label = this.getActionShortCode(instruction);
      if (label) {
        cell.textContent = label;
      }

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
    this.gridCells.forEach((cell) => {
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
