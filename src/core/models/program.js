// Mines Program Class
// Manages bot program instructions and validation

import {
  ProgAction,
  getActionCode,
  GRID_WIDTH,
  GRID_HEIGHT,
  GRID_SIZE,
  PAGE_SIZE,
  MAX_PAGES,
  ProgramSerializer,
} from "../index.js";
import {
  validateProgram,
  getActionDisplayName,
} from "../../utils/index.js";

/**
 * Instruction class representing a single program instruction
 * Based on C# Instruction struct: (ProgAction action, string? label, int? value)
 */
export class Instruction {
  /**
   * @param {number} action - ProgAction enum value
   * @param {string|null} label - Label for jumps/calls (optional)
   * @param {number|null} value - Value for variable operations (optional)
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
    const instructions = await ProgramSerializer.decode(source);
    const program = new Program();

    // Use the decoded instructions directly (should be full grid)
    program.instructions = instructions;

    // Ensure we have at least one page of instructions
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
    // Export all instructions from the grid (including empty ones)
    // The game may need empty positions represented in the program
    console.log("📊 Exporting", this.instructions.length, "instructions (all from grid)");

    // If no instructions, return minimal program
    if (this.instructions.length === 0) {
      return await ProgramSerializer.encode([new Instruction(ProgAction.None, "0", null)]);
    }

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

    // Ensure array has enough space
    while (this.instructions.length <= index) {
      this.instructions.push(new Instruction(ProgAction.None, null, null));
    }

    this.instructions[index] = new Instruction(action, label, value);
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
          this.instructions[index] || new Instruction(ProgAction.None, null, null)
        );
      }
    }

    return pageInstructions;
  }

  /**
   * Set instruction object at specific grid position
   * @param {number} x - X coordinate (0-15)
   * @param {number} y - Y coordinate (0-11)
   * @param {Instruction} instruction - Instruction object
   */
  setInstructionObjectAt(x, y, instruction) {
    const index = y * this.pageWidth + x;
    while (this.instructions.length <= index) {
      this.instructions.push(new Instruction(ProgAction.None, null, null));
    }
    this.instructions[index] = instruction;
  }

  /**
   * Clear all instructions
   */
  clear() {
    this.instructions = [];
  }

  /**
   * Validate program structure
   * @returns {Object} Validation result with errors and warnings
   */
  validate() {
    return validateProgram(this.instructions);
  }

  /**
   * Get action name for display
   * @param {number} actionCode - Action code
   * @returns {string} Human-readable action name
   */
  static getActionName(actionCode) {
    return getActionDisplayName(actionCode);
  }

  /**
   * Get short action code for display
   * @param {number} actionCode - Action code
   * @returns {string} Short code for grid display
   */
  static getActionShortCode(actionCode) {
    return getShortCode(actionCode);
  }
}
