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
  Object.entries(ProgAction).map(([name, code]) => [code, name])
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get action code by action name
 * @param {string} actionName
 * @returns {number|undefined}
 */
export const getActionCode = (actionName) => ProgAction[actionName];

/**
 * Get action name and code by action code
 * @param {number} code
 * @returns {{name: string, code: number}|null}
 */
export const getActionByCode = (code) => {
  const name = CODE_TO_NAME_MAP.get(code);
  return name ? { name, code } : null;
};

/**
 * Get action UI metadata by action name
 * @param {string} actionName
 * @returns {{label?: string, tooltip?: string}|null}
 */
export const getActionMetadata = (actionName) => {
  return ACTION_METADATA[actionName] || null;
};

/**
 * Get action name by action code
 * @param {number} code
 * @returns {string|null}
 */
export const getActionName = (code) => CODE_TO_NAME_MAP.get(code) || null;

// ============================================================================
// Action Logic (Moved from ProgrammatorUI)
// ============================================================================

/**
 * Check if action needs a label
 * @param {number} actionCode
 * @returns {boolean}
 */
export const needsLabel = (actionCode) => {
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
export const needsValue = (actionCode) => {
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
export const getDefaultValueForAction = (actionCode) => {
  switch (actionCode) {
    case ProgAction.SetNumberToVar:
      return 0;
    case ProgAction.AddNumberToVar:
    case ProgAction.MultNumberToVar:
    case ProgAction.DivNumberToVar:
    case ProgAction.SubNumberToVar:
      return 1;
    case ProgAction.PlaySound:
      return 1;
    case ProgAction.VarGreaterThanNumber:
    case ProgAction.VarLessThanNumber:
    case ProgAction.VarGreaterThanOrEqualNumber:
    case ProgAction.VarLessThanOrEqualNumber:
      return 0;
    case ProgAction.VarEqualsNumber:
    case ProgAction.VarNotEqualsNumber:
      return 1;
    default:
      return 0;
  }
};

/**
 * Check if action needs coordinates
 * @param {number} actionCode
 * @returns {boolean}
 */
export const needsCoordinates = (actionCode) => {
  return actionCode === ProgAction.Teleport;
};
