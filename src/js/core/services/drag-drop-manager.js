// Drag & Drop Manager for Program Instructions
// Handles dragging instructions between cells with visual feedback
// Refactored to use Pointer Events for unified mouse/touch support

import { loggers } from "../../utils/logging/logger.js";
import { stateManager } from "./state-manager.js";
import { getActionByCode } from "../constants/actions.js";
import { GRID_WIDTH, GRID_HEIGHT, MAX_PAGES } from "../constants/grid.js";

export class DragDropManager {
  constructor(programGrid) {
    this.programGrid = programGrid;
    this.draggedInstruction = null;
    this.dragStartPosition = null;
    this.dragOverlay = null;
    this.isDragging = false;
    this.wasDragging = false;
    this.dragElement = null;

    this.init();
  }

  init() {
    this.createDragOverlay();
    this.bindEvents();
  }

  createDragOverlay() {
    this.dragOverlay = document.createElement("div");
    this.dragOverlay.className = "drag-overlay";

    // Create drag preview container
    const dragPreview = document.createElement("div");
    dragPreview.className = "drag-preview";
    this.dragOverlay.appendChild(dragPreview);

    // Create drop zones container
    const dropZones = document.createElement("div");
    dropZones.className = "drop-zones";
    this.dragOverlay.appendChild(dropZones);

    document.body.appendChild(this.dragOverlay);

    this.dragElement = this.dragOverlay.querySelector(".drag-preview");
  }

  bindEvents() {
    const grid = this.programGrid.container;

    // Unified Pointer Events
    this.boundPointerDown = (e) => this.handlePointerDown(e);
    this.boundPointerMove = (e) => this.handlePointerMove(e);
    this.boundPointerUp = (e) => this.handlePointerUp(e);
    this.boundPointerCancel = () => this.cancelDrag();
    this.boundClick = (e) => {
      if (this.wasDragging) {
        e.preventDefault();
        e.stopPropagation();
        this.wasDragging = false;
        loggers.services.debug("🚫 Click suppressed after drag");
      }
    };

    grid.addEventListener("pointerdown", this.boundPointerDown);
    document.addEventListener("pointermove", this.boundPointerMove);
    document.addEventListener("pointerup", this.boundPointerUp);
    document.addEventListener("pointercancel", this.boundPointerCancel);

    // Prevent default touch actions to allow dragging
    grid.style.touchAction = "none";

    // Suppress click event after dragging
    grid.addEventListener("click", this.boundClick, true);
  }

  handlePointerDown(e) {
    // Ignore right clicks
    if (e.button !== 0) return;

    const cell = e.target.closest(".program-cell");
    if (!cell) return;

    const position = this.getCellPosition(cell);
    if (position === null) return;

    const instruction = this.getInstructionAtPosition(position);
    if (!instruction || instruction.action === 0) return;

    // Start tracking potential drag
    this.potentialDrag = {
      instruction,
      position,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
    };

    // Capture pointer to ensure we get move/up events even outside element
    cell.setPointerCapture(e.pointerId);
  }

  handlePointerMove(e) {
    if (this.potentialDrag && !this.isDragging) {
      // Check drag threshold
      const dx = e.clientX - this.potentialDrag.startX;
      const dy = e.clientY - this.potentialDrag.startY;

      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        this.startDrag(e);
      }
    }

    if (this.isDragging) {
      e.preventDefault(); // Prevent scrolling
      this.updateDragVisuals(e.clientX, e.clientY);
      this.highlightDropZone(e.clientX, e.clientY);
    }
  }

  handlePointerUp(e) {
    if (this.isDragging) {
      this.wasDragging = true;
      this.completeDrag(e.clientX, e.clientY);

      // Reset flag after a short delay to ensure click is caught
      setTimeout(() => {
        this.wasDragging = false;
      }, 100);
    }

    this.potentialDrag = null;
    this.isDragging = false;
    this.hideDragOverlay();
  }

  startDrag(e) {
    this.isDragging = true;
    this.draggedInstruction = this.potentialDrag.instruction;
    this.dragStartPosition = this.potentialDrag.position;

    // Update state
    stateManager.setState({
      dragState: {
        isDragging: true,
        draggedInstruction: this.draggedInstruction,
        startPosition: this.dragStartPosition,
      },
    });

    // Setup visuals
    this.showDragOverlay(e.clientX, e.clientY);
    document.body.style.cursor = "grabbing";

    loggers.services.info(`🎯 Started dragging from ${this.dragStartPosition}`);
  }

  showDragOverlay(x, y) {
    this.dragOverlay.classList.add("active");

    const actionInfo = getActionByCode(this.draggedInstruction.action);
    const label = actionInfo ? actionInfo.name : "Unknown";

    this.dragElement.textContent = label;
    this.updateDragVisuals(x, y);
  }

  updateDragVisuals(x, y) {
    if (this.dragElement) {
      // Center the preview on the cursor
      this.dragElement.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  highlightDropZone(x, y) {
    // Simple hit testing using elementFromPoint
    // We temporarily hide the drag overlay so we can see what's under it
    this.dragOverlay.style.pointerEvents = "none";
    const target = document.elementFromPoint(x, y);
    this.dragOverlay.style.pointerEvents = ""; // Restore

    const cell = target?.closest(".program-cell");

    // Clear previous highlights
    this.programGrid.container
      .querySelectorAll(".drop-target")
      .forEach((el) => {
        el.classList.remove("drop-target");
      });

    if (cell) {
      cell.classList.add("drop-target");
    }
  }

  completeDrag(x, y) {
    this.dragOverlay.style.pointerEvents = "none";
    const target = document.elementFromPoint(x, y);
    this.dragOverlay.style.pointerEvents = "";

    const cell = target?.closest(".program-cell");

    if (cell) {
      const targetPosition = this.getCellPosition(cell);
      if (
        targetPosition !== null &&
        targetPosition !== this.dragStartPosition
      ) {
        this.moveInstruction(this.dragStartPosition, targetPosition);
      }
    }

    this.endDrag();
  }

  moveInstruction(from, to) {
    const { program } = this.programGrid;
    const page = this.getCurrentPage();
    const fromInst = this.getInstructionAtPosition(from);
    const toInst = this.getInstructionAtPosition(to);
    const fromCoordinates = this.positionToCoordinates(from);
    const toCoordinates = this.positionToCoordinates(to);

    // Create copies to avoid reference issues
    const fromInstCopy = new fromInst.constructor(
      fromInst.action,
      fromInst.label,
      fromInst.value,
    );
    const toInstCopy = new toInst.constructor(
      toInst.action,
      toInst.label,
      toInst.value,
    );

    // Move from -> to
    program.setInstructionAt(
      toCoordinates.x,
      toCoordinates.y,
      fromInstCopy.action,
      fromInstCopy.label,
      fromInstCopy.value,
      page,
    );

    // Move to -> from (swap) or clear from (move)
    // If toInst was None, we are just moving, so from becomes None.
    // If toInst was an action, we are swapping, so from becomes toInst.
    program.setInstructionAt(
      fromCoordinates.x,
      fromCoordinates.y,
      toInstCopy.action,
      toInstCopy.label,
      toInstCopy.value,
      page,
    );

    // Update UI
    this.programGrid.updateCell(from, program.getInstruction(from));
    this.programGrid.updateCell(to, program.getInstruction(to));

    // Update cursor to new position
    this.programGrid.setCursorPosition(to);

    loggers.services.info(`✅ Moved instruction from ${from} to ${to}`);
  }

  endDrag() {
    document.body.style.cursor = "";
    this.programGrid.container
      .querySelectorAll(".drop-target")
      .forEach((el) => {
        el.classList.remove("drop-target");
      });

    stateManager.setState({
      dragState: {
        isDragging: false,
        draggedInstruction: null,
        startPosition: null,
      },
    });
  }

  hideDragOverlay() {
    this.dragOverlay.classList.remove("active");
  }

  cancelDrag() {
    if (this.isDragging) {
      this.endDrag();
      this.hideDragOverlay();
      loggers.services.info("❌ Drag cancelled");
    }
  }

  getCellPosition(cell) {
    const x = parseInt(cell.getAttribute("data-x"));
    const y = parseInt(cell.getAttribute("data-y"));
    if (isNaN(x) || isNaN(y)) return null;
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return null;
    return y * GRID_WIDTH + x;
  }

  getCurrentPage() {
    const page = stateManager.getState("currentPage");
    return Number.isInteger(page) && page >= 0 && page < MAX_PAGES ? page : 0;
  }

  positionToCoordinates(position) {
    return {
      x: position % GRID_WIDTH,
      y: Math.floor(position / GRID_WIDTH),
    };
  }

  getInstructionAtPosition(position) {
    const { x, y } = this.positionToCoordinates(position);
    return this.programGrid.program.getInstructionAt(
      x,
      y,
      this.getCurrentPage(),
    );
  }

  destroy() {
    const grid = this.programGrid?.container;
    if (grid) {
      grid.removeEventListener("pointerdown", this.boundPointerDown);
      grid.removeEventListener("click", this.boundClick, true);
    }
    document.removeEventListener("pointermove", this.boundPointerMove);
    document.removeEventListener("pointerup", this.boundPointerUp);
    document.removeEventListener("pointercancel", this.boundPointerCancel);
    this.cancelDrag();
    this.dragOverlay?.remove();
    this.programGrid = null;
    this.dragOverlay = null;
    this.dragElement = null;
  }
}
