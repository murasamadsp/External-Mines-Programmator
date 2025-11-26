/**
 * @file Unified Actions Definition (Facade)
 * Re-exports definitions from modular files for backward compatibility.
 */

import { ProgAction as ProgActionEnum } from "../types/prog-action.js";
import {
  ACTION_METADATA,
  ACTION_CATEGORIES as Categories,
} from "../data/action-metadata.js";
import * as ActionUtils from "../utils/action-utils.js";

// Re-export Enum
export const ProgAction = ProgActionEnum;

// Re-export Categories
export const ACTION_CATEGORIES = Categories;

// Re-export Utils
export const { getActionCode } = ActionUtils;
export const { getActionByCode } = ActionUtils;
export const { getActionMetadata } = ActionUtils;
export const { getActionName } = ActionUtils;

// Re-construct ACTIONS object (The "Big Map") for backward compatibility
// ACTIONS = { Name: { code: 1, label: "...", tooltip: "..." } }
export const ACTIONS = Object.fromEntries(
  Object.entries(ProgActionEnum).map(([name, code]) => {
    const metadata = ACTION_METADATA[name] || {};
    return [
      name,
      {
        code,
        ...metadata,
      },
    ];
  }),
);

// Re-construct ACTION_DATA (Legacy Metadata Only)
export const ACTION_DATA = Object.fromEntries(
  Object.entries(ACTION_METADATA).map(([name, data]) => [name, data]),
);

// Validation Helpers (Proxied)
export const isValidActionName = name => name in ProgActionEnum;
export const isValidActionCode = code =>
  ActionUtils.getActionName(code) !== null;
export const hasMetadata = name => !!ACTION_METADATA[name];
export const getActionsWithMetadata = () => Object.keys(ACTION_METADATA);
export const getActionsByCategory = cat => Categories[cat] || [];
export const getCategoryForAction = actionName => {
  for (const [category, actions] of Object.entries(Categories)) {
    if (actions.includes(actionName)) return category;
  }
  return null;
};
export const getTotalActionsCount = () => Object.keys(ProgActionEnum).length;
export const isUnknownOrUnused = name =>
  name.startsWith("UNKNOWN_") || name.startsWith("UNUSED_");
export const getActionDefinition = name => ACTIONS[name] || null;
