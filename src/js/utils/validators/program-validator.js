// Program Validation Utilities
// Provides comprehensive validation for program instructions

import { ProgAction } from "../../core/constants/actions.js";
import {
  MAX_INSTRUCTIONS,
  MAX_LABEL_LENGTH,
} from "../../core/constants/grid.js";

/**
 * Validates a program instruction
 * @param {object} instruction - Instruction to validate
 * @returns {object} Validation result with errors and warnings
 */
export function validateInstruction(instruction) {
  const errors = [];
  const warnings = [];

  if (!instruction || typeof instruction !== "object") {
    return {
      isValid: false,
      errors: ["Instruction must be an object"],
      warnings,
    };
  }

  // Validate action code
  if (
    !Number.isInteger(instruction.action) ||
    instruction.action < 0 ||
    instruction.action > 255
  ) {
    errors.push("Invalid action code: must be a number between 0 and 255");
  }

  // Validate label
  if (instruction.label !== null && instruction.label !== undefined) {
    if (typeof instruction.label !== "string") {
      errors.push("Label must be a string");
    } else if (instruction.label.length > MAX_LABEL_LENGTH) {
      errors.push(`Label too long: maximum ${MAX_LABEL_LENGTH} characters`);
    } else if (!/^[A-Z0-9]{1,3}$/.test(instruction.label)) {
      warnings.push("Label should contain only uppercase letters and numbers");
    }
  }

  // Validate value for variable operations
  if (instruction.value !== null && instruction.value !== undefined) {
    if (typeof instruction.value !== "number") {
      errors.push("Value must be a number");
    } else if (!Number.isFinite(instruction.value)) {
      warnings.push("Value should be an integer");
    } else if (!Number.isInteger(instruction.value)) {
      warnings.push("Value should be an integer");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an entire program
 * @param {Array} instructions - Array of program instructions
 * @returns {object} Validation result with errors and warnings
 */
export function validateProgram(instructions) {
  const errors = [];
  const warnings = [];

  // Check if instructions is valid
  if (!Array.isArray(instructions)) {
    errors.push("Instructions must be an array");
    return { isValid: false, errors, warnings };
  }

  // Check program size
  if (instructions.length > MAX_INSTRUCTIONS) {
    errors.push(
      `Program too large: maximum ${MAX_INSTRUCTIONS} instructions allowed`,
    );
  }

  if (instructions.length === 0) {
    warnings.push("Program is empty");
  }

  // Check for start instruction
  const hasStart = instructions.some(
    inst =>
      inst && typeof inst === "object" && inst.action === ProgAction.SetStart,
  );
  if (!hasStart) {
    warnings.push("No start position defined (use SetStart action)");
  }

  // Validate labels and jumps
  const labels = new Set();
  const jumps = new Set();

  instructions.forEach((inst, index) => {
    // Validate individual instruction
    const instValidation = validateInstruction(inst);
    errors.push(
      ...instValidation.errors.map(err => `Instruction ${index}: ${err}`),
    );
    warnings.push(
      ...instValidation.warnings.map(warn => `Instruction ${index}: ${warn}`),
    );

    // Do not inspect fields on malformed entries after reporting the error.
    // Validation must be total: arbitrary input should produce diagnostics,
    // never throw and take down import/autosave flows.
    if (!inst || typeof inst !== "object") {
      return;
    }

    // Collect labels
    if (inst.action === ProgAction.Label && inst.label) {
      if (labels.has(inst.label)) {
        errors.push(`Duplicate label "${inst.label}" at position ${index}`);
      }
      labels.add(inst.label);
    }

    // Collect jumps
    if (
      [
        ProgAction.Goto,
        ProgAction.Call,
        ProgAction.CallArg,
        ProgAction.YesNoGoto,
        ProgAction.NoYesGoto,
      ].includes(inst.action) &&
      inst.label
    ) {
      jumps.add(inst.label);
    }
  });

  // Check for undefined labels
  jumps.forEach(label => {
    if (!labels.has(label)) {
      warnings.push(`Undefined label "${label}" referenced in jump/call`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
