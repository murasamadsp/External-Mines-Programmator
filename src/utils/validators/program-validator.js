// Program Validation Utilities
// Provides comprehensive validation for program instructions

import {
  ProgAction,
  GRID_SIZE,
  MAX_LABEL_LENGTH,
} from "../../core/constants/index.js";

/**
 * Validates a program instruction
 * @param {Object} instruction - Instruction to validate
 * @returns {Object} Validation result with errors and warnings
 */
export function validateInstruction(instruction) {
  const errors = [];
  const warnings = [];

  // Validate action code
  if (
    typeof instruction.action !== "number" ||
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
 * @returns {Object} Validation result with errors and warnings
 */
export function validateProgram(instructions) {
  const errors = [];
  const warnings = [];

  // Check program size
  if (instructions.length > GRID_SIZE) {
    errors.push(`Program too large: maximum ${GRID_SIZE} instructions allowed`);
  }

  if (instructions.length === 0) {
    warnings.push("Program is empty");
  }

  // Check for start instruction
  const hasStart = instructions.some(
    (inst) => inst.action === ProgAction.SetStart
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
      ...instValidation.errors.map((err) => `Instruction ${index}: ${err}`)
    );
    warnings.push(
      ...instValidation.warnings.map((warn) => `Instruction ${index}: ${warn}`)
    );

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
  jumps.forEach((label) => {
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
