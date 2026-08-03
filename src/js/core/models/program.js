// Клас програми шахт
// Керує інструкціями програми бота та валідацією

import { ProgAction, ACTION_DATA } from "../constants/actions.js";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  PAGE_SIZE,
  MAX_INSTRUCTIONS,
  MAX_PAGES,
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
    this.serializedLength = 0;
    this.pageWidth = GRID_WIDTH;
    this.pageHeight = GRID_HEIGHT;
  }

  /**
   * Ініціалізує порожню програму з усіма позиціями сітки
   */
  initializeEmptyProgram() {
    // Створюємо порожні інструкції для всіх позицій сітки
    // Загальна кількість: MAX_PAGES * PAGE_SIZE
    const totalInstructions = MAX_PAGES * PAGE_SIZE;

    this.instructions = new Array(totalInstructions);
    for (let i = 0; i < totalInstructions; i++) {
      this.instructions[i] = new Instruction(ProgAction.None, null, null);
    }
    this.serializedLength = totalInstructions;
  }

  /**
   * Add instruction to program
   * @param {number} action - Action code from ProgAction enum
   * @param {string|null} label - Label for jumps/calls
   * @param {number|null} value - Value for variable operations
   */
  addInstruction(action, label = null, value = null) {
    // Accept an Instruction instance as well as the scalar form. This keeps
    // callers from accidentally nesting an instruction inside `action`.
    if (
      action instanceof Instruction ||
      (action && typeof action === "object")
    ) {
      this.instructions.push(
        new Instruction(
          action.action,
          action.label ?? null,
          action.value ?? null,
        ),
      );
      this.serializedLength = this.instructions.length;
      return;
    }
    this.instructions.push(new Instruction(action, label, value));
    this.serializedLength = this.instructions.length;
  }

  /**
   * Load program from encoded string
   * @param {string} source - Encoded program string
   * @returns {Promise<Program>} Program instance
   */
  static async fromString(source) {
    const decodedInstructions = await ProgramSerializer.decode(source);
    const program = new Program();

    // Keep all serialized pages, while still protecting the editor from an
    // oversized payload.
    const instructions = decodedInstructions.slice(0, MAX_INSTRUCTIONS);

    // Замінюємо інструкції програми декодованими
    program.instructions = instructions;

    // Keep one full page available to the editor, but remember the actual
    // payload length so export remains byte-for-byte stable.
    program.serializedLength = instructions.length;
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
    // Keep the encoded length exact so sparse positions on later pages are
    // not shifted when a program is exported again.
    if (this.instructions.length === 0) {
      return await ProgramSerializer.encode([
        new Instruction(ProgAction.None, "0", null),
      ]);
    }

    const serializedLength = Math.min(
      Math.max(this.serializedLength || this.instructions.length, 1),
      MAX_INSTRUCTIONS,
    );
    const instructionsToEncode = this.instructions.slice(0, serializedLength);
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
    try {
      return this.getInstruction(this.getIndex(x, y, page));
    } catch {
      return new Instruction(ProgAction.None, null, null);
    }
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
    const index = this.getIndex(x, y, page);

    // Переконуємося, що масив має достатньо місця
    while (this.instructions.length <= index) {
      this.instructions.push(new Instruction(ProgAction.None, null, null));
    }

    this.instructions[index] = new Instruction(action, label, value);
    this.serializedLength = Math.max(this.serializedLength, index + 1);
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
    if (!Number.isInteger(index) || index < 0 || index >= MAX_INSTRUCTIONS) {
      throw new RangeError(`Instruction index out of range: ${index}`);
    }

    // Ensure array is large enough
    while (this.instructions.length <= index) {
      this.instructions.push(new Instruction(ProgAction.None, null, null));
    }

    if (instruction) {
      this.instructions[index] = new Instruction(
        instruction.action,
        instruction.label ?? null,
        instruction.value ?? null,
      );
    } else {
      this.instructions[index] = new Instruction(ProgAction.None, null, null);
    }
    this.serializedLength = Math.max(this.serializedLength, index + 1);
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
    this.serializedLength = 0;
  }

  getIndex(x, y, page = 0) {
    if (
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      !Number.isInteger(page) ||
      x < 0 ||
      x >= this.pageWidth ||
      y < 0 ||
      y >= this.pageHeight ||
      page < 0 ||
      page >= MAX_PAGES
    ) {
      throw new RangeError(`Invalid program position: (${x}, ${y}, ${page})`);
    }

    return page * PAGE_SIZE + y * this.pageWidth + x;
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
