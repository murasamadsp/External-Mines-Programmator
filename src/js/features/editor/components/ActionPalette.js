import {
  ACTION_DATA,
} from "../../../core/constants/actions.js";
import { loggers } from "../../../utils/index.js";
import { contextMenuManager } from "../../../core/services/context-menu-manager.js";

export class ActionPalette {
  constructor(container, onActionSelected) {
    this.container = container;
    this.onActionSelected = onActionSelected;
    this.selectedAction = null;
    this.actionButtons = new Map();

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

    // Додаємо обробник контекстного меню
    button.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      contextMenuManager.showActionPaletteMenu(actionKey);
    });

    return button;
  }

  bindActionButtons() {
    if (!this.palette) return;
    
    const buttons = this.palette.querySelectorAll("button[data-action]");
    buttons.forEach(button => {
      const actionKey = button.getAttribute("data-action");
      this.actionButtons.set(actionKey, button);

      button.addEventListener("click", () => {
        this.selectAction(actionKey);
      });
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
    let actionsList = this.palette.querySelector('.actions-list');
    
    if (!actionsList) {
      actionsList = document.createElement('div');
      actionsList.className = 'actions-list';
      this.palette.appendChild(actionsList);
    }

    actionsList.innerHTML = '';

    for (const [actionKey, _] of actionsToRender) {
      const button = this.createActionButton(actionKey);
      if (button) {
        actionsList.appendChild(button);
      }
    }

    this.bindActionButtons();
  }
}
