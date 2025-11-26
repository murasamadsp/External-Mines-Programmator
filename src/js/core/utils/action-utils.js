import { ProgAction } from "../types/prog-action.js";
import { ACTION_METADATA } from "../data/action-metadata.js";

// ============================================================================
// Performance Optimization: Reverse Lookup Maps
// ============================================================================

/**
 * Pre-built reverse lookup map: code → action name
 * Built once for O(1) lookup performance
 * @type {Map<number, string>}
 */
const CODE_TO_NAME_MAP = new Map(
  Object.entries(ProgAction).map(([name, code]) => [code, name]),
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get action code by action name
 * @param {string} actionName
 * @returns {number|undefined}
 */
export const getActionCode = actionName => ProgAction[actionName];

/**
 * Get action name and code by action code
 * @param {number} code
 * @returns {{name: string, code: number}|null}
 */
export const getActionByCode = code => {
  const name = CODE_TO_NAME_MAP.get(code);
  return name ? { name, code } : null;
};

/**
 * Get action UI metadata by action name
 * @param {string} actionName
 * @returns {{label?: string, tooltip?: string}|null}
 */
export const getActionMetadata = actionName =>
  ACTION_METADATA[actionName] || null;

/**
 * Get action name by action code
 * @param {number} code
 * @returns {string|null}
 */
export const getActionName = code => CODE_TO_NAME_MAP.get(code) || null;

// ============================================================================
// Action Logic (Moved from ProgrammatorUI)
// ============================================================================

/**
 * Check if action needs a label
 * @param {number} actionCode
 * @returns {boolean}
 */
export const needsLabel = actionCode => {
  // Return false for null, undefined, or non-number values
  if (actionCode == null || typeof actionCode !== "number") {
    return false;
  }

  const actionsWithLabels = [
    ProgAction.Goto,
    ProgAction.Call,
    ProgAction.CallArg,
    ProgAction.CallState,
    ProgAction.Label,
    ProgAction.YesNoGoto,
    ProgAction.NoYesGoto,
    ProgAction.DebugPause,
    ProgAction.DebugShow,
    ProgAction.CallWhenDied,
    ProgAction.SetNumberToVar,
    ProgAction.AddNumberToVar,
    ProgAction.MultNumberToVar,
    ProgAction.DivNumberToVar,
    ProgAction.SubNumberToVar,
    ProgAction.VarGreaterThanNumber,
    ProgAction.VarLessThanNumber,
    ProgAction.VarEqualsNumber,
    ProgAction.VarGreaterThanOrEqualNumber,
    ProgAction.VarLessThanOrEqualNumber,
    ProgAction.VarNotEqualsNumber,
  ];
  return actionsWithLabels.includes(actionCode);
};

/**
 * Check if action needs a value
 * @param {number} actionCode
 * @returns {boolean}
 */
export const needsValue = actionCode => {
  // Return false for null, undefined, or non-number values
  if (actionCode == null || typeof actionCode !== "number") {
    return false;
  }

  const actionsWithValues = [
    ProgAction.SetNumberToVar,
    ProgAction.AddNumberToVar,
    ProgAction.MultNumberToVar,
    ProgAction.DivNumberToVar,
    ProgAction.SubNumberToVar,
    ProgAction.VarGreaterThanNumber,
    ProgAction.VarLessThanNumber,
    ProgAction.VarEqualsNumber,
    ProgAction.VarGreaterThanOrEqualNumber,
    ProgAction.VarLessThanOrEqualNumber,
    ProgAction.VarNotEqualsNumber,
    ProgAction.PlaySound,
  ];
  return actionsWithValues.includes(actionCode);
};

/**
 * Get default value for action
 * @param {number} actionCode
 * @returns {number}
 */
const DEFAULT_VALUES = {
  [ProgAction.SetNumberToVar]: 0,
  [ProgAction.AddNumberToVar]: 1,
  [ProgAction.MultNumberToVar]: 1,
  [ProgAction.DivNumberToVar]: 1,
  [ProgAction.SubNumberToVar]: 1,
  [ProgAction.PlaySound]: 1,
  [ProgAction.VarGreaterThanNumber]: 0,
  [ProgAction.VarLessThanNumber]: 0,
  [ProgAction.VarGreaterThanOrEqualNumber]: 0,
  [ProgAction.VarLessThanOrEqualNumber]: 0,
  [ProgAction.VarEqualsNumber]: 1,
  [ProgAction.VarNotEqualsNumber]: 1,
};

export const getDefaultValueForAction = actionCode =>
  DEFAULT_VALUES[actionCode] ?? 0;

/**
 * Check if action needs coordinates
 * @param {number} actionCode
 * @returns {boolean}
 */
export const needsCoordinates = actionCode => {
  // Return false for null, undefined, or non-number values
  if (actionCode == null || typeof actionCode !== "number") {
    return false;
  }

  return actionCode === ProgAction.Teleport;
};
