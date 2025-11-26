/**
 * Action UI Metadata
 * Maps action names to labels and tooltips
 * This file combines metadata from multiple specialized files
 */

import { ACTION_METADATA_BASIC } from "./action-metadata-basic.js";
import { ACTION_METADATA_CONTROL } from "./action-metadata-control.js";
import { ACTION_METADATA_ADVANCED } from "./action-metadata-advanced.js";
import { ACTION_METADATA_SETTINGS } from "./action-metadata-settings.js";
import { ACTION_CATEGORIES } from "./action-categories.js";

export const ACTION_METADATA = {
  ...ACTION_METADATA_BASIC,
  ...ACTION_METADATA_CONTROL,
  ...ACTION_METADATA_ADVANCED,
  ...ACTION_METADATA_SETTINGS,
};

export { ACTION_CATEGORIES };
