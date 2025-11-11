// Mines Programmator User Interface
// Handles all UI interactions and DOM manipulation

import {
  ProgAction,
  GRID_WIDTH,
  GRID_HEIGHT,
  Program,
  Instruction,
  ProgramSerializer,
  ProgramFormatVersion,
} from "../../core/index.js";
import { formatInstruction, indexToGridPosition } from "../../utils/index.js";

export class ProgrammatorUI {
  constructor() {
    this.program = new Program();
    this.selectedAction = null;
    this.container = document.querySelector(".programmer-container");

    if (!this.container) {
      console.error("Programmer container not found!");
      return;
    }

    this.initializeUI();
  }

  /**
   * Initialize the user interface
   */
  initializeUI() {
    console.log("Creating action palette...");
    this.createActionPalette();

    console.log("Creating program grid...");
    this.createProgramGrid();

    console.log("Creating controls...");
    this.createControls();

    console.log("Programmator UI initialization completed!");
  }

  /**
   * Create action palette with categorized buttons
   */
  createActionPalette() {
    try {
      const palette = document.createElement("div");
      palette.id = "action-palette";
      palette.innerHTML = `
                <h3>Actions</h3>
                <div class="action-categories">
                    <div class="category">
                        <h4>Movement</h4>
                        <button data-action="MoveUp">↑ Move Up</button>
                        <button data-action="MoveLeft">← Move Left</button>
                        <button data-action="MoveDown">↓ Move Down</button>
                        <button data-action="MoveRight">→ Move Right</button>
                        <button data-action="MoveForward">↗ Move Forward</button>
                    </div>
                    <div class="category">
                        <h4>Rotation</h4>
                        <button data-action="RotateUp">↑ Rotate Up</button>
                        <button data-action="RotateLeft">← Rotate Left</button>
                        <button data-action="RotateDown">↓ Rotate Down</button>
                        <button data-action="RotateRight">→ Rotate Right</button>
                        <button data-action="RotateRandom">🎲 Random</button>
                    </div>
                    <div class="category">
                        <h4>Building</h4>
                        <button data-action="Dig">⛏️ Dig</button>
                        <button data-action="BuildBlock">🧱 Block</button>
                        <button data-action="BuildRoad">🛣️ Road</button>
                        <button data-action="BuildQuadro">🏗️ Quadro</button>
                    </div>
                    <div class="category">
                        <h4>Logic</h4>
                        <button data-action="SetStart">🏁 Set Start</button>
                        <button data-action="Terminate">⏹️ Terminate</button>
                        <button data-action="NextLine">⏎ Next Line</button>
                    </div>
                </div>
            `;

      this.container.appendChild(palette);
      console.log("Action palette created, binding buttons...");
      this.bindActionButtons();
    } catch (error) {
      console.error("Error creating action palette:", error);
    }
  }

  /**
   * Create the program grid (16x12)
   */
  createProgramGrid() {
    try {
      const grid = document.createElement("div");
      grid.id = "program-grid";

      console.log(`Creating grid with ${GRID_WIDTH}x${GRID_HEIGHT} cells...`);
      for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++) {
        const cell = document.createElement("div");
        cell.className = "program-cell";
        cell.dataset.index = i;
        cell.addEventListener("click", () => this.onCellClick(i));
        grid.appendChild(cell);
      }

      this.container.appendChild(grid);
      console.log("Program grid created successfully");
    } catch (error) {
      console.error("Error creating program grid:", error);
    }
  }

  /**
   * Create control panel with import/export functionality
   */
  createControls() {
    try {
      const controls = document.createElement("div");
      controls.id = "program-controls";
      controls.innerHTML = `
                <h3>Program Controls</h3>
                <div class="control-group">
                    <label for="import-program">Import Program:</label>
                    <textarea id="import-program" placeholder="Paste Base64 program code here..."></textarea>
                    <button id="import-btn">Import</button>
                </div>
                <div class="control-group">
                    <button id="export-btn">Export to Codes</button>
                    <button id="export-text-btn">Export to Text (v3)</button>
                    <button id="export-base64-btn">Export to Base64</button>
                </div>
                <div class="control-group">
                    <button id="validate-program">Validate Program</button>
                    <button id="clear-program">Clear Program</button>
                </div>
                <div class="control-group">
                    <label for="program-output">Program Output:</label>
                    <textarea id="program-output" placeholder="Base64 output will appear here..." readonly></textarea>
                </div>
                <div id="validation-messages"></div>
            `;

      this.container.appendChild(controls);

      console.log("Controls created, binding control buttons...");
      this.bindControlButtons();
    } catch (error) {
      console.error("Error creating controls:", error);
    }
  }

  /**
   * Bind action buttons to select actions
   */
  bindActionButtons() {
    this.container.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.selectedAction = e.target.dataset.action;
        this.container
          .querySelectorAll("[data-action]")
          .forEach((b) => b.classList.remove("selected"));
        e.target.classList.add("selected");
      });
    });
  }

  /**
   * Bind control buttons for import/export/validate
   */
  bindControlButtons() {
    // Import button
    this.container
      .querySelector("#import-btn")
      .addEventListener("click", async () => {
        const importText = this.container
          .querySelector("#import-program")
          .value.trim();
        if (!importText) {
          this.showValidationMessage(
            "Please enter Base64 program code to import",
            "error"
          );
          return;
        }

        try {
          this.program = await Program.fromString(importText);
          this.updateGridFromProgram();
          this.showValidationMessage(
            "Program imported successfully",
            "success"
          );
          this.container.querySelector("#import-program").value = "";
        } catch (error) {
          this.showValidationMessage(
            `Import failed: ${error.message}`,
            "error"
          );
        }
      });

    // Export button (Base64)
    this.container
      .querySelector("#export-btn")
      .addEventListener("click", async () => {
        try {
          // For Mines compatibility, export codes format instead of Base64
          const nonEmptyInstructions = this.program.instructions.filter(
            (inst) => inst.action !== ProgAction.None
          );
          const codes = nonEmptyInstructions
            .map((inst) => inst.action)
            .join(" ");
          this.container.querySelector("#program-output").value = codes;
          this.showValidationMessage(
            "Program exported to Codes format (for Mines)",
            "success"
          );
        } catch (error) {
          this.showValidationMessage(
            `Export failed: ${error.message}`,
            "error"
          );
        }
      });

    // Export to text (v3) button
    this.container
      .querySelector("#export-text-btn")
      .addEventListener("click", async () => {
        try {
          const output = await ProgramSerializer.encode(
            this.program.instructions,
            ProgramFormatVersion.Version3
          );
          this.container.querySelector("#program-output").value = output;
          this.showValidationMessage(
            "Program exported to Text (v3) format",
            "success"
          );
        } catch (error) {
          this.showValidationMessage(
            `Export failed: ${error.message}`,
            "error"
          );
        }
      });

    // Export to Base64 button
    this.container
      .querySelector("#export-base64-btn")
      .addEventListener("click", async () => {
        try {
          const output = await this.program.toBase64Format();
          this.container.querySelector("#program-output").value = output;
          this.showValidationMessage(
            "Program exported to Base64 format",
            "success"
          );
        } catch (error) {
          this.showValidationMessage(
            `Export failed: ${error.message}`,
            "error"
          );
        }
      });

    // Validate button
    this.container
      .querySelector("#validate-program")
      .addEventListener("click", () => {
        const validation = this.program.validate();
        this.displayValidationResults(validation);
      });

    // Clear button
    this.container
      .querySelector("#clear-program")
      .addEventListener("click", () => {
        this.program.clear();
        this.container.querySelectorAll(".program-cell").forEach((cell) => {
          cell.textContent = "";
          cell.className = "program-cell";
        });
        this.container.querySelector("#program-output").value = "";
        this.clearValidationMessages();
      });
  }

  /**
   * Handle cell click to place/remove actions
   * @param {number} index - Cell index in grid
   */
  onCellClick(index) {
    if (!this.selectedAction) return;

    const actionCode = ProgAction[this.selectedAction];
    if (actionCode === undefined) return;

    const { x, y } = indexToGridPosition(index);

    // Create instruction with basic properties
    const instruction = new Instruction(actionCode, null, null);

    // For actions that need labels, prompt user
    if (
      [
        ProgAction.Goto,
        ProgAction.Call,
        ProgAction.CallArg,
        ProgAction.YesNoGoto,
        ProgAction.NoYesGoto,
        ProgAction.Label,
      ].includes(actionCode)
    ) {
      const label = prompt("Enter label for this action:");
      if (label && label.trim()) {
        instruction.label = label.trim();
      }
    }

    // For variable operations, prompt for value
    if (
      actionCode >= ProgAction.VarGreaterThanNumber &&
      actionCode <= ProgAction.VarNotEqualsNumber
    ) {
      const value = prompt("Enter value for variable comparison:");
      if (value !== null && !isNaN(parseInt(value))) {
        instruction.value = parseInt(value);
      }
    }

    this.program.setInstructionAt(x, y, instruction);
    this.updateCellDisplay(index);
  }

  /**
   * Update display of specific cell
   * @param {number} index - Cell index
   */
  updateCellDisplay(index) {
    const cell = this.container.querySelector(`[data-index="${index}"]`);
    const { x, y } = indexToGridPosition(index);
    const instruction = this.program.getInstructionAt(x, y);

    if (instruction.action === ProgAction.None) {
      cell.textContent = "";
      cell.className = "program-cell";
      cell.title = "";
    } else {
      const formatted = formatInstruction(instruction);

      cell.textContent = formatted.shortCode;
      cell.className = `program-cell action-${instruction.action}`;
      cell.title = formatted.description;
    }
  }

  /**
   * Update entire grid from program instructions
   */
  updateGridFromProgram() {
    for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++) {
      this.updateCellDisplay(i);
    }
  }

  /**
   * Show validation message
   * @param {string} message - Message text
   * @param {string} type - Message type (success/error)
   */
  showValidationMessage(message, type) {
    const messagesContainer = this.container.querySelector(
      "#validation-messages"
    );
    messagesContainer.innerHTML = `<div class="validation-message ${type}">${message}</div>`;

    // Clear message after 5 seconds for success messages
    if (type === "success") {
      setTimeout(() => {
        this.clearValidationMessages();
      }, 5000);
    }
  }

  /**
   * Display detailed validation results
   * @param {Object} validation - Validation result object
   */
  displayValidationResults(validation) {
    const messagesContainer = this.container.querySelector(
      "#validation-messages"
    );
    let html = "";

    if (validation.errors.length > 0) {
      html += '<div class="validation-errors">';
      html += "<h4>Errors:</h4>";
      html += "<ul>";
      validation.errors.forEach((error) => {
        html += `<li class="error">${error}</li>`;
      });
      html += "</ul>";
      html += "</div>";
    }

    if (validation.warnings.length > 0) {
      html += '<div class="validation-warnings">';
      html += "<h4>Warnings:</h4>";
      html += "<ul>";
      validation.warnings.forEach((warning) => {
        html += `<li class="warning">${warning}</li>`;
      });
      html += "</ul>";
      html += "</div>";
    }

    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      html = '<div class="validation-message success">Program is valid!</div>';
    }

    messagesContainer.innerHTML = html;
  }

  /**
   * Clear validation messages
   */
  clearValidationMessages() {
    const messagesContainer = this.container.querySelector(
      "#validation-messages"
    );
    messagesContainer.innerHTML = "";
  }
}
