/**
 * Complete Action UI Metadata
 * Максимально уніфікована система на основі правил та шаблонів
 * Мінімум коду, максимум автоматизації
 */

import { ProgAction } from "../types/prog-action.js";

// Мапа напрямків для автоматичної генерації
const DIRECTION_MAP = {
  Up: { emoji: "↑", name: "Up", desc: "вгору" },
  Down: { emoji: "↓", name: "Down", desc: "вниз" },
  Left: { emoji: "←", name: "Left", desc: "вліво" },
  Right: { emoji: "→", name: "Right", desc: "вправо" },
  Forward: { emoji: "↗️", name: "Forward", desc: "вперед" },
  Backwards: { emoji: "⬅️", name: "Back", desc: "назад" },
  Lefthand: { emoji: "↺", name: "Left Hand", desc: "лівою рукою" },
  Righthand: { emoji: "↻", name: "Right Hand", desc: "правою рукою" },
  UpLeft: { emoji: "↖", name: "Up-Left", desc: "вгорі-зліва" },
  UpRight: { emoji: "↗", name: "Up-Right", desc: "вгорі-справа" },
  DownLeft: { emoji: "↙", name: "Down-Left", desc: "знизу-зліва" },
  DownRight: { emoji: "↘", name: "Down-Right", desc: "знизу-справа" },
};

// Мапа типів дій для автоматичної генерації
const ACTION_TYPE_MAP = {
  Move: { emoji: "↑", name: "Move", desc: "Рухатися" },
  Rotate: { emoji: "🔄", name: "Rotate", desc: "Повернути" },
  Build: { emoji: "🧱", name: "Build", desc: "Будувати" },
  Use: { emoji: "💎", name: "Use", desc: "Використати" },
  Dig: { emoji: "⛏️", name: "Dig", desc: "Копати" },
  Heal: { emoji: "💚", name: "Heal", desc: "Лікувати" },
  Shift: { emoji: "⬆️", name: "Shift", desc: "Зсув" },
  Cell: { emoji: "[●]", name: "Cell", desc: "Клітинка" },
  Is: { emoji: "❓", name: "Is", desc: "Перевірка" },
  Var: { emoji: "📊", name: "Var", desc: "Змінна" },
  Enable: { emoji: "⚡", name: "Enable", desc: "Увімкнути" },
  Disable: { emoji: "❌", name: "Disable", desc: "Вимкнути" },
  Inventory: { emoji: "📦", name: "Inventory", desc: "Інвентар" },
  Box: { emoji: "📦", name: "Box", desc: "Коробка" },
  Call: { emoji: "📞", name: "Call", desc: "Виклик" },
  Return: { emoji: "⬅️", name: "Return", desc: "Повернення" },
  Goto: { emoji: "➡️", name: "Goto", desc: "Перейти" },
  Label: { emoji: "🏷️", name: "Label", desc: "Мітка" },
  Debug: { emoji: "⏸️", name: "Debug", desc: "Відлагодження" },
};

// Спеціальні емодзі для конкретних дій (мінімальний набір)
const SPECIAL_EMOJI = {
  None: "⬜",
  NextLine: "⏎",
  SetStart: "🏁",
  Terminate: "⏹️",
  RepeatLastAction: "🔄",
  RotateRandom: "🎲",
  PlaySound: "🔊",
  BooleanOR: "∨",
  BooleanAND: "∧",
  IsNotEmpty: "🚫",
  IsEmpty: "✅",
  IsFalling: "📉",
  IsCrystal: "💎",
  IsAliveCrystal: "🌟",
  IsBreakable: "🔨",
  IsUnbreakable: "🛡️",
  IsHealthNotFull: "❤️",
  IsHealthLessThanHalf: "❤️",
  CallWhenDied: "💀",
  SetStartWhenDied: "💀",
  SetStartWhenHurt: "🤕",
  SetStartWhenBotNearby: "👤",
  UseBoom: "💣",
  UseRaz: "🔪",
  UseProt: "🛡️",
  BuildWar: "⚔️",
  EnableAutoDig: "⚡",
  DisableAutoDig: "❌",
  EnableAggression: "😠",
  DisableAggression: "😇",
  EnableHand: "🤚",
  DisableHand: "✋",
  DebugPause: "⏸️",
  DebugShow: "👁️",
};

// Спеціальні описи (мінімальний набір)
const SPECIAL_DESC = {
  None: "Порожня дія",
  NextLine: "Наступний рядок",
  SetStart: "Встановити початок програми",
  Terminate: "Завершити програму",
  RepeatLastAction: "Повторити останню дію",
  RotateRandom: "Випадковий поворот",
  PlaySound: "Програти звук",
  BooleanOR: "Логічне АБО",
  BooleanAND: "Логічне І",
  IsNotEmpty: "Не порожньо",
  IsEmpty: "Порожньо",
  IsFalling: "Падає",
  IsCrystal: "Кристал",
  IsAliveCrystal: "Живий кристал",
  IsBreakable: "Можна зламати",
  IsUnbreakable: "Неможливо зламати",
  IsHealthNotFull: "Здоров'я не повне",
  IsHealthLessThanHalf: "Здоров'я менше половини",
};

/**
 * Конвертує CamelCase в читабельний формат
 * @param {string} name - Назва для форматування
 * @returns {string} Відформатована назва
 */
function formatName(name) {
  return name
    .replace(/([A-Z][a-z]+)/g, " $1")
    .replace(/([A-Z]+)/g, " $1")
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Знаходить напрямок в назві дії
 * Перевіряє складніші напрямки спочатку (UpLeft перед Up)
 * @param {string} actionName - Назва дії
 * @returns {object|null} Інформація про напрямок або null
 */
function findDirection(actionName) {
  // Сортуємо за довжиною (довші спочатку) для правильного пошуку
  const sortedDirs = Object.entries(DIRECTION_MAP).sort(
    (a, b) => b[0].length - a[0].length,
  );

  for (const [dir, data] of sortedDirs) {
    if (actionName.includes(dir)) {
      return data;
    }
  }
  return null;
}

/**
 * Знаходить тип дії в назві
 * @param {string} actionName - Назва дії
 * @returns {object|null} Інформація про тип дії або null
 */
function findActionType(actionName) {
  for (const [type, data] of Object.entries(ACTION_TYPE_MAP)) {
    if (actionName.startsWith(type)) {
      return data;
    }
  }
  return null;
}

/**
 * Генерує метадані для дії з напрямком
 * @param {string} actionName - Назва дії
 * @param {object} direction - Інформація про напрямок
 * @param {object} actionType - Інформація про тип дії
 * @returns {object} Метадані дії
 */
function generateDirectionalActionMetadata(actionName, direction, actionType) {
  let finalEmoji, finalName, finalDesc;

  // Для Cell дій використовуємо формат [emoji]
  if (actionType.bracketFormat) {
    finalEmoji = `[${direction.emoji}]`;
  } else {
    finalEmoji = direction.emoji;
  }

  finalName = `${actionType.name} ${direction.name}`;
  finalDesc = `${actionType.desc} ${direction.desc}`;

  return { finalEmoji, finalName, finalDesc };
}

/**
 * Генерує опис для дії з типом
 * @param {string} actionName - Назва дії
 * @param {object} actionType - Інформація про тип дії
 * @param {object} direction - Інформація про напрямок
 * @returns {string} Опис дії
 */
function generateActionTypeDescription(actionName, actionType, direction) {
  const rest = actionName
    .replace(new RegExp(`^${actionType.name}`, "i"), "")
    .trim();

  if (!rest) {
    return actionType.desc;
  }

  // Для Enable/Disable дій
  if (actionType.name === "Enable" || actionType.name === "Disable") {
    const feature = formatName(rest).toLowerCase();
    return actionType.name === "Enable"
      ? `Увімкнути ${feature}`
      : `Вимкнути ${feature}`;
  }

  // Для Var дій
  if (actionType.name === "Var") {
    const operation = formatName(rest).toLowerCase();
    return `Операція змінної: ${operation}`;
  }

  // Для Inventory дій
  if (actionType.name === "Inventory" && direction) {
    return `Інвентар ${direction.desc}`;
  }

  // Для Box дій
  if (actionType.name === "Box") {
    const boxType = formatName(rest).toLowerCase();
    return `Коробка: ${boxType}`;
  }

  // Загальний випадок
  const restFormatted = formatName(rest).toLowerCase();
  return `${actionType.desc} ${restFormatted}`;
}

/**
 * Генерує метадані для спеціальних випадків (UNUSED, UNKNOWN)
 * @param {string} actionName - Назва дії
 * @returns {object} Метадані дії
 */
function generateSpecialActionMetadata(actionName) {
  let finalEmoji, finalName, finalDesc;

  if (actionName.startsWith("UNUSED_")) {
    finalEmoji = "🚫";
    finalName = `Unused ${actionName.replace("UNUSED_", "")}`;
    finalDesc = `Невикористовувана дія ${actionName.replace("UNUSED_", "")}`;
  } else if (
    actionName.startsWith("UNKNOWN_") ||
    actionName.startsWith("Var_UNK_")
  ) {
    finalEmoji = "❓";
    const num = actionName.replace(/^(UNKNOWN_|Var_UNK_)/, "");
    finalName = actionName.startsWith("Var_")
      ? `Var Unknown ${num}`
      : `Unknown ${num}`;
    finalDesc = actionName.startsWith("Var_")
      ? `Невідома операція змінної ${num}`
      : `Невідома дія ${num}`;
  } else {
    finalEmoji = "🔧";
    finalDesc = formatName(actionName);
    finalName = formatName(actionName);
  }

  return { finalEmoji, finalName, finalDesc };
}

/**
 * Генерує метадані для однієї дії
 * @param {string} actionName - Назва дії
 * @returns {object} Метадані з label та tooltip
 */
function generateMetadataForAction(actionName) {
  // Знаходимо напрямок та тип
  const direction = findDirection(actionName);
  const actionType = findActionType(actionName);

  // Спеціальні емодзі та описи
  const emoji = SPECIAL_EMOJI[actionName];
  const specialDesc = SPECIAL_DESC[actionName];

  let finalEmoji = emoji || null;
  let finalName = formatName(actionName);
  let finalDesc = specialDesc;

  // Якщо є напрямок та тип - генеруємо автоматично
  if (direction && actionType && !finalEmoji) {
    const metadata = generateDirectionalActionMetadata(
      actionName,
      direction,
      actionType,
    );
    finalEmoji = metadata.finalEmoji;
    finalName = metadata.finalName;
    finalDesc = metadata.finalDesc;
  } else if (actionType) {
    // Якщо немає емодзі, використовуємо емодзі типу
    if (!finalEmoji) {
      finalEmoji = actionType.emoji;
    }

    // Форматуємо назву
    const rest = actionName
      .replace(new RegExp(`^${actionType.name}`, "i"), "")
      .trim();
    finalName = rest
      ? `${actionType.name} ${formatName(rest)}`
      : actionType.name;

    // Генеруємо опис
    if (!finalDesc) {
      finalDesc = generateActionTypeDescription(
        actionName,
        actionType,
        direction,
      );
    }
  } else if (!finalEmoji) {
    // Спеціальні випадки
    const metadata = generateSpecialActionMetadata(actionName);
    finalEmoji = metadata.finalEmoji;
    finalName = metadata.finalName;
    finalDesc = metadata.finalDesc;
  }

  // Якщо опис не встановлено, використовуємо назву
  if (!finalDesc) {
    finalDesc = finalName;
  }

  return {
    label: `${finalEmoji} ${finalName}`,
    tooltip: finalDesc,
  };
}

/**
 * Генерує повний набір метаданих
 */
function generateCompleteMetadata() {
  const metadata = {};
  for (const actionName of Object.keys(ProgAction)) {
    metadata[actionName] = generateMetadataForAction(actionName);
  }
  return metadata;
}

export const ACTION_METADATA_COMPLETE = generateCompleteMetadata();
