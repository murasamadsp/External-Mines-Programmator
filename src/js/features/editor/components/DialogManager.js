// Менеджер діалогів - CUSTOM UI IMPLEMENTATION
// Використовує кастомні діалогові вікна замість native prompt/confirm

import { loggers } from "../../../utils/logging/logger.js";
import { LabelDialog } from "./dialogs/LabelDialog.js";
import { NumberDialog } from "./dialogs/NumberDialog.js";
import { CoordinatesDialog } from "./dialogs/CoordinatesDialog.js";
import { TwoLabelsDialog } from "./dialogs/TwoLabelsDialog.js";
import { ConfirmDialog } from "./dialogs/ConfirmDialog.js";
import { InfoDialog } from "./dialogs/InfoDialog.js";

export class DialogManager {
  constructor() {
    loggers.ui.debug("🏗️ DialogManager (Custom) ініціалізовано");
  }

  // === PUBLIC METHODS ===

  async promptForLabel(defaultValue = "") {
    loggers.ui.debug("📱 Виклик Custom Label Dialog");
    const dialog = new LabelDialog(defaultValue);
    return await dialog.open();
  }

  async promptForNumber(defaultValue = 0, min = 0, max = 9999) {
    loggers.ui.debug("📱 Виклик Custom Number Dialog");
    const dialog = new NumberDialog(defaultValue, min, max);
    return await dialog.open();
  }

  async promptForCoordinates(defaultX = 0, defaultY = 0) {
    loggers.ui.debug("📱 Виклик Custom Coordinates Dialog");
    const dialog = new CoordinatesDialog(defaultX, defaultY);
    return await dialog.open();
  }

  async promptForTwoLabels(
    defaultLabel1 = "",
    defaultLabel2 = "",
    title = "Введіть імена змінних",
  ) {
    loggers.ui.debug("📱 Виклик Custom Two Labels Dialog");
    const dialog = new TwoLabelsDialog(defaultLabel1, defaultLabel2, title);
    return await dialog.open();
  }

  async showConfirmDialog(message, title = "Confirm") {
    loggers.ui.debug("📱 Виклик Custom Confirm Dialog");
    const dialog = new ConfirmDialog(message, title);
    return await dialog.open();
  }

  async showInfoDialog(message, title = "Info") {
    loggers.ui.debug("📱 Виклик Custom Info Dialog");
    const dialog = new InfoDialog(message, title);
    return await dialog.open();
  }
}
