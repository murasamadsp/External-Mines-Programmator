import {
  ACTION_DATA,
  ACTION_CATEGORIES,
} from "../../../core/constants/actions.js";
import { loggers } from "../../../utils/index.js";
import { contextMenuManager } from "../../../core/services/context-menu-manager.js";

export class ActionPalette {
  constructor(container, onActionSelected) {
    this.container = container;
    this.onActionSelected = onActionSelected;
    this.selectedAction = null;
    this.actionButtons = new Map();
    this.collapsedCategories = new Set();

    this.loadCollapsedCategories();

    loggers.ui.debug("Палітру дій заініціалізовано");
  }

  create() {
    this.palette = document.createElement("div");
    this.palette.id = "action-palette";
    this.palette.className = "action-palette";

    const header = document.createElement("h3");
    header.textContent = "Дії";
    this.palette.appendChild(header);

    // Початковий рендеринг всіх дій (без фільтрів)
    this.renderActions(new Map(Object.entries(ACTION_DATA)));

    this.container.appendChild(this.palette);

    // Слухаємо події оновлення обраних
    window.addEventListener("favoritesUpdated", () => {
      this.updateFavoriteIndicators();
    });

    loggers.ui.info("Палітру дій утворено");
  }

  createActionButton(actionKey) {
    const actionData = ACTION_DATA[actionKey];
    if (!actionData) return null;

    const button = document.createElement("button");
    button.textContent = actionData.label;
    button.title = actionData.tooltip;
    button.setAttribute("data-action", actionKey);
    button.setAttribute("type", "button");

    // Додаємо індикатор обраних
    this.updateFavoriteIndicator(button, actionKey);

    // Додаємо обробник контекстного меню
    button.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      contextMenuManager.showActionPaletteMenu(actionKey);
    });

    return button;
  }

  updateFavoriteIndicator(button, actionKey) {
    const isFavorite = contextMenuManager.isFavorite(actionKey);

    // Remove existing indicator
    const existingIndicator = button.querySelector(".favorite-indicator");
    if (existingIndicator) {
      existingIndicator.remove();
    }

    if (isFavorite) {
      // Add favorite indicator
      const indicator = document.createElement("span");
      indicator.className = "favorite-indicator";
      indicator.textContent = "⭐";
      indicator.title = "Обране";
      indicator.style.cssText = `
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 10px;
        pointer-events: none;
      `;
      button.style.position = "relative";
      button.appendChild(indicator);
    }
  }

  updateFavoriteIndicators() {
    // Update all action buttons
    const buttons = this.palette.querySelectorAll("button[data-action]");
    buttons.forEach((button) => {
      const actionKey = button.getAttribute("data-action");
      this.updateFavoriteIndicator(button, actionKey);
    });
  }

  bindActionButtons() {
    if (!this.palette) return;

    const buttons = this.palette.querySelectorAll("button[data-action]");
    buttons.forEach((button) => {
      const actionKey = button.getAttribute("data-action");
      this.actionButtons.set(actionKey, button);

      button.addEventListener("click", () => {
        this.selectAction(actionKey);
      });

      // Update favorite indicator after binding
      this.updateFavoriteIndicator(button, actionKey);
    });
  }

  selectAction(actionKey) {
    if (this.selectedAction) {
      const prevButton = this.actionButtons.get(this.selectedAction);
      if (prevButton) {
        prevButton.classList.remove("selected");
      }
    }

    if (actionKey) {
      const button = this.actionButtons.get(actionKey);
      if (button) {
        button.classList.add("selected");
      }
    }

    this.selectedAction = actionKey;

    if (this.onActionSelected) {
      this.onActionSelected(actionKey);
    }
  }

  getSelectedAction() {
    return this.selectedAction;
  }

  clearSelection() {
    this.selectAction(null);
  }

  renderActions(actionsMap = null) {
    if (!this.palette) return;

    const actionsToRender = actionsMap || new Map(Object.entries(ACTION_DATA));
    let actionsList = this.palette.querySelector(".actions-list");

    if (!actionsList) {
      actionsList = document.createElement("div");
      actionsList.className = "actions-list";
      this.palette.appendChild(actionsList);
    }

    actionsList.innerHTML = "";

    console.log("ACTION_CATEGORIES:", ACTION_CATEGORIES);

    // Групуємо дії за категоріями
    const categoriesOrder = Object.keys(ACTION_CATEGORIES);
    console.log("categoriesOrder:", categoriesOrder);

    for (const category of categoriesOrder) {
      const categoryActions = ACTION_CATEGORIES[category];
      console.log("category:", category, "actions:", categoryActions);

      const categoryActionsFiltered = categoryActions.filter((actionKey) =>
        actionsToRender.has(actionKey),
      );

      console.log("filtered actions:", categoryActionsFiltered);

      if (categoryActionsFiltered.length === 0) continue;

      // Створюємо заголовок категорії з кнопкою згортання
      const categoryHeader = document.createElement("div");
      categoryHeader.className = "category-header";
      categoryHeader.style.display = "flex";
      categoryHeader.style.alignItems = "center";
      categoryHeader.style.justifyContent = "space-between";
      categoryHeader.style.cursor = "pointer";

      const categoryTitle = document.createElement("span");
      categoryTitle.textContent = category;

      const toggleButton = document.createElement("button");
      toggleButton.className = "category-toggle";
      toggleButton.setAttribute("data-toggle", category);
      toggleButton.style.background = "none";
      toggleButton.style.border = "none";
      toggleButton.style.color = "inherit";
      toggleButton.style.fontSize = "12px";
      toggleButton.style.cursor = "pointer";
      toggleButton.style.padding = "0";
      toggleButton.style.width = "16px";
      toggleButton.style.height = "16px";
      toggleButton.style.display = "flex";
      toggleButton.style.alignItems = "center";
      toggleButton.style.justifyContent = "center";

      // Додаємо обробник для заголовка та кнопки
      const toggleHandler = () => this.toggleCategory(category);
      categoryHeader.addEventListener("click", toggleHandler);
      toggleButton.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleHandler();
      });

      categoryHeader.appendChild(categoryTitle);
      categoryHeader.appendChild(toggleButton);

      console.log("Creating header:", category);
      actionsList.appendChild(categoryHeader);

      // Створюємо контейнер для дій категорії
      const categoryContainer = document.createElement("div");
      categoryContainer.className = "category-actions";
      categoryContainer.setAttribute("data-category", category);

      for (const actionKey of categoryActionsFiltered) {
        const button = this.createActionButton(actionKey);
        if (button) {
          categoryContainer.appendChild(button);
        }
      }

      actionsList.appendChild(categoryContainer);
    }

    this.bindActionButtons();

    // Застосовуємо стан згортання для всіх категорій
    for (const category of categoriesOrder) {
      if (this.collapsedCategories.has(category)) {
        // Для свернутых категорий сразу устанавливаем collapsed состояние
        this.updateCategoryVisibility(category);
      }
      // Для развернутых категорий сначала устанавливаем начальное состояние
    }

    // Небольшая задержка для правильной инициализации высоты развернутых категорий
    setTimeout(() => {
      for (const category of categoriesOrder) {
        if (!this.collapsedCategories.has(category)) {
          this.updateCategoryVisibility(category);
        }
      }
    }, 10);
  }

  loadCollapsedCategories() {
    try {
      const collapsed = localStorage.getItem("emp_collapsed_categories");
      if (collapsed) {
        this.collapsedCategories = new Set(JSON.parse(collapsed));
      }
    } catch (error) {
      loggers.ui.warn(
        "Не вдалося завантажити стан згорнутих категорій:",
        error,
      );
    }
  }

  saveCollapsedCategories() {
    try {
      localStorage.setItem(
        "emp_collapsed_categories",
        JSON.stringify([...this.collapsedCategories]),
      );
    } catch (error) {
      loggers.ui.warn("Не вдалося зберегти стан згорнутих категорій:", error);
    }
  }

  toggleCategory(categoryName) {
    if (this.collapsedCategories.has(categoryName)) {
      this.collapsedCategories.delete(categoryName);
    } else {
      this.collapsedCategories.add(categoryName);
    }

    this.saveCollapsedCategories();
    this.updateCategoryVisibility(categoryName);
  }

  updateCategoryVisibility(categoryName) {
    const categoryContainer = this.palette.querySelector(
      `[data-category="${categoryName}"]`,
    );
    const toggleButton = this.palette.querySelector(
      `[data-toggle="${categoryName}"]`,
    );

    if (!categoryContainer || !toggleButton) return;

    const isCollapsed = this.collapsedCategories.has(categoryName);

    if (isCollapsed) {
      categoryContainer.style.maxHeight = "0px";
      categoryContainer.style.opacity = "0";
      categoryContainer.style.overflow = "hidden";
      toggleButton.textContent = "▶";
      toggleButton.title = "Розгорнути категорію";
    } else {
      // Сначала получаем естественную высоту
      const scrollHeight = categoryContainer.scrollHeight;
      categoryContainer.style.maxHeight = scrollHeight + "px";
      categoryContainer.style.opacity = "1";
      categoryContainer.style.overflow = "visible";

      // После завершения анимации сбрасываем maxHeight
      setTimeout(() => {
        categoryContainer.style.maxHeight = "";
      }, 300);

      toggleButton.textContent = "▼";
      toggleButton.title = "Згорнути категорію";
    }
  }
}
