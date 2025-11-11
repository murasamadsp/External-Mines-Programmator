// Mines Programmator Main Entry Point
// Initializes the application when DOM is ready

import { ProgrammatorUI } from "./components/editor/programmator-ui.js";

let programmatorUI;

/**
 * Initialize the programmator application
 */
function initializeApp() {
  console.log("EMP запущено успішно");
  console.log("Initializing Mines Programmator...");

  try {
    programmatorUI = new ProgrammatorUI();
    console.log("Programmator initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Programmator:", error);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);

// Export for potential external use
export { initializeApp };
