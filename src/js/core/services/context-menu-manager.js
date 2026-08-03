// Context Menu Manager for Right-Click Actions
// Provides context-sensitive menus for program cells and UI elements

import { loggers } from "../../utils/logging/logger.js";
import { stateManager } from "./state-manager.js";
import { ProgAction } from "../constants/actions.js";
import { GRID_WIDTH } from "../constants/grid.js";

// Action descriptions from documentation
const ACTION_INFO = {
  // Рухові команди
  MoveUp: "Рухатися вгору на одну клітинку",
  MoveLeft: "Рухатися вліво на одну клітинку",
  MoveDown: "Рухатися вниз на одну клітинку",
  MoveRight: "Рухатися вправо на одну клітинку",
  MoveForward: "Рухатися вперед у напрямку погляду бота",
  ShiftUp: "Змістити відносну позицію вгору",
  ShiftLeft: "Змістити відносну позицію вліво",
  ShiftDown: "Змістити відносну позицію вниз",
  ShiftRight: "Змістити відносну позицію вправо",
  ShiftForward: "Змістити відносну позицію вперед",

  // Повороти
  RotateUp: "Повернути погляд бота вгору",
  RotateLeft: "Повернути погляд бота вліво",
  RotateDown: "Повернути погляд бота вниз",
  RotateRight: "Повернути погляд бота вправо",
  RotateLefthand: "Поворот лівою рукою (за годинниковою стрілкою)",
  RotateRighthand: "Поворот правою рукою (проти годинникової стрілки)",
  RotateRandom: "Випадковий поворот погляду бота",

  // Будівництво та копання
  Dig: "Копати блок у напрямку погляду",
  BuildBlock: "Будувати блок у напрямку погляду",
  BuildRoad: "Будувати дорогу у напрямку погляду",
  BuildQuadro: "Будувати quadro блок у напрямку погляду",
  BuildWar: "Будувати військовий блок",
  STDDig: "Стандартне копання",
  STDBlock: "Стандартний блок",
  STDHeal: "Стандартне лікування",
  STDTunnel: "Стандартний тунель",

  // Використання предметів
  UseGeo: "Використати гео-пакет",
  Heal: "Використати лікувальний предмет",
  CallWhenDied:
    "При смерти будет вызван модуль, записанный в этом операторе. Для срабатывания необходимо чтобы программа хотя бы раз прошла через этот оператор",
  UseGeopack: "Использовать геопак",
  UseZZ: "Использовать заряд защиты",
  UseC190: "Использовать C-190",
  UsePoly: "Использовать полимер",
  Upgrade: "Улучшить все умения по 1 разу если бот находится в апе",
  RefillCraft:
    "Завершить крафт и запустить тот же самый рецепт если бот находится в крафтере",
  UseNano: "Использовать нанобота. Чинит 50 единиц прочности бота",
  UseRem: "Использовать рем бота. Чинит 1000 единиц прочности бота",
  UseBoom: "Использовать взрывчатку",
  UseRaz: "Использовать разрядник",
  UseProt: "Использовать протектор",
  ChargeGun: "Зарядити оружие",

  // Інвентар
  InventoryUp:
    "При использовании данного оператора, след действие по использованию предмета инвентаря, будет выполнено вверх относительно бота",
  InventoryLeft:
    "При использовании данного оператора, след действие по использованию предмета инвентаря, будет выполнено влево относительно бота",
  InventoryDown:
    "При использовании данного оператора, след действие по использованию предмета инвентаря, будет выполнено вниз относительно бота",
  InventoryRight:
    "При использовании данного оператора, след действие по использованию предмета инвентаря, будет выполнено вправо относительно бота",

  // Управління
  EnableHand: "Включает ручной режим",
  DisableHand: "Выключает ручной режим",
  SetStart: "Встановити точку старту програми",
  Terminate: "Завершити виконання програми",
  RepeatLastAction: "Повторити останню дію",

  // Логіка та умови
  NextLine: "Перейти до наступного рядка",
  Goto: "Перейти до мітки",
  Call: "Викликати підпрограму",
  CallArg: "Викликати підпрограму з аргументом",
  Return: "Повернутися з підпрограми",
  ReturnArg: "Повернутися з підпрограми з аргументом",
  Label: "Встановити мітку для переходів",
  CallState: "Викликати підпрограму з станом",
  ReturnState: "Повернутися з підпрограми зі станом",

  // Умови перевірки
  IsNotEmpty: "Перевірити чи клітинка не порожня",
  IsEmpty: "Перевірити чи клітинка порожня",
  IsFalling: "Перевірити чи блок падає",
  IsCrystal: "Перевірити чи це кристал",
  IsAliveCrystal: "Перевірити чи це живий кристал",
  IsFallingLikeBoulder: "Перевірити чи падає як валун",
  IsFallingLikeLiquid: "Перевірити чи падає як рідина",
  IsBreakable: "Перевірити чи блок можна зламати",
  IsUnbreakable: "Перевірити чи блок незламний",
  IsRedRock: "Перевірити чи червона скеля",
  IsBlackRock: "Перевірити чи чорна скеля",
  IsAcid: "Перевірити чи кислота",
  IsSand: "Перевірити чи пісок",
  IsQuadro: "Перевірити чи quadro блок",
  IsRoad: "Перевірити чи дорога",
  IsRedBlock: "Перевірити чи червоний блок",
  IsYellowBlock: "Перевірити чи жовтий блок",
  IsGreenBlock: "Перевірити чи зелений блок",
  IsAcidRock: "Перевірити чи кисла скеля",
  IsBoulder: "Перевірити чи валун",
  IsLava: "Перевірити чи лава",
  IsCyanAlive: "Перевірити чи бірюзовий живий блок",
  IsWhiteAlive: "Перевірити чи білий живий блок",
  IsRedAlive: "Перевірити чи червоний живий блок",
  IsVioletAlive: "Перевірити чи фіолетовий живий блок",
  IsBlackAlive: "Перевірити чи чорний живий блок",
  IsBlueAlive: "Перевірити чи синій живий блок",
  IsRainbowAlive: "Перевірити чи веселковий живий блок",
  IsBox: "Перевірити чи скриня",
  IsStructure: "Перевірити чи структура",
  IsBasketFull: "Перевірити чи кошик повний",
  IsGeoFull: "Перевірити чи гео повне",
  IsInsideGun: "Перевірити чи бот знаходиться в зброї",
  IsHealthNotFull: "Перевірити чи здоров'я не повне",
  IsHealthLessThanHalf: "Перевірити чи здоров'я менше половини",

  // Налаштування
  EnableAutoDig: "Увімкнути автоматичне копання",
  DisableAutoDig: "Вимкнути автоматичне копання",
  EnableAggression: "Увімкнути агресивний режим",
  DisableAggression: "Вимкнути агресивний режим",

  // Тригери
  SetStartWhenDied: "Початок при смерті бота",
  SetStartWhenHurt: "Початок при пораненні бота",
  SetStartWhenBotNearby: "Початок коли інший бот поруч",

  // Скрині
  BoxAll: "Взаємодія з усіма скринями",
  BoxHalf: "Взаємодія з половиною скринь",
  BoxWhite: "Взаємодія з білими скринями",
  BoxGreen: "Взаємодія з зеленими скринями",
  BoxRed: "Взаємодія з червоними скринями",
  BoxBlue: "Взаємодія з синіми скринями",
  BoxCyan: "Взаємодія з бірюзовими скринями",
  BoxViolet: "Взаємодія з фіолетовими скринями",

  // Змінні
  WriteStateToVar: "Записати стан у змінну",
  ReadVarToState: "Прочитати змінну у стан",
  SetNumberToVar: "Встановити число у змінну",
  AddNumberToVar: "Додати число до змінної",
  MultNumberToVar: "Помножити змінну на число",
  DivNumberToVar: "Поділити змінну на число",
  SubNumberToVar: "Відняти число від змінної",
  AddVarToVar: "Додати змінну до змінної",
  MultVarToVar: "Помножити змінну на змінну",
  DivVarToVar: "Поділити змінну на змінну",
  SubVarToVar: "Відняти змінну від змінної",

  // Порівняння змінних
  VarLessThanState: "Змінна менше стану",
  VarGreaterThanState: "Змінна більше стану",
  VarEqualState: "Змінна дорівнює стану",
  VarNotEqualState: "Змінна не дорівнює стану",
  VarGreaterThanNumber: "Змінна більше числа",
  VarLessThanNumber: "Змінна менше числа",
  VarEqualsNumber: "Змінна дорівнює числу",
  VarGreaterThanOrEqualNumber: "Змінна більше або дорівнює числу",
  VarLessThanOrEqualNumber: "Змінна менше або дорівнює числу",
  VarNotEqualsNumber: "Змінна не дорівнює числу",
  VarGreaterThanVar: "Змінна більше змінної",
  VarLessThanVar: "Змінна менше змінної",
  VarGreaterThanOrEqualVar: "Змінна більше або дорівнює змінній",
  VarLessThanOrEqualVar: "Змінна менше або дорівнює змінній",
  VarEqualsVar: "Змінна дорівнює змінній",
  VarNotEqualsVar: "Змінна не дорівнює змінній",
  VarGreaterThanOrEqualsState: "Змінна більше або дорівнює стану",
  VarLessThanOrEqualState: "Змінна менше або дорівнює стану",
  VarNotEqualsState: "Змінна не дорівнює стану",
  VarRound: "Округлити змінну",
  VarCeil: "Округлити змінну вгору",
  VarFloor: "Округлити змінну вниз",

  // Клітинки відносно бота
  CellUpLeft: "Клітинка вгорі-зліва від бота",
  CellDownRight: "Клітинка знизу-справа від бота",
  CellUp: "Клітинка вгорі від бота",
  CellUpRight: "Клітинка вгорі-справа від бота",
  CellLeft: "Клітинка зліва від бота",
  Cell: "Поточна клітинка бота",
  CellRight: "Клітинка справа від бота",
  CellDownLeft: "Клітинка знизу-зліва від бота",
  CellDown: "Клітинка знизу від бота",
  CellForward: "Клітинка вперед від бота",
  CellLefthand: "Клітинка ліворуч від бота",
  CellRighthand: "Клітинка праворуч від бота",

  // Логічні оператори
  BooleanOR: "Логічне АБО",
  BooleanAND: "Логічне І",
  YesNoGoto: "Якщо так - перейти до мітки, якщо ні - продовжити",
  NoYesGoto: "Якщо ні - перейти до мітки, якщо так - продовжити",
  YesNoNextRow: "Якщо так - наступний рядок, якщо ні - продовжити",
  NoYesNextRow: "Якщо ні - наступний рядок, якщо так - продовжити",
  YesNoGotoStart: "Якщо так - перейти на початок, якщо ні - продовжити",
  NoYesGotoStart: "Якщо ні - перейти на початок, якщо так - продовжити",
  YesNoTerminate: "Якщо так - завершити, якщо ні - продовжити",
  NoYesTerminate: "Якщо ні - завершити, якщо так - продовжити",
  Flip: "Інвертувати результат умови",

  // Звук та відлагодження
  PlaySound: "Програти звук",
  DebugPause:
    "При прохождении через этот оператор, будет выведено сообщение, записанное в нем. Программа остановится",
  DebugShow: "Выводит сообщение без остановки программы",
};

export class ContextMenuManager {
  constructor() {
    this.activeMenu = null;
    this.currentTarget = null;
    this.menuElement = null;

    this.init();
  }

  static getInstance() {
    if (!ContextMenuManager.instance) {
      ContextMenuManager.instance = new ContextMenuManager();
    }
    return ContextMenuManager.instance;
  }

  init() {
    // Keep the domain module importable in Node/test environments. The menu
    // is created when a browser document becomes available.
    if (typeof document === "undefined" || !document.body) {
      return;
    }
    this.createMenuElement();
    this.bindGlobalEvents();
  }

  createMenuElement() {
    this.menuElement = document.createElement("div");
    this.menuElement.className = "context-menu";

    // Create content container
    const contentDiv = document.createElement("div");
    contentDiv.className = "context-menu-content";

    // Create header
    const headerDiv = document.createElement("div");
    headerDiv.className = "context-menu-header";

    const titleSpan = document.createElement("span");
    titleSpan.className = "context-menu-title";
    titleSpan.textContent = "Actions";
    headerDiv.appendChild(titleSpan);

    // Create items container
    const itemsDiv = document.createElement("div");
    itemsDiv.className = "context-menu-items";

    // Assemble structure
    contentDiv.appendChild(headerDiv);
    contentDiv.appendChild(itemsDiv);
    this.menuElement.appendChild(contentDiv);

    document.body.appendChild(this.menuElement);

    // Prevent context menu on the menu itself
    this.menuElement.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  bindGlobalEvents() {
    // Track mouse position globally
    document.addEventListener("mousemove", (e) => {
      window.lastMouseEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
      };
    });

    // Hide menu on left click anywhere
    document.addEventListener("click", (e) => {
      if (!this.menuElement.contains(e.target)) {
        this.hideMenu();
      }
    });

    // Hide menu on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideMenu();
      }
    });

    // Prevent default context menu globally (we'll show our custom one)
    document.addEventListener("contextmenu", (e) => {
      // Only prevent default if we're not already showing a menu
      // This allows nested context menus if needed
      if (!this.activeMenu) {
        e.preventDefault();
      }
    });
  }

  showMenu(x, y, items, target = null) {
    if (!this.menuElement) {
      return;
    }
    if (this.activeMenu) {
      this.hideMenu();
    }

    this.currentTarget = target;
    this.activeMenu = { x, y, items };

    // Position the menu
    this.positionMenu(x, y);

    // Populate menu items
    this.renderMenuItems(items);

    // Show the menu
    this.menuElement.classList.add("visible");

    // Focus management
    this.menuElement.focus();

    loggers.services.debug(
      `📋 Context menu показаний на позиції (${x}, ${y}) з ${items.length} елементами: ${items.map((item) => item.name || "анонімний").join(", ")}`,
    );
  }

  positionMenu(x, y) {
    const menuRect = this.menuElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust position to fit within viewport
    let adjustedX = x;
    let adjustedY = y;

    if (x + menuRect.width > viewportWidth) {
      adjustedX = x - menuRect.width;
    }

    if (y + menuRect.height > viewportHeight) {
      adjustedY = y - menuRect.height;
    }

    // Ensure minimum distance from edges
    adjustedX = Math.max(
      10,
      Math.min(adjustedX, viewportWidth - menuRect.width - 10),
    );
    adjustedY = Math.max(
      10,
      Math.min(adjustedY, viewportHeight - menuRect.height - 10),
    );

    this.menuElement.style.left = `${adjustedX}px`;
    this.menuElement.style.top = `${adjustedY}px`;
  }

  renderMenuItems(items) {
    const itemsContainer = this.menuElement.querySelector(
      ".context-menu-items",
    );
    itemsContainer.innerHTML = "";

    items.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "context-menu-item";

      if (item.separator) {
        itemElement.className = "context-menu-separator";
        const hr = document.createElement("hr");
        itemElement.appendChild(hr);
      } else {
        // Create icon span
        const iconSpan = document.createElement("span");
        iconSpan.className = "context-menu-icon";
        iconSpan.textContent = item.icon || "";
        itemElement.appendChild(iconSpan);

        // Create label span
        const labelSpan = document.createElement("span");
        labelSpan.className = "context-menu-label";
        labelSpan.textContent = item.label || "";
        itemElement.appendChild(labelSpan);

        // Create shortcut span
        const shortcutSpan = document.createElement("span");
        shortcutSpan.className = "context-menu-shortcut";
        shortcutSpan.textContent = item.shortcut || "";
        itemElement.appendChild(shortcutSpan);

        if (item.disabled) {
          itemElement.classList.add("disabled");
        } else {
          itemElement.addEventListener("click", () => {
            this.executeAction(item.action);
            this.hideMenu();
          });

          itemElement.addEventListener("mouseenter", () => {
            // Remove hover from other items
            itemsContainer
              .querySelectorAll(".context-menu-item")
              .forEach((el) => {
                el.classList.remove("hover");
              });
            itemElement.classList.add("hover");
          });
        }
      }

      itemsContainer.appendChild(itemElement);
    });
  }

  executeAction(action) {
    if (typeof action === "function") {
      const actionName = action.name || "анонімна функція";
      loggers.services.debug(
        `▶️ Виконання дії контекстного меню: ${actionName}`,
      );

      try {
        const startTime = performance.now();
        action(this.currentTarget);
        const executionTime = performance.now() - startTime;

        loggers.services.info(
          `✅ Дію контекстного меню виконано успішно: "${actionName}" (${executionTime.toFixed(2)}ms)`,
        );
      } catch (error) {
        loggers.services.error(
          `❌ Помилка виконання дії контекстного меню "${actionName}":`,
          error,
        );
      }
    } else {
      loggers.services.warn(
        "⚠️ Спроба виконати некоректну дію контекстного меню",
      );
    }
  }

  hideMenu() {
    if (!this.activeMenu) {
      loggers.services.debug(
        "🔍 Спроба сховати контекстне меню, але воно вже не активне",
      );
      return;
    }

    loggers.services.debug("🔽 Приховування контекстного меню");
    this.menuElement.classList.remove("visible");
    this.activeMenu = null;
    this.currentTarget = null;

    loggers.services.debug("✅ Контекстне меню приховано");
  }

  // Utility methods for common context menus

  showProgramCellMenu(cellElement, position) {
    const program = stateManager.getState("program");
    const { x, y } = this.positionToCoordinates(position);
    const page = stateManager.getState("currentPage") || 0;
    const instruction = program ? program.getInstructionAt(x, y, page) : null;
    const hasInstruction =
      instruction && instruction.action !== ProgAction.None;

    const items = [];

    if (hasInstruction) {
      // Menu for occupied cells
      items.push({
        label: "Copy Action",
        icon: "📋",
        shortcut: "Ctrl+C",
        action: () => this.copyInstruction(instruction),
      });

      items.push({
        label: "Move Action",
        icon: "↗️",
        action: () => {
          // Enable drag mode
          stateManager.setState({
            dragMode: true,
            selectedInstruction: instruction,
          });
        },
      });

      items.push({
        label: "Clear Cell",
        icon: "🗑️",
        shortcut: "Del",
        action: () => this.clearCell(position),
      });

      items.push({ separator: true });

      items.push({
        label: "Action Info",
        icon: "ℹ️",
        action: () => this.showActionInfo(instruction.action),
      });

      items.push({
        label: "Cell Info",
        icon: "📊",
        action: () => this.showCellInfo(position, instruction),
      });
    } else {
      // Menu for empty cells
      items.push({
        label: "Paste Action",
        icon: "📄",
        shortcut: "Ctrl+V",
        action: () => this.pasteInstruction(position),
      });

      items.push({
        label: "Insert from Palette",
        icon: "🎯",
        action: () => {
          // Focus action palette and prepare for insertion
          const actionPalette = document.querySelector("#action-palette");
          if (actionPalette) {
            stateManager.setState({ insertTarget: position });
            // Could trigger palette focus here
          }
        },
      });
    }

    // Always available actions
    items.push({ separator: true });
    items.push({
      label: "Select All",
      icon: "☑️",
      shortcut: "Ctrl+A",
      action: () => this.selectAllCells(),
    });

    // Get mouse position from the last mouse event
    const mouseEvent = window.lastMouseEvent || { clientX: 100, clientY: 100 };

    this.showMenu(mouseEvent.clientX, mouseEvent.clientY, items, {
      type: "cell",
      position,
    });
  }

  showActionPaletteMenu(actionKey) {
    const isFavorite = this.isFavorite(actionKey);

    const items = [
      {
        label: isFavorite ? "Remove from Favorites" : "Add to Favorites",
        icon: isFavorite ? "⭐" : "☆",
        action: () => this.toggleFavorite(actionKey),
      },
      {
        label: "Copy Action Key",
        icon: "🔑",
        action: () => this.copyToClipboard(actionKey),
      },
      {
        label: "Action Info",
        icon: "ℹ️",
        action: () => this.showActionInfo(actionKey),
      },
    ];

    // Get mouse position from the last mouse event
    const mouseEvent = window.lastMouseEvent || { clientX: 100, clientY: 100 };

    this.showMenu(mouseEvent.clientX, mouseEvent.clientY, items, {
      type: "action",
      actionKey,
    });
  }

  // Action implementations
  copyInstruction(instruction) {
    stateManager.setState({
      clipboard: {
        type: "instruction",
        data: instruction,
      },
    });
    loggers.services.info(
      `📋 Інструкцію скопійовано в буфер: ${instruction.action} (позиція: [${instruction.x}, ${instruction.y}])`,
    );
  }

  pasteInstruction(position) {
    const clipboard = stateManager.getState("clipboard");
    if (clipboard && clipboard.type === "instruction") {
      const program = stateManager.getState("program");
      if (program) {
        const { x, y } = this.positionToCoordinates(position);
        const page = stateManager.getState("currentPage") || 0;
        const instruction = clipboard.data;
        program.setInstructionAt(
          x,
          y,
          instruction.action,
          instruction.label ?? null,
          instruction.value ?? null,
          page,
        );
        stateManager.setState({ program });
        loggers.services.info(
          `📌 Інструкцію вставлено на позицію ${position}: ${clipboard.data.action}`,
        );
      }
    }
  }

  clearCell(position) {
    const program = stateManager.getState("program");
    if (program) {
      const { x, y } = this.positionToCoordinates(position);
      const page = stateManager.getState("currentPage") || 0;
      program.setInstructionAt(x, y, ProgAction.None, null, null, page);
      stateManager.setState({ program });
      loggers.services.info(`🗑️ Ячейку очищено на позиції ${position}`);
    }
  }

  async showCellInfo(position, instruction) {
    const { x, y } = this.positionToCoordinates(position);
    const actionName = Object.keys(ProgAction).find(
      (name) => ProgAction[name] === instruction?.action,
    );
    const details = [
      `Позиція: ${position}`,
      `Координати: X=${x}, Y=${y}`,
      `Дія: ${(actionName || instruction?.action) ?? "None"}`,
      `Мітка: ${instruction?.label || "—"}`,
      `Значення: ${instruction?.value ?? "—"}`,
    ].join("\n");

    await this.showDialog("Інформація про клітинку", details);
  }

  positionToCoordinates(position) {
    const x = position % GRID_WIDTH;
    const y = Math.floor(position / GRID_WIDTH);
    return { x, y };
  }

  toggleFavorite(actionKey) {
    const favorites = this.getFavorites();
    const isFavorite = favorites.includes(actionKey);

    if (isFavorite) {
      // Remove from favorites
      const newFavorites = favorites.filter((fav) => fav !== actionKey);
      this.saveFavorites(newFavorites);
      loggers.services.info(`⭐ Видалено з обраних: ${actionKey}`);
    } else {
      // Add to favorites
      favorites.push(actionKey);
      this.saveFavorites(favorites);
      loggers.services.info(`⭐ Додано до обраних: ${actionKey}`);
    }

    // Update UI to reflect changes
    this.updateFavoriteIndicators();
  }

  getFavorites() {
    // Get favorites from localStorage
    const favorites = localStorage.getItem("emp_favorites");
    return favorites ? JSON.parse(favorites) : [];
  }

  saveFavorites(favorites) {
    localStorage.setItem("emp_favorites", JSON.stringify(favorites));
  }

  isFavorite(actionKey) {
    const favorites = this.getFavorites();
    return favorites.includes(actionKey);
  }

  updateFavoriteIndicators() {
    // This will be called to update UI indicators
    // Dispatch custom event to notify ActionPalette
    window.dispatchEvent(new CustomEvent("favoritesUpdated"));
  }

  copyToClipboard(text) {
    const clipboard = globalThis.navigator?.clipboard;
    if (clipboard?.writeText) {
      clipboard
        .writeText(text)
        .then(() =>
          loggers.services.info(
            `📋 Текст скопійовано в буфер обміну (${text.length} символів)`,
          ),
        )
        .catch((error) =>
          loggers.services.warn("⚠️ Не вдалося скопіювати текст:", error),
        );
      return;
    }

    loggers.services.warn("⚠️ Clipboard API недоступний");
  }

  async showActionInfo(actionKey) {
    const actionDescription = ACTION_INFO[actionKey];

    if (!actionDescription) {
      loggers.services.warn(`ℹ️ Опис для дії "${actionKey}" не знайдено`);
      await this.showDialog(
        "Action Info",
        `Дія: ${actionKey}\n\nОпис недоступний.`,
      );
      return;
    }

    const title = `Action Info: ${actionKey}`;
    const message = `Дія: ${actionKey}\n\nОпис: ${actionDescription}`;

    await this.showDialog(title, message);
    loggers.services.info(`ℹ️ Показано інформацію про дію: ${actionKey}`);
  }

  async showDialog(title, message) {
    // Try to use dialogManager from the editor controller
    const { editorController } = window;
    if (editorController && editorController.dialogManager) {
      await editorController.dialogManager.showInfoDialog(message, title);
    } else {
      // Fallback to browser alert
      alert(`${title}\n\n${message}`);
    }
  }

  selectAllCells() {
    // Implementation for selecting all cells
    loggers.services.info("Selected all cells");
  }
}

// Global instance
export const contextMenuManager = ContextMenuManager.getInstance();
