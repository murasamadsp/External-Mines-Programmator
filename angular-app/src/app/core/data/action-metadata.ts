import { ProgAction } from "../models/program.model";

const DIRECTION_MAP: Record<string, { emoji: string; name: string; desc: string }> = {
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

const ACTION_TYPE_MAP: Record<string, {
    emoji: string;
    name: string;
    desc: string;
    bracketFormat?: boolean;
  }> = {
  Move: { emoji: "↑", name: "Move", desc: "Рухатися" },
  Rotate: { emoji: "🔄", name: "Rotate", desc: "Повернути" },
  Build: { emoji: "🧱", name: "Build", desc: "Будувати" },
  Use: { emoji: "💎", name: "Use", desc: "Використати" },
  Dig: { emoji: "⛏️", name: "Dig", desc: "Копати" },
  Heal: { emoji: "💚", name: "Heal", desc: "Лікувати" },
  Shift: { emoji: "⬆️", name: "Shift", desc: "Зсув" },
  Cell: { emoji: "[●]", name: "Cell", desc: "Клітинка", bracketFormat: true },
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

const SPECIAL_EMOJI: Record<string, string> = {
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
  STDDig: "⛏️",
  STDBlock: "🧱",
  STDHeal: "💚",
  STDTunnel: "🚇",

  Upgrade: "⬆️",
  RefillCraft: "⚒️",
  UseGeopack: "🎒",
  UseZZ: "💤",
  UseC190: "🔫",
  UsePoly: "🧬",
  UseNano: "🤖",
  UseRem: "🔧",
  ChargeGun: "🔋",
  UseGeo: "🌍",

  // New Actions
  IsSand: "🏖️",
  IsQuadro: "🔲",
  IsRoad: "🛣️",
  IsRedBlock: "🟥",
  IsYellowBlock: "🟨",
  IsGreenBlock: "🟩",
  IsBlackRock: "🌑",
  IsAcid: "🧪",
  IsLava: "🌋",
  IsBoulder: "🪨",
  IsAcidRock: "🧪",
  IsCyanAlive: "👤",
  IsWhiteAlive: "👤",
  IsRedAlive: "👤",
  IsVioletAlive: "👤",
  IsBlackAlive: "👤",
  IsBlueAlive: "👤",
  IsRainbowAlive: "🌈",
  IsBox: "📦",
  IsStructure: "🏗️",
  IsBasketFull: "🧺",
  IsGeoFull: "🌍",
  IsInsideGun: "🔫",
  Flip: "🙃",
  
  // Box Colors
  BoxAll: "📦",
  BoxHalf: "📦",
  BoxWhite: "⬜",
  BoxGreen: "🟩",
  BoxRed: "🟥",
  BoxBlue: "🟦",
  BoxCyan: "🟦",
  BoxViolet: "🟪",
};

const SPECIAL_DESC: Record<string, string> = {
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
  STDDig: "Стандартне копання",
  STDBlock: "Стандартний блок",
  STDHeal: "Стандартне лікування",
  STDTunnel: "Стандартний тунель",
  UseBoom: "Використати Boom",
  UseRaz: "Використати Raz",
  UseProt: "Використати Prot",
  BuildWar: "Військова забудова",
  Upgrade: "Покращити",
  RefillCraft: "Поповнити крафт",
  UseGeopack: "Геопак",
  UseZZ: "Використати ZZ",
  UseC190: "Використати C190",
  UsePoly: "Використати Poly",
  UseNano: "Використати Nano",
  UseRem: "Використати Rem",
  ChargeGun: "Зарядити зброю",
  UseGeo: "Використати Geo",

  // New Descriptions
  IsSand: "Пісок",
  IsQuadro: "Квадро",
  IsRoad: "Дорога",
  IsRedBlock: "Червоний блок",
  IsYellowBlock: "Жовтий блок",
  IsGreenBlock: "Зелений блок",
  IsBlackRock: "Чорна скеля",
  IsAcid: "Кислота",
  IsLava: "Лава",
  IsBoulder: "Валун",
  IsAcidRock: "Кислотна скеля",
  IsCyanAlive: "Живий (Блакитний)",
  IsWhiteAlive: "Живий (Білий)",
  IsRedAlive: "Живий (Червоний)",
  IsVioletAlive: "Живий (Фіолетовий)",
  IsBlackAlive: "Живий (Чорний)",
  IsBlueAlive: "Живий (Синій)",
  IsRainbowAlive: "Живий (Веселка)",
  IsBox: "Коробка",
  IsStructure: "Структура",
  IsBasketFull: "Кошик повний",
  IsGeoFull: "Гео повний",
  IsInsideGun: "Всередині гармати",
  Flip: "Переворот",
  
  // Box Descriptions
  BoxAll: "Всі коробки",
  BoxHalf: "Половина коробок",
  BoxWhite: "Біла коробка",
  BoxGreen: "Зелена коробка",
  BoxRed: "Червона коробка",
  BoxBlue: "Синя коробка",
  BoxCyan: "Блакитна коробка",
  BoxViolet: "Фіолетова коробка",
};

function formatName(name: string): string {
  return name
    .replace(/([A-Z][a-z]+)/g, " $1")
    .replace(/([A-Z]+)/g, " $1")
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function findDirection(actionName: string) {
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

function findActionType(actionName: string) {
  for (const [type, data] of Object.entries(ACTION_TYPE_MAP)) {
    if (actionName.startsWith(type)) {
      return data;
    }
  }
  return null;
}

function generateMetadataForAction(actionName: string) {
  const direction = findDirection(actionName);
  const actionType = findActionType(actionName);

  const emoji = SPECIAL_EMOJI[actionName];
  const specialDesc = SPECIAL_DESC[actionName];

  let finalEmoji = emoji || null;
  let finalName = formatName(actionName);
  let finalDesc = specialDesc;

  if (direction && actionType && !finalEmoji) {
    if (actionType.bracketFormat) {
      finalEmoji = `[${direction.emoji}]`;
    } else {
      finalEmoji = direction.emoji;
    }
    finalName = `${actionType.name} ${direction.name}`;
    finalDesc = `${actionType.desc} ${direction.desc}`;
  } else if (actionType) {
    if (!finalEmoji) {
      finalEmoji = actionType.emoji;
    }

    const rest = actionName
      .replace(new RegExp(`^${actionType.name}`, "i"), "")
      .trim();
    finalName = rest
      ? `${actionType.name} ${formatName(rest)}`
      : actionType.name;

    if (rest && !finalDesc) {
      if (actionType.name === "Enable" || actionType.name === "Disable") {
        const feature = formatName(rest).toLowerCase();
        finalDesc =
          actionType.name === "Enable"
            ? `Увімкнути ${feature}`
            : `Вимкнути ${feature}`;
      } else if (actionType.name === "Var") {
        const operation = formatName(rest).toLowerCase();
        finalDesc = `Операція змінної: ${operation}`;
      } else if (actionType.name === "Inventory" && direction) {
        finalDesc = `Інвентар ${direction.desc}`;
      } else if (actionType.name === "Box") {
        const boxType = formatName(rest).toLowerCase();
        finalDesc = `Коробка: ${boxType}`;
      } else {
        const restFormatted = formatName(rest).toLowerCase();
        finalDesc = `${actionType.desc} ${restFormatted}`;
      }
    } else if (!finalDesc) {
      finalDesc = actionType.desc;
    }
  } else if (!finalEmoji) {
    if (actionName.startsWith("Unused")) {
      finalEmoji = "🚫";
      finalName = `Unused ${actionName.replace("Unused", "")}`;
      finalDesc = `Невикористовувана дія ${actionName.replace("Unused", "")}`;
    } else if (
      actionName.startsWith("Unknown") ||
      actionName.startsWith("VarUnknown")
    ) {
      finalEmoji = "❓";
      const num = actionName.replace(/^(Unknown|VarUnknown)/, "");
      finalName = actionName.startsWith("Var")
        ? `Var Unknown ${num}`
        : `Unknown ${num}`;
      finalDesc = actionName.startsWith("Var")
        ? `Невідома операція змінної ${num}`
        : `Невідома дія ${num}`;
    } else {
      finalEmoji = "🔧";
      finalDesc = finalDesc || formatName(actionName);
    }
  }

  if (!finalDesc) {
    finalDesc = finalName;
  }

  return {
    label: `${finalEmoji} ${finalName}`,
    tooltip: finalDesc,
  };
}

function generateCompleteMetadata() {
  const metadata: Record<string, { label: string; tooltip: string }> = {};
  // Iterate over string keys of ProgAction enum
  for (const actionName in ProgAction) {
    if (isNaN(Number(actionName))) {
      metadata[actionName] = generateMetadataForAction(actionName);
    }
  }
  return metadata;
}

export const ACTION_METADATA = generateCompleteMetadata();
