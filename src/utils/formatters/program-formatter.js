// Program Formatting Utilities
// Provides functions to format program data for display

import {
  ProgAction,
  getActionByCode,
  GRID_WIDTH,
} from "../../core/constants/index.js";

/**
 * Gets human-readable action name
 * @param {number} actionCode - Action code
 * @returns {string} Human-readable action name
 */
export function getActionDisplayName(actionCode) {
  const actionData = getActionByCode(actionCode);
  if (!actionData) return `Unknown (${actionCode})`;

  // Convert camelCase to Title Case with spaces
  return actionData.name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Gets short code for grid display
 * @param {number} actionCode - Action code
 * @returns {string} Short code for display
 */
export function getActionShortCode(actionCode) {
  // For now, return action code as string since we removed shortCode from ProgAction
  // TODO: Implement proper short code mapping based on C# implementation
  return actionCode.toString();
}

/**
 * Formats instruction for display
 * @param {Object} instruction - Program instruction
 * @returns {Object} Formatted instruction data
 */
export function formatInstruction(instruction) {
  const actionName = getActionDisplayName(instruction.action);
  const shortCode = getActionShortCode(instruction.action);

  let description = actionName;
  const details = [];

  if (instruction.label) {
    details.push(`Label: ${instruction.label}`);
  }

  if (instruction.value !== null && instruction.value !== undefined) {
    details.push(`Value: ${instruction.value}`);
  }

  if (details.length > 0) {
    description += ` (${details.join(", ")})`;
  }

  return {
    shortCode,
    displayName: actionName,
    description,
    details,
  };
}

/**
 * Converts grid position to instruction index
 * @param {number} x - X coordinate (0-15)
 * @param {number} y - Y coordinate (0-11)
 * @returns {number} Instruction index
 */
export function gridPositionToIndex(x, y) {
  return y * GRID_WIDTH + x;
}

/**
 * Converts instruction index to grid position
 * @param {number} index - Instruction index
 * @returns {Object} Grid position {x, y}
 */
export function indexToGridPosition(index) {
  return {
    x: index % GRID_WIDTH,
    y: Math.floor(index / GRID_WIDTH),
  };
}

/**
 * Formats program size information
 * @param {number} instructionCount - Number of instructions
 * @returns {string} Formatted size string
 */
export function formatProgramSize(instructionCount) {
  const total = GRID_WIDTH * 12; // Assuming 12 rows
  const percentage = Math.round((instructionCount / total) * 100);
  return `${instructionCount}/${total} instructions (${percentage}%)`;
}

/**
 * Creates a summary of program statistics
 * @param {Array} instructions - Program instructions
 * @returns {Object} Program statistics
 */
export function getProgramStatistics(instructions) {
  const stats = {
    totalInstructions: instructions.length,
    uniqueActions: new Set(),
    labels: new Set(),
    jumps: 0,
    conditions: 0,
    movements: 0,
    buildings: 0,
    emptyCells: 0,
  };

  instructions.forEach((inst) => {
    stats.uniqueActions.add(inst.action);

    if (inst.action === ProgAction.None) {
      stats.emptyCells++;
    } else if (inst.action === ProgAction.Label) {
      stats.labels.add(inst.label);
    } else if (
      [
        ProgAction.Goto,
        ProgAction.Call,
        ProgAction.CallArg,
        ProgAction.YesNoGoto,
        ProgAction.NoYesGoto,
      ].includes(inst.action)
    ) {
      stats.jumps++;
    } else if (
      [
        ProgAction.MoveUp,
        ProgAction.MoveDown,
        ProgAction.MoveLeft,
        ProgAction.MoveRight,
        ProgAction.MoveForward,
        ProgAction.RotateUp,
        ProgAction.RotateDown,
        ProgAction.RotateLeft,
        ProgAction.RotateRight,
        ProgAction.RotateRandom,
      ].includes(inst.action)
    ) {
      stats.movements++;
    } else if (
      [
        ProgAction.BuildBlock,
        ProgAction.BuildRoad,
        ProgAction.BuildQuadro,
      ].includes(inst.action)
    ) {
      stats.buildings++;
    } else if (inst.action >= 48 && inst.action <= 88) {
      // Condition range (48-88 in new enum)
      stats.conditions++;
    }
  });

  stats.uniqueActions = stats.uniqueActions.size;
  stats.labels = stats.labels.size;

  return stats;
}
