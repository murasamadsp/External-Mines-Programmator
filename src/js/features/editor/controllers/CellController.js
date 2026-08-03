// CellController - відповідає за обробку подій клітинок сітки
// Принцип єдиної відповідальності: тільки взаємодія з клітинками

import { ProgAction } from "../../../core/constants/actions.js";
import { getActionByCode } from "../../../core/constants/actions.js";
import { getDefaultValueForAction as getDefaultValue } from "../../../core/utils/action-utils.js";
import { loggers } from "../../../utils/logging/logger.js";
import { rafDebounce } from "../../../utils/performance/performance-utils.js";

export class CellController {
  constructor(program, dialogManager, uiController) {
    this.program = program;
    this.dialogManager = dialogManager;
    this.uiController = uiController;
    this.selectedAction = null;

    // Оптимізація: debounced UI updates для кращої продуктивності
    this.debouncedUpdateCellDisplay = rafDebounce((x, y) => {
      this.uiController.updateCellDisplay(x, y);
    });
  }

  /**
   * Встановлює вибрану дію
   * @param action
   */
  setSelectedAction(action) {
    if (action === null || action === undefined || action === "") {
      this.selectedAction = null;
    } else if (typeof action === "number") {
      this.selectedAction = action;
    } else {
      this.selectedAction = ProgAction[action] ?? null;
    }
    loggers.editor.debug(`🎯 Вибрано дію: ${action} (${this.selectedAction})`);
  }

  /**
   * Отримує назву дії за її кодом
   * @param actionCode
   */
  getActionName(actionCode) {
    if (!actionCode && actionCode !== 0) return "None";
    const actionInfo = getActionByCode(actionCode);
    return actionInfo ? actionInfo.name : `Unknown(${actionCode})`;
  }

  /**
   * Обробляє клік по клітинці сітки
   * @param x
   * @param y
   * @param currentPage
   */
  async onCellClick(x, y, currentPage) {
    loggers.editor.debug(
      `🖱️ Клік по клітинці: [${x}, ${y}] (сторінка ${currentPage})`,
    );

    const existingInstruction = this.program.getInstructionAt(
      x,
      y,
      currentPage,
    );

    // Without a selected action, clicking an occupied cell clears it. With a
    // selected action, replace the cell instead of deleting it first.
    if (
      existingInstruction.action !== ProgAction.None &&
      !this.selectedAction
    ) {
      const actionName = this.getActionName(existingInstruction.action);
      loggers.editor.info(
        `🗑️ Видаляємо інструкцію "${actionName}" з [${x}, ${y}]`,
      );
      this.program.setInstructionAt(
        x,
        y,
        ProgAction.None,
        null,
        null,
        currentPage,
      );
      this.debouncedUpdateCellDisplay(x, y);
      loggers.editor.debug("✅ Інструкцію видалено, клітинка тепер порожня");
      return;
    }

    // Якщо клітинка порожня і дія вибрана - розміщуємо її
    if (this.selectedAction) {
      await this.placeActionAt(x, y, this.selectedAction, currentPage);
    } else {
      loggers.editor.debug(
        "ℹ️ Клік по порожній клітинці без вибраної дії - ігнорується",
      );
    }
  }

  /**
   * Розміщує дію в клітинці з обробкою параметрів
   * @param x
   * @param y
   * @param actionCode
   * @param currentPage
   */
  async placeActionAt(x, y, actionCode, currentPage) {
    const startTime = performance.now();
    let label = null;
    let value = null;

    const actionName = this.getActionName(actionCode);
    loggers.editor.debug(
      `🔧 Розміщення дії ${actionCode} (${actionName}) на [${x}, ${y}] (сторінка ${currentPage})`,
    );

    try {
      // Перевіряємо, чи потрібен лейбл
      if (this.needsLabel(actionCode)) {
        loggers.editor.info(
          `🏷️ Дія потребує лейбл: ${this.getActionName(actionCode)}`,
        );
        label = await this.dialogManager.promptForLabel();
        if (label === null) {
          loggers.editor.info("❌ Введення лейблу скасовано");
          return; // Скасовано
        }
        loggers.editor.info(`✅ Отримано лейбл: "${label}"`);
      }

      // Перевіряємо, чи потрібне значення
      if (this.needsValue(actionCode)) {
        const defaultValue = this.getDefaultValueForAction(actionCode);
        loggers.editor.info(
          `🔢 Дія потребує значення: ${this.getActionName(actionCode)}, за замовчуванням: ${defaultValue}`,
        );
        value = await this.dialogManager.promptForNumber(defaultValue);
        if (value === null) {
          loggers.editor.info("❌ Введення значення скасовано");
          return; // Скасовано
        }
        loggers.editor.info(`✅ Отримано значення: ${value}`);
      }

      // Перевіряємо, чи потрібні два лейбли (для порівняння змінних)
      let label2 = null;
      if (this.needsTwoLabels(actionCode)) {
        loggers.editor.info(
          `🏷️ Дія потребує двох лейблів: ${this.getActionName(actionCode)}`,
        );
        const labels = await this.dialogManager.promptForTwoLabels();
        if (labels === null) {
          loggers.editor.info("❌ Введення лейблів скасовано");
          return; // Скасовано
        }
        label = labels.label1;
        label2 = labels.label2;
        loggers.editor.info(`✅ Отримано лейбли: "${label}" та "${label2}"`);
      }

      // Перевіряємо, чи потрібні координати
      if (this.needsCoordinates(actionCode)) {
        loggers.editor.info(
          `📍 Дія потребує координат: ${this.getActionName(actionCode)}`,
        );
        const coords = await this.dialogManager.promptForCoordinates();
        if (coords === null) {
          loggers.editor.info("❌ Введення координат скасовано");
          return; // Скасовано
        }
        value = coords;
        loggers.editor.info(`✅ Отримано координати: ${coords}`);
      }

      // Для операцій з двома лейблами зберігаємо їх у форматі "label1:label2"
      if (label2 !== null) {
        label = `${label}:${label2}`;
        value = null; // Очищаємо value, оскільки використовуємо label
      }

      // Розміщуємо інструкцію
      this.program.setInstructionAt(
        x,
        y,
        actionCode,
        label,
        value,
        currentPage,
      );
      this.debouncedUpdateCellDisplay(x, y);

      const totalTime = performance.now() - startTime;
      const details = [];
      if (label) details.push(`лейбл: "${label}"`);
      if (value !== null && value !== undefined)
        details.push(`значення: ${value}`);
      const detailsStr = details.length > 0 ? ` (${details.join(", ")})` : "";

      loggers.editor.info(
        `✅ Розміщено дію "${actionName}" в [${x}, ${y}]${detailsStr} (${totalTime.toFixed(2)}ms)`,
      );
    } catch (error) {
      loggers.editor.error(
        `❌ Помилка розміщення дії ${actionName} в [${x}, ${y}]:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Перевіряє, чи потрібен лейбл для дії
   * @param actionCode
   */
  needsLabel(actionCode) {
    const result = [
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
      // Команды переменных тоже могут требовать label для имени переменной
      ProgAction.WriteStateToVar,
      ProgAction.ReadVarToState,
      ProgAction.AddStateToVar,
      ProgAction.MultStateToVar,
      ProgAction.DivStateToVar,
      ProgAction.SubStateToVar,
      ProgAction.SetNumberToVar,
      ProgAction.AddNumberToVar,
      ProgAction.MultNumberToVar,
      ProgAction.DivNumberToVar,
      ProgAction.SubNumberToVar,
      ProgAction.AddVarToVar,
      ProgAction.MultVarToVar,
      ProgAction.DivVarToVar,
      ProgAction.SubVarToVar,
      ProgAction.VarLessThanState,
      ProgAction.VarGreaterThanState,
      ProgAction.VarEqualsState,
      ProgAction.VarGreaterThanOrEqualsState,
      ProgAction.VarLessThanOrEqualState,
      ProgAction.VarNotEqualsState,
      ProgAction.VarGreaterThanNumber,
      ProgAction.VarLessThanNumber,
      ProgAction.VarEqualsNumber,
      ProgAction.VarGreaterThanOrEqualNumber,
      ProgAction.VarLessThanOrEqualNumber,
      ProgAction.VarNotEqualsNumber,
    ].includes(actionCode);

    if (result) {
      loggers.editor.debug(
        `🏷️ Команда ${this.getActionName(actionCode)} (${actionCode}) потребує лейбл`,
      );
    }

    return result;
  }

  /**
   * Перевіряє, чи потрібні два лейбли для дії (для порівняння змінних)
   * @param actionCode
   */
  needsTwoLabels(actionCode) {
    const result = [
      ProgAction.VarGreaterThanVar,
      ProgAction.VarLessThanVar,
      ProgAction.VarGreaterThanOrEqualVar,
      ProgAction.VarLessThanOrEqualVar,
      ProgAction.VarEqualsVar,
      ProgAction.VarNotEqualsVar,
    ].includes(actionCode);

    if (result) {
      loggers.editor.debug(
        `🏷️ Дія ${this.getActionName(actionCode)} (${actionCode}) потребує два лейбли`,
      );
    }

    return result;
  }

  /**
   * Перевіряє, чи потрібне значення для дії
   * @param actionCode
   */
  needsValue(actionCode) {
    const result = [
      // Команды операций с состоянием
      ProgAction.AddStateToVar,
      ProgAction.MultStateToVar,
      ProgAction.DivStateToVar,
      ProgAction.SubStateToVar,
      // Команды установки переменных
      ProgAction.SetNumberToVar,
      ProgAction.AddNumberToVar,
      ProgAction.MultNumberToVar,
      ProgAction.DivNumberToVar,
      ProgAction.SubNumberToVar,
      // Команды сравнения с числами
      ProgAction.VarGreaterThanNumber,
      ProgAction.VarLessThanNumber,
      ProgAction.VarEqualsNumber,
      ProgAction.VarGreaterThanOrEqualNumber,
      ProgAction.VarLessThanOrEqualNumber,
      ProgAction.VarNotEqualsNumber,
      // Другие команды, которые могут требовать значений
      ProgAction.PlaySound,
    ].includes(actionCode);

    if (result) {
      loggers.editor.debug(
        `🔢 Команда ${this.getActionName(actionCode)} (${actionCode}) потребує значення`,
      );
    }

    return result;
  }

  /**
   * Перевіряє, чи потрібні координати для дії
   * @param actionCode
   */
  needsCoordinates(actionCode) {
    return actionCode === ProgAction.Teleport; // Додайте інші дії з координатами
  }

  /**
   * Отримує значення за замовчуванням для дії
   * @param {number} actionCode - Код дії
   * @returns {number} Значення за замовчуванням
   */
  getDefaultValueForAction(actionCode) {
    return getDefaultValue(actionCode);
  }

  /**
   * Очищає ресурси контролера клітинок
   */
  destroy() {
    loggers.editor.debug("🧹 Очищення CellController...");
    this.program = null;
    this.dialogManager = null;
    this.uiController = null;
    this.selectedAction = null;
    loggers.editor.debug("✅ CellController очищено");
  }
}
