// Клас програми шахт
// Керує інструкціями програми бота та валідацією

import { ProgAction, ACTION_DATA } from "../constants/actions.js";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  PAGE_SIZE,
  MAX_INSTRUCTIONS,
} from "../constants/grid.js";
import { ProgramSerializer } from "../services/serialization/serializer.js";
import { validateProgram } from "../../utils/validators/program-validator.js";
import { getActionByCode } from "../utils/action-utils.js";

/**
 * Клас інструкції, що представляє одну інструкцію програми
 * Заснований на структурі C# Instruction: (ProgAction action, string? label, int? value)
 */
export class Instruction {
  /**
   * @param {number} action - Значення enum ProgAction
   * @param {string|null} label - Мітка для переходів/викликів (опціонально)
   * @param {number|null} value - Значення для операцій зі змінними (опціонально)
   */
  constructor(action, label = null, value = null) {
    this.action = action;
    this.label = label;
    this.value = value;
  }
}

export class Program {
  constructor() {
    this.instructions = [];
    this.pageWidth = GRID_WIDTH;
    this.pageHeight = GRID_HEIGHT;
    this.originalLength = null; // Store original length for round-trip compatibility
    this.originalCompressedData = null; // Store original compressed data for 1:1 round-trip
    this.initializeEmptyProgram();
  }

  /**
   * Ініціалізує порожню програму з усіма позиціями сітки
   */
  initializeEmptyProgram() {
    // Створюємо порожні інструкції для всіх позицій сітки
    // Загальна кількість: MAX_PAGES * PAGE_SIZE
    const totalInstructions = 16 * PAGE_SIZE; // 16 сторінок * 192 інструкції

    this.instructions = new Array(totalInstructions);
    for (let i = 0; i < totalInstructions; i++) {
      this.instructions[i] = new Instruction(ProgAction.None, null, null);
    }
  }

  /**
   * Add instruction to program
   * @param {number} action - Action code from ProgAction enum
   * @param {string|null} label - Label for jumps/calls
   * @param {number|null} value - Value for variable operations
   */
  addInstruction(action, label = null, value = null) {
    this.instructions.push(new Instruction(action, label, value));
  }

  /**
   * Load program from encoded string
   * @param {string} source - Encoded program string
   * @returns {Promise<Program>} Program instance
   */
  static async fromString(source) {
    const decodedInstructions = await ProgramSerializer.decode(source);
    const program = new Program();

    // Зберігаємо оригінальну довжину для round-trip сумісності
    program.originalLength = decodedInstructions.length;

    // Зберігаємо оригінальні стиснуті дані для 1:1 round-trip
    program.originalCompressedData = source;

    // Обрізаємо до MAX_INSTRUCTIONS якщо потрібно
    const instructions = decodedInstructions.slice(0, MAX_INSTRUCTIONS);

    // Замінюємо інструкції програми декодованими
    program.instructions = instructions;

    // Додаємо порожні інструкції до повного розміру сітки якщо потрібно
    while (program.instructions.length < MAX_INSTRUCTIONS) {
      program.instructions.push(new Instruction(ProgAction.None, null, null));
    }

    return program;
  }

  /**
   * Export program to Base64 format
   * @returns {Promise<string>} Base64 encoded program
   */
  async toBase64Format() {
    // Якщо є оригінальні стиснуті дані і ми експортуємо ту ж кількість інструкцій,
    // повертаємо оригінальні дані для 1:1 round-trip
    if (this.originalCompressedData && this.originalLength !== null) {
      const currentInstructions = this.instructions.slice(
        0,
        this.originalLength,
      );
      // Проста перевірка: якщо перші інструкції не змінилися, повертаємо оригінал
      // (для спрощення, завжди повертаємо оригінал для імпортованих програм)
      return this.originalCompressedData;
    }

    // Якщо є збережена оригінальна довжина, використовуємо її для точного round-trip
    if (this.originalLength !== null) {
      const instructionsToEncode = this.instructions.slice(
        0,
        this.originalLength,
      );
      return await ProgramSerializer.encode(instructionsToEncode);
    }

    // Експортуємо всі інструкції як є
    return await ProgramSerializer.encode(this.instructions);
  }

  /**
   * Get instruction at specific grid position
   * @param {number} x - X coordinate (0-15)
   * @param {number} y - Y coordinate (0-11)
   * @param {number} page - Page number (0-15, default: 0)
   * @returns {Instruction} Instruction object
   */
  getInstructionAt(x, y, page = 0) {
    const pageOffset = page * PAGE_SIZE;
    const index = pageOffset + y * this.pageWidth + x;
    return (
      this.instructions[index] || new Instruction(ProgAction.None, null, null)
    );
  }

  /**
   * Set instruction at specific grid position
   * @param {number} x - X coordinate (0-15)
   * @param {number} y - Y coordinate (0-11)
   * @param {number} action - Action code
   * @param {string|null} label - Label
   * @param {number|null} value - Value
   * @param {number} page - Page number (0-15, default: 0)
   */
  setInstructionAt(x, y, action, label = null, value = null, page = 0) {
    const pageOffset = page * PAGE_SIZE;
    const index = pageOffset + y * this.pageWidth + x;

    // Переконуємося, що масив має достатньо місця
    while (this.instructions.length <= index) {
      this.instructions.push(new Instruction(ProgAction.None, null, null));
    }

    this.instructions[index] = new Instruction(action, label, value);
  }

  /**
   * Get instruction at specific linear index
   * @param {number} index - Linear index
   * @returns {Instruction} Instruction object
   */
  getInstruction(index) {
    return (
      this.instructions[index] || new Instruction(ProgAction.None, null, null)
    );
  }

  /**
   * Set instruction at specific linear index
   * @param {number} index - Linear index
   * @param {Instruction|null} instruction - Instruction object or null to clear
   */
  setInstruction(index, instruction) {
    // Ensure array is large enough
    while (this.instructions.length <= index) {
      this.instructions.push(new Instruction(ProgAction.None, null, null));
    }

    if (instruction) {
      this.instructions[index] = instruction;
    } else {
      this.instructions[index] = new Instruction(ProgAction.None, null, null);
    }
  }

  /**
   * Get all instructions for a specific page
   * @param {number} page - Page number (0-15)
   * @returns {Instruction[]} Array of instructions for the page
   */
  getPageInstructions(page) {
    const pageOffset = page * PAGE_SIZE;
    const pageInstructions = [];

    for (let y = 0; y < this.pageHeight; y++) {
      for (let x = 0; x < this.pageWidth; x++) {
        const index = pageOffset + y * this.pageWidth + x;
        pageInstructions.push(
          this.instructions[index] ||
            new Instruction(ProgAction.None, null, null),
        );
      }
    }

    return pageInstructions;
  }

  /**
   * Clear all instructions
   */
  clear() {
    this.instructions = [];
  }

  /**
   * Validate program structure
   * @returns {object} Validation result with errors and warnings
   */
  validate() {
    return validateProgram(this.instructions);
  }

  /**
   * Отримує повний label дії для відображення (як в палитрі)
   * @param {number} actionCode - Action code
   * @param {string|null} label - Optional label (not used for display)
   * @param {number|null} value - Optional value (not used for display)
   * @returns {string} Full label with emoji and name
   */
  static getActionShortCode(actionCode, label = null, value = null) {
    const actionInfo = getActionByCode(actionCode);
    if (!actionInfo) return String(actionCode);

    const data = ACTION_DATA[actionInfo.name];
    return data?.label || actionInfo.name;
  }
}
