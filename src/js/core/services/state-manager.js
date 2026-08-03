// State Manager for global application state
// Implements a simple pub/sub pattern for state updates

import { loggers } from "../../utils/logging/logger.js";

class StateManager {
  constructor() {
    this.state = {
      program: null,
      currentPage: 0,
      cursorPosition: 0,
      clipboard: null,
      dragMode: false,
      selectedInstruction: null,
      insertTarget: null,
      dragState: {
        isDragging: false,
        draggedInstruction: null,
        startPosition: null,
      },
    };

    this.listeners = [];
    this.init();
  }

  static getInstance() {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  init() {
    loggers.services.info("🧠 StateManager initialized");
  }

  getState(key) {
    if (key) {
      return this.state[key];
    }
    return this.state;
  }

  setState(newState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };

    // Notify listeners
    this.notifyListeners(this.state, oldState);
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(newState, oldState) {
    this.listeners.forEach(listener => {
      try {
        listener(newState, oldState);
      } catch (error) {
        loggers.services.error("Error in state listener:", error);
      }
    });
  }
}

export const stateManager = StateManager.getInstance();
