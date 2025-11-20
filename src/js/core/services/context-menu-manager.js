// Context Menu Manager for Right-Click Actions
// Provides context-sensitive menus for program cells and UI elements

import { loggers } from "../../utils/index.js";
import { stateManager } from "./state-manager.js";

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
    this.createMenuElement();
    this.bindGlobalEvents();
  }

  createMenuElement() {
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'context-menu';
    this.menuElement.innerHTML = `
      <div class="context-menu-content">
        <div class="context-menu-header">
          <span class="context-menu-title">Actions</span>
        </div>
        <div class="context-menu-items"></div>
      </div>
    `;

    document.body.appendChild(this.menuElement);

    // Prevent context menu on the menu itself
    this.menuElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  bindGlobalEvents() {
    // Hide menu on left click anywhere
    document.addEventListener('click', (e) => {
      if (!this.menuElement.contains(e.target)) {
        this.hideMenu();
      }
    });

    // Hide menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideMenu();
      }
    });

    // Prevent default context menu globally (we'll show our custom one)
    document.addEventListener('contextmenu', (e) => {
      // Only prevent default if we're not already showing a menu
      // This allows nested context menus if needed
      if (!this.activeMenu) {
        e.preventDefault();
      }
    });
  }

  showMenu(x, y, items, target = null) {
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
    this.menuElement.classList.add('visible');

    // Focus management
    this.menuElement.focus();

    loggers.ui.debug(`Context menu shown at (${x}, ${y}) with ${items.length} items`);
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
    adjustedX = Math.max(10, Math.min(adjustedX, viewportWidth - menuRect.width - 10));
    adjustedY = Math.max(10, Math.min(adjustedY, viewportHeight - menuRect.height - 10));

    this.menuElement.style.left = `${adjustedX}px`;
    this.menuElement.style.top = `${adjustedY}px`;
  }

  renderMenuItems(items) {
    const itemsContainer = this.menuElement.querySelector('.context-menu-items');
    itemsContainer.innerHTML = '';

    items.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'context-menu-item';

      if (item.separator) {
        itemElement.className = 'context-menu-separator';
        itemElement.innerHTML = '<hr>';
      } else {
        itemElement.innerHTML = `
          <span class="context-menu-icon">${item.icon || ''}</span>
          <span class="context-menu-label">${item.label}</span>
          <span class="context-menu-shortcut">${item.shortcut || ''}</span>
        `;

        if (item.disabled) {
          itemElement.classList.add('disabled');
        } else {
          itemElement.addEventListener('click', () => {
            this.executeAction(item.action);
            this.hideMenu();
          });

          itemElement.addEventListener('mouseenter', () => {
            // Remove hover from other items
            itemsContainer.querySelectorAll('.context-menu-item').forEach(el => {
              el.classList.remove('hover');
            });
            itemElement.classList.add('hover');
          });
        }
      }

      itemsContainer.appendChild(itemElement);
    });
  }

  executeAction(action) {
    if (typeof action === 'function') {
      try {
        action(this.currentTarget);
        loggers.ui.info(`Context menu action executed: ${action.name || 'anonymous'}`);
      } catch (error) {
        loggers.ui.error('Context menu action failed:', error);
      }
    }
  }

  hideMenu() {
    if (!this.activeMenu) return;

    this.menuElement.classList.remove('visible');
    this.activeMenu = null;
    this.currentTarget = null;

    loggers.ui.debug('Context menu hidden');
  }

  // Utility methods for common context menus

  showProgramCellMenu(cellElement, position) {
    const program = stateManager.getState('program');
    const instruction = program ? program.getInstruction(position) : null;

    const items = [];

    if (instruction) {
      // Menu for occupied cells
      items.push({
        label: 'Copy Action',
        icon: '📋',
        shortcut: 'Ctrl+C',
        action: () => this.copyInstruction(instruction)
      });

      items.push({
        label: 'Move Action',
        icon: '↗️',
        action: () => {
          // Enable drag mode
          stateManager.setState({ dragMode: true, selectedInstruction: instruction });
        }
      });

      items.push({
        label: 'Clear Cell',
        icon: '🗑️',
        shortcut: 'Del',
        action: () => this.clearCell(position)
      });

      items.push({ separator: true });

      items.push({
        label: 'Cell Info',
        icon: 'ℹ️',
        action: () => this.showCellInfo(position, instruction)
      });
    } else {
      // Menu for empty cells
      items.push({
        label: 'Paste Action',
        icon: '📄',
        shortcut: 'Ctrl+V',
        action: () => this.pasteInstruction(position)
      });

      items.push({
        label: 'Insert from Palette',
        icon: '🎯',
        action: () => {
          // Focus action palette and prepare for insertion
          const actionPalette = document.querySelector('#action-palette');
          if (actionPalette) {
            stateManager.setState({ insertTarget: position });
            // Could trigger palette focus here
          }
        }
      });
    }

    // Always available actions
    items.push({ separator: true });
    items.push({
      label: 'Select All',
      icon: '☑️',
      shortcut: 'Ctrl+A',
      action: () => this.selectAllCells()
    });

    this.showMenu(event.clientX, event.clientY, items, { type: 'cell', position });
  }

  showActionPaletteMenu(actionKey) {
    const items = [
      {
        label: 'Add to Favorites',
        icon: '⭐',
        action: () => this.toggleFavorite(actionKey)
      },
      {
        label: 'Copy Action Key',
        icon: '🔑',
        action: () => this.copyToClipboard(actionKey)
      },
      {
        label: 'Action Info',
        icon: 'ℹ️',
        action: () => this.showActionInfo(actionKey)
      }
    ];

    this.showMenu(event.clientX, event.clientY, items, { type: 'action', actionKey });
  }

  // Action implementations
  copyInstruction(instruction) {
    stateManager.setState({
      clipboard: {
        type: 'instruction',
        data: instruction
      }
    });
    loggers.ui.info(`Instruction copied: ${instruction.action}`);
  }

  pasteInstruction(position) {
    const clipboard = stateManager.getState('clipboard');
    if (clipboard && clipboard.type === 'instruction') {
      const program = stateManager.getState('program');
      if (program) {
        program.setInstruction(position, clipboard.data);
        stateManager.setState({ program });
        loggers.ui.info(`Instruction pasted at position ${position}`);
      }
    }
  }

  clearCell(position) {
    const program = stateManager.getState('program');
    if (program) {
      program.setInstruction(position, null);
      stateManager.setState({ program });
      loggers.ui.info(`Cell cleared at position ${position}`);
    }
  }

  showCellInfo(position, instruction) {
    const info = {
      position,
      coordinates: this.positionToCoordinates(position),
      action: instruction.action,
      label: instruction.label,
      value: instruction.value
    };

    // Could show a dialog or tooltip with this info
    console.log('Cell Info:', info);
  }

  positionToCoordinates(position) {
    const GRID_WIDTH = 16; // Should import from constants
    const x = position % GRID_WIDTH;
    const y = Math.floor(position / GRID_WIDTH);
    return { x, y };
  }

  toggleFavorite(actionKey) {
    // Implementation would depend on search/filter manager
    loggers.ui.info(`Toggled favorite for action: ${actionKey}`);
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      loggers.ui.info(`Copied to clipboard: ${text}`);
    });
  }

  showActionInfo(actionKey) {
    // Could show detailed info about the action
    loggers.ui.info(`Showing info for action: ${actionKey}`);
  }

  selectAllCells() {
    // Implementation for selecting all cells
    loggers.ui.info('Selected all cells');
  }
}

// Global instance
export const contextMenuManager = ContextMenuManager.getInstance();
