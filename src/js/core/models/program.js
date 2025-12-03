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
import { Instruction } from "../types/instruction.js";

/**
 * Клас для керування програмою бота шахтаря
 * Забезпечує зберігання, валідацію та серіалізацію інструкцій
 */
export class Program {
  /**
   * Створює нову порожню програму
   */
  constructor() {
    this.instructions = [];
    this.pageWidth = GRID_WIDTH;
    this.pageHeight = GRID_HEIGHT;
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

    // Обрізаємо до PAGE_SIZE якщо потрібно
    const instructions = decodedInstructions.slice(0, PAGE_SIZE);

    // Замінюємо інструкції програми декодованими
    program.instructions = instructions;

    // Додаємо порожні інструкції до PAGE_SIZE якщо потрібно
    while (program.instructions.length < PAGE_SIZE) {
      program.instructions.push(new Instruction(ProgAction.None, null, null));
    }

    return program;
  }

  /**
   * Export program to Base64 format
   * @returns {Promise<string>} Base64 encoded program
   */
  async toBase64Format() {
    // Експортуємо всі інструкції із сітки (включаючи порожні)
    // Грі можуть знадобитися порожні позиції, представлені в програмі

    // Якщо немає інструкцій, повертаємо мінімальну програму
    if (this.instructions.length === 0) {
      return await ProgramSerializer.encode([
        new Instruction(ProgAction.None, "0", null),
      ]);
    }

    // Trim to MAX_INSTRUCTIONS to prevent validation errors
    // C# EncodeV2 doesn't validate length, but we need to prevent memory issues
    const instructionsToEncode = this.instructions.slice(0, MAX_INSTRUCTIONS);
    return await ProgramSerializer.encode(instructionsToEncode);
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
   * @param {string|null} _label - Optional label (not used for display)
   * @param {number|null} _value - Optional value (not used for display)
   * @returns {string} Full label with emoji and name
   */
  static getActionShortCode(actionCode, _label = null, _value = null) {
    const actionInfo = getActionByCode(actionCode);
    if (!actionInfo) return String(actionCode);

    const data = ACTION_DATA[actionInfo.name];
    return data?.label || actionInfo.name;
  }
}
