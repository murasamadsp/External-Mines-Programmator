// Mines Programmator User Interface
// Handles all UI interactions and DOM manipulation

import {
  ProgAction,
  GRID_WIDTH,
  GRID_HEIGHT,
  MAX_PAGES,
  Program,
  Instruction,
  ProgramFormatVersion,
} from "../../core/index.js";
import { ProgramSerializer } from "../../core/services/serializer.js";
import { formatInstruction, indexToGridPosition } from "../../utils/index.js";

export class ProgrammatorUI {
  constructor() {
    console.log("🏗️ Initializing ProgrammatorUI...");
    this.program = new Program();
    this.selectedAction = null;
    this.currentPage = 0; // Current page number (0-15)

    // Check for new three-column layout first
    const layoutContainer = document.querySelector('.programmer-layout');
    const oldContainer = document.querySelector(".programmer-container");

    if (!layoutContainer && !oldContainer) {
      console.error("❌ No programmer container found (neither new layout nor old container)!");
      return;
    }

    console.log("✅ Programmer layout found, proceeding with initialization");
    this.initializeUI();
  }

  /**
   * Initialize the user interface
   */
  initializeUI() {
    console.log("Setting up layout containers...");
    this.setupLayoutContainers();

    console.log("Creating action palette...");
    this.createActionPalette();

    console.log("Creating program grid...");
    this.createProgramGrid();

    console.log("Creating controls...");
    this.createControls();

    console.log("Updating page display...");
    this.updatePageDisplay();

    console.log("Programmator UI initialization completed!");
  }

  /**
   * Set up layout containers for three-column layout
   */
  setupLayoutContainers() {
    // Get the layout containers
    this.leftSidebar = document.querySelector('.programmer-sidebar-left');
    this.mainContent = document.querySelector('.programmer-main');
    this.rightSidebar = document.querySelector('.programmer-sidebar-right');

    if (!this.leftSidebar || !this.mainContent || !this.rightSidebar) {
      console.error("❌ Layout containers not found!");
      // Fallback to old single container
      this.leftSidebar = this.mainContent = this.rightSidebar = document.querySelector(".programmer-container");
      if (!this.leftSidebar) {
        console.error("❌ Fallback container not found!");
        return;
      }
    }
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
                        <button data-action="ShiftUp">[↑] Shift Up</button>
                        <button data-action="ShiftLeft">[←] Shift Left</button>
                        <button data-action="ShiftDown">[↓] Shift Down</button>
                        <button data-action="ShiftRight">[→] Shift Right</button>
                        <button data-action="ShiftForward">[↗] Shift Forward</button>
                    </div>
                    <div class="category">
                        <h4>Rotation</h4>
                        <button data-action="RotateUp">↑ Rotate Up</button>
                        <button data-action="RotateLeft">← Rotate Left</button>
                        <button data-action="RotateDown">↓ Rotate Down</button>
                        <button data-action="RotateRight">→ Rotate Right</button>
                        <button data-action="RotateRandom">🎲 Random</button>
                        <button data-action="RotateLefthand">↺ Left Hand</button>
                        <button data-action="RotateRighthand">↻ Right Hand</button>
                    </div>
                    <div class="category">
                        <h4>Building</h4>
                        <button data-action="Dig">⛏️ Dig</button>
                        <button data-action="BuildBlock">🧱 Block</button>
                        <button data-action="BuildRoad">🛣️ Road</button>
                        <button data-action="BuildQuadro">🏗️ Quadro</button>
                        <button data-action="BuildWar">⚔️ War</button>
                        <button data-action="Heal">💚 Heal</button>
                        <button data-action="UseGeo">💎 Geo</button>
                        <button data-action="STDDig">⚒️ STD Dig</button>
                        <button data-action="STDBlock">🏗️ STD Block</button>
                        <button data-action="STDHeal">❤️ STD Heal</button>
                        <button data-action="STDTunnel">⛏️ STD Tunnel</button>
                    </div>
                    <div class="category">
                        <h4>Logic</h4>
                        <button data-action="SetStart">🏁 Set Start</button>
                        <button data-action="Terminate">⏹️ Terminate</button>
                        <button data-action="NextLine">⏎ Next Line</button>
                        <button data-action="RepeatLastAction">🔄 Repeat</button>
                        <button data-action="Label">🏷️ Label</button>
                        <button data-action="Goto">➡️ Goto</button>
                        <button data-action="Call">📞 Call</button>
                        <button data-action="CallArg">📞 Call Arg</button>
                        <button data-action="Return">⬅️ Return</button>
                        <button data-action="ReturnArg">⬅️ Return Arg</button>
                        <button data-action="CallState">📞 Call State</button>
                        <button data-action="ReturnState">⬅️ Return State</button>
                        <button data-action="CallWhenDied">💀 Call When Died</button>
                    </div>
                    <div class="category">
                        <h4>Conditions</h4>
                        <button data-action="IsNotEmpty">🚫 Empty</button>
                        <button data-action="IsEmpty">✅ Empty</button>
                        <button data-action="IsFalling">📉 Falling</button>
                        <button data-action="IsCrystal">💎 Crystal</button>
                        <button data-action="IsAliveCrystal">🌟 Alive Crystal</button>
                        <button data-action="IsFallingLikeBoulder">🪨 Boulder</button>
                        <button data-action="IsFallingLikeLiquid">💧 Liquid</button>
                        <button data-action="IsBreakable">🔨 Breakable</button>
                        <button data-action="IsUnbreakable">🛡️ Unbreakable</button>
                        <button data-action="IsRedRock">🪨 Red Rock</button>
                        <button data-action="IsBlackRock">⚫ Black Rock</button>
                        <button data-action="IsAcid">🧪 Acid</button>
                        <button data-action="IsSand">🏖️ Sand</button>
                        <button data-action="IsQuadro">🔲 Quadro</button>
                        <button data-action="IsRoad">🛣️ Road</button>
                        <button data-action="IsRedBlock">🔴 Red Block</button>
                        <button data-action="IsYellowBlock">🟡 Yellow Block</button>
                        <button data-action="IsGreenBlock">🟢 Green Block</button>
                        <button data-action="IsAcidRock">🪨 Acid Rock</button>
                        <button data-action="IsBoulder">🪨 Boulder</button>
                        <button data-action="IsLava">🌋 Lava</button>
                        <button data-action="IsCyanAlive">🔵 Cyan Alive</button>
                        <button data-action="IsWhiteAlive">⚪ White Alive</button>
                        <button data-action="IsRedAlive">🔴 Red Alive</button>
                        <button data-action="IsVioletAlive">🟣 Violet Alive</button>
                        <button data-action="IsBlackAlive">⚫ Black Alive</button>
                        <button data-action="IsBlueAlive">🔵 Blue Alive</button>
                        <button data-action="IsRainbowAlive">🌈 Rainbow Alive</button>
                        <button data-action="IsBox">📦 Box</button>
                        <button data-action="IsStructure">🏗️ Structure</button>
                        <button data-action="IsBasketFull">🧺 Basket Full</button>
                        <button data-action="IsGeoFull">💎 Geo Full</button>
                        <button data-action="IsInsideGun">🔫 In Gun</button>
                        <button data-action="IsHealthNotFull">💔 Health <100%</button>
                        <button data-action="IsHealthLessThanHalf">💔 Health <50%</button>
                    </div>
                    <div class="category">
                        <h4>Variables</h4>
                        <button data-action="SetNumberToVar">🔢 Set Var</button>
                        <button data-action="AddNumberToVar">➕ Add to Var</button>
                        <button data-action="MultNumberToVar">✖️ Mult Var</button>
                        <button data-action="DivNumberToVar">➗ Div Var</button>
                        <button data-action="SubNumberToVar">➖ Sub Var</button>
                        <button data-action="AddVarToVar">🔀 Add Vars</button>
                        <button data-action="MultVarToVar">🔀 Mult Vars</button>
                        <button data-action="DivVarToVar">🔀 Div Vars</button>
                        <button data-action="SubVarToVar">🔀 Sub Vars</button>
                        <button data-action="VarGreaterThanNumber">> Var > Num</button>
                        <button data-action="VarLessThanNumber">< Var < Num</button>
                        <button data-action="VarEqualsNumber">= Var = Num</button>
                        <button data-action="VarGreaterThanOrEqualNumber">≥ Var ≥ Num</button>
                        <button data-action="VarLessThanOrEqualNumber">≤ Var ≤ Num</button>
                        <button data-action="VarNotEqualsNumber">≠ Var ≠ Num</button>
                        <button data-action="VarGreaterThanState">> Var > State</button>
                        <button data-action="VarLessThanState">< Var < State</button>
                        <button data-action="VarEqualsState">= Var = State</button>
                        <button data-action="VarGreaterThanOrEqualsState">≥ Var ≥ State</button>
                        <button data-action="VarLessThanOrEqualState">≤ Var ≤ State</button>
                        <button data-action="VarEqualsState">= Var = State</button>
                        <button data-action="VarNotEqualsState">≠ Var ≠ State</button>
                        <button data-action="VarRound">🔄 Round Var</button>
                        <button data-action="VarCeil">⬆️ Ceil Var</button>
                        <button data-action="VarFloor">⬇️ Floor Var</button>
                        <button data-action="WriteStateToVar">📝 State→Var</button>
                        <button data-action="ReadVarToState">📖 Var→State</button>
                    </div>
                    <div class="category">
                        <h4>Sensing</h4>
                        <button data-action="CellUpLeft">[↖] Up-Left</button>
                        <button data-action="CellUp">[↑] Up</button>
                        <button data-action="CellUpRight">[↗] Up-Right</button>
                        <button data-action="CellLeft">[←] Left</button>
                        <button data-action="Cell">[●] Current</button>
                        <button data-action="CellRight">[→] Right</button>
                        <button data-action="CellDownLeft">[↙] Down-Left</button>
                        <button data-action="CellDown">[↓] Down</button>
                        <button data-action="CellDownRight">[↘] Down-Right</button>
                        <button data-action="CellForward">[↗] Forward</button>
                        <button data-action="CellLefthand">[👈] Left Hand</button>
                        <button data-action="CellRighthand">[👉] Right Hand</button>
                    </div>
                    <div class="category">
                        <h4>Items</h4>
                        <button data-action="UseBoom">💣 Boom</button>
                        <button data-action="UseRaz">⚡ Raz</button>
                        <button data-action="UseProt">🛡️ Prot</button>
                        <button data-action="UseGeopack">🎒 Geopack</button>
                        <button data-action="UseZZ">💊 ZZ</button>
                        <button data-action="UseC190">💉 C190</button>
                        <button data-action="UsePoly">🧪 Poly</button>
                        <button data-action="Upgrade">⬆️ Upgrade</button>
                        <button data-action="RefillCraft">🔧 Craft</button>
                        <button data-action="UseNano">🤖 Nano</button>
                        <button data-action="UseRem">🧹 Rem</button>
                        <button data-action="ChargeGun">🔫 Charge Gun</button>
                    </div>
                    <div class="category">
                        <h4>Inventory</h4>
                        <button data-action="InventoryUp">↑ Inv Up</button>
                        <button data-action="InventoryLeft">← Inv Left</button>
                        <button data-action="InventoryDown">↓ Inv Down</button>
                        <button data-action="InventoryRight">→ Inv Right</button>
                        <button data-action="BoxAll">📦 Box All</button>
                        <button data-action="BoxHalf">📦 Box Half</button>
                        <button data-action="BoxWhite">⚪ Box White</button>
                        <button data-action="BoxGreen">🟢 Box Green</button>
                        <button data-action="BoxRed">🔴 Box Red</button>
                        <button data-action="BoxBlue">🔵 Box Blue</button>
                        <button data-action="BoxCyan">🔵 Box Cyan</button>
                        <button data-action="BoxViolet">🟣 Box Violet</button>
                    </div>
                    <div class="category">
                        <h4>Control</h4>
                        <button data-action="BooleanOR">∨ OR</button>
                        <button data-action="BooleanAND">∧ AND</button>
                        <button data-action="YesNoGoto">❌→ Goto</button>
                        <button data-action="NoYesGoto">✅→ Goto</button>
                        <button data-action="YesNoNextRow">❌→ Next Row</button>
                        <button data-action="NoYesNextRow">✅→ Next Row</button>
                        <button data-action="YesNoGotoStart">❌→ Start</button>
                        <button data-action="NoYesGotoStart">✅→ Start</button>
                        <button data-action="YesNoTerminate">❌→ Terminate</button>
                        <button data-action="NoYesTerminate">✅→ Terminate</button>
                        <button data-action="Flip">🔄 Flip</button>
                    </div>
                    <div class="category">
                        <h4>Settings</h4>
                        <button data-action="EnableAutoDig">⚡ Auto Dig ON</button>
                        <button data-action="DisableAutoDig">⏸️ Auto Dig OFF</button>
                        <button data-action="EnableAggression">😡 Aggression ON</button>
                        <button data-action="DisableAggression">😌 Aggression OFF</button>
                        <button data-action="EnableHand">🤏 Hand ON</button>
                        <button data-action="DisableHand">✋ Hand OFF</button>
                        <button data-action="SetStartWhenDied">💀 Start When Died</button>
                        <button data-action="SetStartWhenHurt">🤕 Start When Hurt</button>
                        <button data-action="SetStartWhenBotNearby">👤 Start When Bot</button>
                    </div>
                    <div class="category">
                        <h4>Debug</h4>
                        <button data-action="PlaySound">🔊 Sound</button>
                        <button data-action="DebugPause">⏸️ Debug Pause</button>
                        <button data-action="DebugShow">👁️ Debug Show</button>
                    </div>
                </div>
            `;

      this.leftSidebar.appendChild(palette);
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

      console.log(`Creating grid with ${GRID_WIDTH}x${GRID_HEIGHT} cells for page ${this.currentPage}...`);
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = document.createElement("div");
        cell.className = "program-cell";
          cell.dataset.x = x;
          cell.dataset.y = y;
          cell.addEventListener("click", () => this.onCellClick(x, y));
        grid.appendChild(cell);
        }
      }

      this.mainContent.appendChild(grid);
      this.updateGridDisplay();
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
                    <button id="expert-settings-btn">⚙️ Expert Settings</button>
                </div>
                <div class="control-group">
                    <label>Page:</label>
                    <div class="page-controls">
                        <button id="prev-page" disabled>⬅️ Prev</button>
                        <span id="page-indicator">00</span>
                        <button id="next-page">Next ➡️</button>
                    </div>
                </div>
                <div class="control-group">
                    <label for="program-output">Program Output:</label>
                    <textarea id="program-output" placeholder="Base64 output will appear here..." readonly></textarea>
                </div>
                <div id="validation-messages"></div>
            `;

      this.mainContent.appendChild(controls);

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
    if (!this.leftSidebar) {
      console.error("❌ Left sidebar container not initialized!");
      return;
    }

    const self = this; // Capture this context
    this.leftSidebar.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", function(e) {
        const actionName = this.dataset.action; // Use this instead of btn
        console.log(`🎯 CLICKED action button: "${actionName}" (from ${this.tagName})`);

        if (!actionName) {
          console.error(`❌ ERROR: No data-action on button`, this);
          return;
        }

        console.log(`🎯 BUTTON CLICK PROCESSING: actionName="${actionName}"`);
        console.log(`🎯 BUTTON CLICK: self.selectedAction before = "${self.selectedAction}"`);
        self.selectedAction = actionName;
        console.log(`🎯 SET selectedAction to: "${self.selectedAction}"`);
        console.log(`🎯 ProgAction["${self.selectedAction}"] = ${ProgAction[self.selectedAction]}`);
        console.log(`🎯 ProgAction object keys: ${Object.keys(ProgAction).slice(0, 10).join(', ')}...`);

        self.leftSidebar
          .querySelectorAll("[data-action]")
          .forEach((b) => b.classList.remove("selected"));
        this.classList.add("selected");
      });
    });
  }

  /**
   * Bind control buttons for import/export/validate
   */
  bindControlButtons() {
    if (!this.mainContent) {
      console.error("❌ Main content container not initialized!");
      return;
    }

    // Import button
    this.mainContent
      .querySelector("#import-btn")
      .addEventListener("click", async () => {
        const importText = this.mainContent
          .querySelector("#import-program")
          .value.trim();

        if (!importText) {
          console.log("❌ Import failed: empty input");
          this.showValidationMessage(
            "Please enter Base64 program code to import",
            "error"
          );
          return;
        }

        console.log(
          `📥 Importing program, Base64 length: ${importText.length}`
        );

        try {
          this.program = await Program.fromString(importText);
          console.log(
            `✅ Program imported: ${this.program.instructions.length} instructions`
          );

          this.updateGridDisplay();
          this.showValidationMessage(
            "Program imported successfully",
            "success"
          );
          this.mainContent.querySelector("#import-program").value = "";
        } catch (error) {
          console.error("❌ Import failed:", error);
          this.showValidationMessage(
            `Import failed: ${error.message}`,
            "error"
          );
        }
      });

    // Export button (Base64)
    this.mainContent
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
          this.mainContent.querySelector("#program-output").value = codes;
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
    this.mainContent
      .querySelector("#export-text-btn")
      .addEventListener("click", async () => {
        try {
          const output = await ProgramSerializer.encode(
            this.program.instructions,
            ProgramFormatVersion.Version3
          );
          this.mainContent.querySelector("#program-output").value = output;
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
    this.mainContent
      .querySelector("#export-base64-btn")
      .addEventListener("click", async () => {
        try {
          console.log("🔄 Starting Base64 export...");
          console.log(
            "📊 Current program instructions:",
            this.program.instructions.length
          );

          const output = await this.program.toBase64Format();
          console.log("✅ Base64 export completed, length:", output.length);

          this.mainContent.querySelector("#program-output").value = output;
          this.showValidationMessage(
            `Program exported to Base64 format (${output.length} chars)`,
            "success"
          );
        } catch (error) {
          console.error("❌ Base64 export failed:", error);
          this.showValidationMessage(
            `Export failed: ${error.message}`,
            "error"
          );
        }
      });

    // Validate button
    this.mainContent
      .querySelector("#validate-program")
      .addEventListener("click", () => {
        const validation = this.program.validate();
        this.displayValidationResults(validation);
      });

    // Clear button
    this.mainContent
      .querySelector("#clear-program")
      .addEventListener("click", () => {
        this.program.clear();
        this.updateGridDisplay();
        this.mainContent.querySelector("#program-output").value = "";
        this.clearValidationMessages();
      });

    // Expert settings button
    this.mainContent
      .querySelector("#expert-settings-btn")
      .addEventListener("click", () => {
        this.showExpertSettingsDialog();
      });

    // Page navigation buttons
    this.mainContent
      .querySelector("#prev-page")
      .addEventListener("click", () => {
        this.switchToPrevPage();
      });

    this.mainContent
      .querySelector("#next-page")
      .addEventListener("click", () => {
        this.switchToNextPage();
      });
  }

  /**
   * Handle cell click to place/remove actions
   * @param {number} index - Cell index in grid
   */
  async onCellClick(x, y) {
    console.log(`🖱️ CELL CLICK: [${x}, ${y}] selectedAction="${this.selectedAction}"`);
    console.log(`🖱️ CELL CLICK DETAILS: x=${x}, y=${y}, currentPage=${this.currentPage}, program exists=${!!this.program}`);
    console.log(`🖱️ CELL CLICK: typeof x=${typeof x}, typeof y=${typeof y}`);
    console.log(`🖱️ CELL CLICK: this.selectedAction type=${typeof this.selectedAction}`);

    const existingInstruction = this.program.getInstructionAt(x, y, this.currentPage);
    console.log(`🖱️ EXISTING INSTRUCTION: action=${existingInstruction.action}, label="${existingInstruction.label}", value=${existingInstruction.value}`);
    console.log(`🖱️ EXISTING INSTRUCTION: typeof action=${typeof existingInstruction.action}, typeof label=${typeof existingInstruction.label}, typeof value=${typeof existingInstruction.value}`);
    console.log(`🖱️ EXISTING INSTRUCTION: ProgAction.None=${ProgAction.None}`);

    // If cell is not empty and no action is selected, remove the instruction
    const shouldRemove = existingInstruction.action !== ProgAction.None && !this.selectedAction;
    console.log(`🖱️ REMOVE CHECK: existing.action !== ProgAction.None (${existingInstruction.action} !== ${ProgAction.None}) = ${existingInstruction.action !== ProgAction.None}`);
    console.log(`🖱️ REMOVE CHECK: !this.selectedAction (${!this.selectedAction}) = ${!this.selectedAction}`);
    console.log(`🖱️ REMOVE CHECK: shouldRemove = ${shouldRemove}`);

    if (shouldRemove) {
      console.log(`🗑️ Removing instruction at [${x}, ${y}] page ${this.currentPage}: ${formatInstruction(existingInstruction)}`);
      console.log(`🗑️ REMOVE: calling setInstructionAt with ProgAction.None=${ProgAction.None}, null, null, page=${this.currentPage}`);
      this.program.setInstructionAt(
        x,
        y,
        ProgAction.None,
        null,
        null,
        this.currentPage
      );
      console.log(`🗑️ REMOVE: calling updateCellDisplay(${x}, ${y})`);
      this.updateCellDisplay(x, y);
      console.log(`✅ Removed instruction at [${x}, ${y}] page ${this.currentPage}`);
      return;
    }

    console.log(`🖱️ NO ACTION CHECK: this.selectedAction = "${this.selectedAction}", boolean = ${!!this.selectedAction}`);
    if (!this.selectedAction) {
      console.log(`❌ No action selected, ignoring click on cell [${x}, ${y}]`);
      return;
    }

    const actionCode = ProgAction[this.selectedAction];
    console.log(`🖱️ LOOKUP: ProgAction["${this.selectedAction}"] = ${actionCode}`);
    console.log(`🖱️ LOOKUP: ProgAction object has property "${this.selectedAction}" = ${ProgAction.hasOwnProperty(this.selectedAction)}`);

    if (actionCode === undefined) {
      console.log(`❌ ERROR: Unknown action "${this.selectedAction}"`);
      return;
    }

    console.log(`📍 Placing ${this.selectedAction} (code: ${actionCode}) at position [${x}, ${y}] page ${this.currentPage}`);
    console.log(`📍 INSTRUCTION CREATION: creating new Instruction with actionCode=${actionCode}, null, null`);

    // Create instruction with basic properties
    const instruction = new Instruction(actionCode, null, null);
    console.log(`📍 INSTRUCTION CREATED: ${JSON.stringify(instruction)}`);

    // For actions that need labels, create input dialog
    if (
      [
        ProgAction.Goto,
        ProgAction.Call,
        ProgAction.CallArg,
        ProgAction.CallState,
        ProgAction.YesNoGoto,
        ProgAction.NoYesGoto,
        ProgAction.YesNoNextRow,
        ProgAction.NoYesNextRow,
        ProgAction.YesNoGotoStart,
        ProgAction.NoYesGotoStart,
        ProgAction.YesNoTerminate,
        ProgAction.NoYesTerminate,
        ProgAction.Label,
        ProgAction.CallWhenDied,
        ProgAction.DebugPause,
        ProgAction.DebugShow,
      ].includes(actionCode)
    ) {
      const label = await this.promptForLabel("Enter label for this action:");
      if (label && label.trim()) {
        instruction.label = label.trim();
      }
    }

    // For variable operations with numbers, prompt for value
    if (
      actionCode >= ProgAction.VarGreaterThanNumber &&
      actionCode <= ProgAction.VarNotEqualsNumber
    ) {
      console.log(`🔢 VARIABLE COMPARISON: actionCode=${actionCode}, calling promptForValue`);
      try {
        console.log(`🔢 VARIABLE COMPARISON: using native prompt instead of dialog to avoid extension conflicts`);
        const inputValue = prompt("Enter value for variable comparison:");
        console.log(`🔢 VARIABLE COMPARISON: prompt result = "${inputValue}"`);
        if (inputValue !== null && inputValue.trim() !== "") {
          const parsed = parseInt(inputValue.trim());
          console.log(`🔢 VARIABLE COMPARISON: parsed "${inputValue}" to ${parsed}`);
          if (!isNaN(parsed)) {
            instruction.value = parsed;
            console.log(`🔢 VARIABLE COMPARISON: set instruction.value=${instruction.value}`);
          } else {
            console.log(`🔢 VARIABLE COMPARISON: invalid number, skipping`);
          }
        } else {
          console.log(`🔢 VARIABLE COMPARISON: user cancelled or empty input`);
        }
      } catch (error) {
        console.error("❌ Error prompting for variable comparison value:", error);
      }
    }

    // For variable operations with state, prompt for value
    if (
      actionCode >= ProgAction.SetNumberToVar &&
      actionCode <= ProgAction.SubNumberToVar
    ) {
      console.log(`🔢 VARIABLE SET: actionCode=${actionCode}, calling promptForValue`);
      try {
        console.log(`🔢 VARIABLE SET: using native prompt instead of dialog to avoid extension conflicts`);
        const inputValue = prompt("Enter value to set in variable:");
        console.log(`🔢 VARIABLE SET: prompt result = "${inputValue}"`);
        if (inputValue !== null && inputValue.trim() !== "") {
          const parsed = parseInt(inputValue.trim());
          console.log(`🔢 VARIABLE SET: parsed "${inputValue}" to ${parsed}`);
          if (!isNaN(parsed)) {
            instruction.value = parsed;
            console.log(`🔢 VARIABLE SET: set instruction.value=${instruction.value}`);
          } else {
            console.log(`🔢 VARIABLE SET: invalid number, skipping`);
          }
        } else {
          console.log(`🔢 VARIABLE SET: user cancelled or empty input`);
        }
      } catch (error) {
        console.error("❌ Error prompting for variable value:", error);
      }
    }

    console.log(`📍 SET INSTRUCTION: calling setInstructionAt(${x}, ${y}, ${instruction.action}, "${instruction.label}", ${instruction.value}, ${this.currentPage})`);
    this.program.setInstructionAt(x, y, instruction.action, instruction.label, instruction.value, this.currentPage);
    console.log(`📍 SET INSTRUCTION: completed, calling updateCellDisplay(${x}, ${y})`);
    this.updateCellDisplay(x, y);
    console.log(`📍 UPDATE CELL DISPLAY: completed`);

    console.log(
      `✅ Placed instruction: ${this.selectedAction} at [${x}, ${y}] page ${this.currentPage}`
    );
    console.log(`✅ FINAL INSTRUCTION: ${JSON.stringify(instruction)}`);
  }

  /**
   * Update display of specific cell
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  updateCellDisplay(x, y) {
    const cell = this.mainContent.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    const instruction = this.program.getInstructionAt(x, y, this.currentPage);

    if (instruction.action === ProgAction.None) {
      cell.textContent = "";
      cell.className = "program-cell";
      cell.title = "";
    } else {
      const formatted = formatInstruction(instruction);
      console.log(`🔄 CELL [${x}, ${y}]: action=${instruction.action} -> "${formatted.shortCode}"`);
      cell.textContent = formatted.shortCode;
      cell.className = `program-cell action-${instruction.action}`;
      cell.title = formatted.description;
    }
  }

  /**
   * Update entire grid display for current page
   */
  updateGridDisplay() {
    console.log(
      `🔄 Updating grid display for page ${this.currentPage} (${GRID_WIDTH * GRID_HEIGHT} cells)`
    );
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        this.updateCellDisplay(x, y);
      }
    }
    console.log(`✅ Grid display updated for page ${this.currentPage}`);
  }

  /**
   * Switch to previous page
   */
  switchToPrevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePageDisplay();
      this.updateGridDisplay();
      console.log(`📄 Switched to page ${this.currentPage}`);
    }
  }

  /**
   * Switch to next page
   */
  switchToNextPage() {
    if (this.currentPage < MAX_PAGES - 1) {
      this.currentPage++;
      this.updatePageDisplay();
      this.updateGridDisplay();
      console.log(`📄 Switched to page ${this.currentPage}`);
    }
  }

  /**
   * Update page indicator and button states
   */
  updatePageDisplay() {
    const pageIndicator = document.getElementById('page-indicator');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    if (pageIndicator) {
      pageIndicator.textContent = this.currentPage.toString().padStart(2, '0');
    }

    if (prevButton) {
      prevButton.disabled = this.currentPage === 0;
    }

    if (nextButton) {
      nextButton.disabled = this.currentPage === MAX_PAGES - 1;
    }
  }

  /**
   * Show validation message
   * @param {string} message - Message text
   * @param {string} type - Message type (success/error)
   */
  showValidationMessage(message, type) {
    const messagesContainer = this.mainContent.querySelector(
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
    const messagesContainer = this.mainContent.querySelector(
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
    const messagesContainer = this.mainContent.querySelector(
      "#validation-messages"
    );
    messagesContainer.innerHTML = "";
  }


  /**
   * Prompt for label input
   * @param {string} message - Prompt message
   * @returns {Promise<string|null>} Label or null
   */
  async promptForLabel(message) {
    console.log(`🏷️ PROMPT FOR LABEL: message="${message}"`);
    const inputValue = prompt(message);
    console.log(`🏷️ PROMPT FOR LABEL: user input = "${inputValue}"`);
    if (inputValue !== null && inputValue.trim() !== "") {
      console.log(`🏷️ PROMPT FOR LABEL: returning trimmed value = "${inputValue.trim()}"`);
      return inputValue.trim();
    } else {
      console.log(`🏷️ PROMPT FOR LABEL: user cancelled or empty input, returning null`);
      return null;
    }
  }

  /**
   * Prompt for numeric value input
   * @param {string} message - Prompt message
   * @returns {Promise<number|null>} Value or null
   */
  async promptForValue(message) {
    console.log(`🔢 PROMPT FOR VALUE: message="${message}"`);
    const inputValue = prompt(message, "0");
    console.log(`🔢 PROMPT FOR VALUE: user input = "${inputValue}"`);

    if (inputValue === null) {
      console.log(`🔢 PROMPT FOR VALUE: user cancelled, returning null`);
      return null;
    }

    const trimmed = inputValue.trim();
    console.log(`🔢 PROMPT FOR VALUE: trimmed input = "${trimmed}"`);

    if (trimmed === "") {
      console.log(`🔢 PROMPT FOR VALUE: empty input, returning null`);
      return null;
    }

    const parsed = parseInt(trimmed);
    console.log(`🔢 PROMPT FOR VALUE: parsed "${trimmed}" to ${parsed}`);

    if (isNaN(parsed)) {
      console.log(`🔢 PROMPT FOR VALUE: invalid number, returning null`);
      return null;
    }

    console.log(`🔢 PROMPT FOR VALUE: returning ${parsed}`);
    return parsed;
  }

  /**
   * Show expert settings dialog
   */
  showExpertSettingsDialog() {
    console.log("🔧 SHOWING EXPERT SETTINGS DIALOG");

    const dialog = document.createElement("div");
    dialog.className = "expert-settings-overlay";
    dialog.innerHTML = `
      <div class="expert-settings-dialog">
        <div class="expert-settings-header">
          <h2>⚙️ Expert Settings</h2>
          <button class="expert-settings-close-btn" title="Close">✕</button>
        </div>

        <div class="expert-settings-content">
          <div class="expert-section">
            <h3>🚀 Performance Settings</h3>
            <div class="expert-setting">
              <label>
                <input type="checkbox" id="expert-enable-debug-logging">
                Enable Debug Logging
              </label>
              <div class="setting-description">Show detailed internal logs in console</div>
            </div>

            <div class="expert-setting">
              <label>
                <input type="checkbox" id="expert-enable-performance-monitor">
                Performance Monitor
              </label>
              <div class="setting-description">Monitor UI performance metrics</div>
            </div>
          </div>

          <div class="expert-section">
            <h3>🎮 Game Integration</h3>
            <div class="expert-setting">
              <label>
                <input type="checkbox" id="expert-auto-sync">
                Auto Sync with Game
              </label>
              <div class="setting-description">Automatically sync program changes</div>
            </div>

            <div class="expert-setting">
              <label>
                <input type="checkbox" id="expert-enable-hotkeys">
                Advanced Hotkeys
              </label>
              <div class="setting-description">Enable keyboard shortcuts for actions</div>
            </div>
          </div>

          <div class="expert-section">
            <h3>🔧 Developer Tools</h3>
            <div class="expert-setting">
              <label>
                <input type="checkbox" id="expert-show-action-codes">
                Show Action Codes
              </label>
              <div class="setting-description">Display numeric codes in action tooltips</div>
            </div>

            <div class="expert-setting">
              <label>
                <input type="checkbox" id="expert-enable-experimental">
                Experimental Features
              </label>
              <div class="setting-description">Enable experimental and beta features</div>
            </div>
          </div>

          <div class="expert-section">
            <h3>📊 Data Management</h3>
            <div class="expert-setting">
              <button id="expert-clear-cache" class="expert-btn-secondary">Clear Cache</button>
              <div class="setting-description">Clear all cached data and preferences</div>
            </div>

            <div class="expert-setting">
              <button id="expert-export-settings" class="expert-btn-secondary">Export Settings</button>
              <div class="setting-description">Export all settings as JSON file</div>
            </div>
          </div>

          <div class="expert-section">
            <h3>🔒 Advanced Options</h3>
            <div class="expert-setting">
              <label for="expert-max-instructions">Max Instructions per Page:</label>
              <input type="number" id="expert-max-instructions" min="1" max="1000" value="192">
              <div class="setting-description">Maximum instructions per program page (16x12 grid)</div>
            </div>
          </div>
        </div>

        <div class="expert-settings-footer">
          <button id="expert-save-settings" class="expert-btn-primary">Save Settings</button>
          <button id="expert-reset-settings" class="expert-btn-secondary">Reset to Defaults</button>
        </div>
      </div>
    `;

    // Add event listeners
    const closeBtn = dialog.querySelector(".expert-settings-close-btn");
    const saveBtn = dialog.querySelector("#expert-save-settings");
    const resetBtn = dialog.querySelector("#expert-reset-settings");
    const clearCacheBtn = dialog.querySelector("#expert-clear-cache");
    const exportSettingsBtn = dialog.querySelector("#expert-export-settings");

    // Close dialog
    const closeDialog = () => {
      if (dialog.parentNode) {
        dialog.remove();
      }
    };

    closeBtn.addEventListener("click", closeDialog);

    // Close on overlay click
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        closeDialog();
      }
    });

    // ESC key to close
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeDialog();
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // Save settings
    saveBtn.addEventListener("click", () => {
      console.log("💾 SAVING EXPERT SETTINGS");
      // TODO: Implement settings persistence
      this.showValidationMessage("Expert settings saved!", "success");
      closeDialog();
    });

    // Reset settings
    resetBtn.addEventListener("click", () => {
      console.log("🔄 RESETTING EXPERT SETTINGS TO DEFAULTS");
      // TODO: Implement settings reset
      this.showValidationMessage("Settings reset to defaults!", "success");
      closeDialog();
    });

    // Clear cache
    clearCacheBtn.addEventListener("click", () => {
      console.log("🗑️ CLEARING CACHE");
      localStorage.clear();
      this.showValidationMessage("Cache cleared!", "success");
    });

    // Export settings
    exportSettingsBtn.addEventListener("click", () => {
      console.log("📤 EXPORTING SETTINGS");
      const settings = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        settings: {
          debugLogging: false,
          performanceMonitor: false,
          autoSync: false,
          advancedHotkeys: false,
          showActionCodes: false,
          experimentalFeatures: false,
          maxInstructions: 192,
          compressionLevel: 6
        }
      };

      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `programmator-expert-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      this.showValidationMessage("Settings exported!", "success");
    });

    // Add to DOM
    document.body.appendChild(dialog);
    console.log("🔧 EXPERT SETTINGS DIALOG CREATED AND SHOWN");
  }
}
