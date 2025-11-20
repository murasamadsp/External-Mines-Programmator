// Сітка програми - окремий модуль для відображення та взаємодії з сіткою
// Відповідає тільки за візуалізацію та обробку кліків по клітинках

import {
  GRID_WIDTH,
  GRID_HEIGHT,
  ProgAction,
} from "../../../core/index.js";
import { loggers } from "../../../utils/index.js";
import { ACTION_DATA, getActionByCode } from "../../../core/constants/actions.js";
import { contextMenuManager } from "../../../core/services/context-menu-manager.js";

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
      loggers.ui.info("✅ Сітка програми створена");
    } catch (error) {
      loggers.ui.error("❌ Помилка створення сітки програми:", error);
    }
  }

  /**
   * Створює окрему клітинку
   */
  createCell(x, y) {
    const cell = document.createElement("div");
    cell.className = "program-cell"; // Fixed: changed from grid-cell to program-cell
    cell.setAttribute("data-x", x);
    cell.setAttribute("data-y", y);

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
   */
  handleCellContextMenu(e, x, y) {
    const position = y * GRID_WIDTH + x; // Convert x,y to linear position
    const cellElement = e.target.closest('.program-cell');

    contextMenuManager.showProgramCellMenu(cellElement, position);
  }

  /**
   * Оновлює відображення всієї сітки
   */
  updateDisplay() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        this.updateCellDisplay(x, y);
      }
    }
  }

  /**
   * Оновлює відображення окремої клітинки
   */
  updateCellDisplay(x, y) {
    const key = `${x}-${y}`;
    const cell = this.gridCells.get(key);

    if (!cell) return;

    const instruction = this.program.getInstructionAt(
      x,
      y,
      this.currentPage
    );

    // Очищаємо клітинку
    cell.textContent = "";
    cell.className = "program-cell"; // Fixed: changed from grid-cell to program-cell

    // Якщо інструкція порожня
    if (!instruction || instruction.action === 0) {
      cell.classList.add("empty");
      return;
    }

    // Додаємо клас з дією
    cell.classList.add("has-action");

    // Відображаємо короткий код дії
    const shortCode = this.getActionShortCode(instruction.action);
    cell.textContent = shortCode;

    // Додаємо tooltip з повним описом
    const description = this.getActionDescription(instruction);
    cell.title = description;
  }

  /**
   * Отримує короткий код дії для відображення
   */
  getActionShortCode(action) {
    const actionInfo = getActionByCode(action);
    if (!actionInfo) return action.toString();

    const data = ACTION_DATA[actionInfo.name];
    if (!data) return action.toString();

    // Extract icon/short code from label (e.g., "↑ Move Up" -> "↑")
    const match = data.label.match(/^([^\s]+)/);
    return match ? match[1] : data.label.substring(0, 2);
  }

  /**
   * Отримує опис інструкції для tooltip
   */
  getActionDescription(instruction) {
    const actionInfo = getActionByCode(instruction.action);
    if (!actionInfo) return `Action: ${instruction.action}`;

    const data = ACTION_DATA[actionInfo.name];
    let description = data ? data.tooltip : actionInfo.name;

    if (instruction.label) {
      description += ` (Label: "${instruction.label}")`;
    }

    if (instruction.value !== null && instruction.value !== undefined) {
      description += ` (Value: ${instruction.value})`;
    }

    return description;
  }

  /**
   * Виділяє клітинку
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
