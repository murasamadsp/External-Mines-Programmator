import { Injectable, signal, inject } from '@angular/core';
import { ProgAction } from '../models/program.model';
import { DialogService } from './dialog.service';
import { ProgramService } from './program.service';
import { getActionByCode } from '../utils/action-utils';

@Injectable({
  providedIn: 'root',
})
export class CellInteractionService {
  selectedAction = signal<ProgAction | null>(null);

  private readonly dialogService = inject(DialogService);
  private readonly programService = inject(ProgramService);

  /**
   * Set selected action
   */
  setSelectedAction(actionCode: ProgAction | null): void {
    this.selectedAction.set(actionCode);
    console.log(`🎯 Selected action: ${actionCode}`);
  }

  /**
   * Get action name by code
   */
  private getActionName(actionCode: ProgAction): string {
    if (actionCode === undefined || actionCode === null) return 'None';
    const actionInfo = getActionByCode(actionCode);
    return actionInfo ? actionInfo.name : `Unknown(${actionCode})`;
  }

  /**
   * Handle cell click
   */
  async onCellClick(x: number, y: number, currentPage: number): Promise<void> {
    console.log(`🖱️ Cell clicked: [${x}, ${y}] (page ${currentPage})`);

    const existingInstruction = this.programService.getInstructionAt(x, y, currentPage);

    // If cell has instruction - remove it (regardless of selected action)
    if (existingInstruction.action !== ProgAction.None) {
      const actionName = this.getActionName(existingInstruction.action);
      console.log(`🗑️ Removing instruction "${actionName}" from [${x}, ${y}]`);

      this.programService.setInstructionAt(
        x,
        y,
        {
          action: ProgAction.None,
          label: null,
          value: null,
        },
        currentPage,
      );

      console.log('✅ Instruction removed, cell is now empty');
      return;
    }

    // If cell is empty and action is selected - place it
    if (this.selectedAction()) {
      await this.placeActionAt(x, y, this.selectedAction()!, currentPage);
    } else {
      console.log('ℹ️ Click on empty cell without selected action - ignored');
    }
  }

  /**
   * Place action in cell with parameter handling
   */
  async placeActionAt(
    x: number,
    y: number,
    actionCode: ProgAction,
    currentPage: number,
  ): Promise<void> {
    const startTime = performance.now();
    let label: string | null = null;
    let value: string | number | null = null;

    const actionName = this.getActionName(actionCode);
    console.log(
      `🔧 Placing action ${actionCode} (${actionName}) at [${x}, ${y}] (page ${currentPage})`,
    );

    try {
      // Check if label is needed
      if (this.needsLabel(actionCode)) {
        console.log(`🏷️ Action requires label: ${this.getActionName(actionCode)}`);
        label = await this.dialogService.promptForLabel();
        if (label === null) {
          console.log('❌ Label input cancelled');
          return;
        }
        console.log(`✅ Got label: "${label}"`);
      }

      // Check if value is needed
      if (this.needsValue(actionCode)) {
        const defaultValue = this.getDefaultValueForAction(actionCode);
        console.log(
          `🔢 Action requires value: ${this.getActionName(actionCode)}, default: ${defaultValue}`,
        );
        value = await this.dialogService.promptForNumber(defaultValue);
        if (value === null) {
          console.log('❌ Value input cancelled');
          return;
        }
        console.log(`✅ Got value: ${value}`);
      }

      // Check if two labels are needed (for variable comparison)
      let label2: string | null = null;
      if (this.needsTwoLabels(actionCode)) {
        console.log(`🏷️ Action requires two labels: ${this.getActionName(actionCode)}`);
        const labels = await this.dialogService.promptForTwoLabels();
        if (labels === null) {
          console.log('❌ Labels input cancelled');
          return;
        }
        label = labels.label1;
        label2 = labels.label2;
        console.log(`✅ Got labels: "${label}" and "${label2}"`);
      }

      // Check if coordinates are needed
      if (this.needsCoordinates(actionCode)) {
        console.log(`📍 Action requires coordinates: ${this.getActionName(actionCode)}`);
        const coords = await this.dialogService.promptForCoordinates();
        if (coords === null) {
          console.log('❌ Coordinates input cancelled');
          return;
        }
        // Store coordinates as value (could be formatted as "x,y" or object)
        value = `${coords.x},${coords.y}`;
        console.log(`✅ Got coordinates: ${value}`);
      }

      // For operations with two labels, store them in format "label1:label2"
      if (label2 !== null) {
        label = `${label}:${label2}`;
        value = null; // Clear value since we're using label
      }

      // Place instruction
      this.programService.setInstructionAt(
        x,
        y,
        {
          action: actionCode,
          label,
          value: value !== null ? String(value) : null,
        },
        currentPage,
      );

      const totalTime = performance.now() - startTime;
      const details: string[] = [];
      if (label) details.push(`label: "${label}"`);
      if (value !== null && value !== undefined) details.push(`value: ${value}`);
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';

      console.log(
        `✅ Placed action "${actionName}" at [${x}, ${y}]${detailsStr} (${totalTime.toFixed(2)}ms)`,
      );
    } catch (error) {
      console.error(`❌ Error placing action ${actionName} at [${x}, ${y}]:`, error);
      throw error;
    }
  }

  /**
   * Check if action needs a label
   */
  private needsLabel(actionCode: ProgAction): boolean {
    const result = [
      ProgAction.Goto,
      ProgAction.Call,
      ProgAction.CallArg,
      ProgAction.CallState,
      ProgAction.Label,
      ProgAction.YesNoGoto,
      ProgAction.NoYesGoto,
      ProgAction.DebugPause,
      ProgAction.DebugShow,
      ProgAction.CallWhenDied,
      // Variable commands that require label for variable name
      ProgAction.WriteStateToVar,
      ProgAction.ReadVarToState,
      ProgAction.AddStateToVar,
      ProgAction.MultStateToVar,
      ProgAction.DivStateToVar,
      ProgAction.SubStateToVar,
      ProgAction.SetNumberToVar,
      ProgAction.AddNumberToVar,
      ProgAction.MultNumberToVar,
      ProgAction.DivNumberToVar,
      ProgAction.SubNumberToVar,
      ProgAction.AddVarToVar,
      ProgAction.MultVarToVar,
      ProgAction.DivVarToVar,
      ProgAction.SubVarToVar,
      ProgAction.VarLessThanState,
      ProgAction.VarGreaterThanState,
      ProgAction.VarEqualsState,
      ProgAction.VarGreaterThanOrEqualsState,
      ProgAction.VarLessThanOrEqualState,
      ProgAction.VarNotEqualsState,
      ProgAction.VarGreaterThanNumber,
      ProgAction.VarLessThanNumber,
      ProgAction.VarEqualsNumber,
      ProgAction.VarGreaterThanOrEqualNumber,
      ProgAction.VarLessThanOrEqualNumber,
      ProgAction.VarNotEqualsNumber,
    ].includes(actionCode);

    if (result) {
      console.log(`🏷️ Command ${this.getActionName(actionCode)} (${actionCode}) requires label`);
    }

    return result;
  }

  /**
   * Check if action needs two labels (for variable comparison)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private needsTwoLabels(_actionCode: ProgAction): boolean {
    // Note: Variable-to-variable comparisons might be implemented differently
    // For now, return false as these actions don't exist in current ProgAction enum
    return false;
  }

  /**
   * Check if action needs a value
   */
  private needsValue(actionCode: ProgAction): boolean {
    const result = [
      // State operation commands
      ProgAction.AddStateToVar,
      ProgAction.MultStateToVar,
      ProgAction.DivStateToVar,
      ProgAction.SubStateToVar,
      // Variable setting commands
      ProgAction.SetNumberToVar,
      ProgAction.AddNumberToVar,
      ProgAction.MultNumberToVar,
      ProgAction.DivNumberToVar,
      ProgAction.SubNumberToVar,
      // Comparison with numbers commands
      ProgAction.VarGreaterThanNumber,
      ProgAction.VarLessThanNumber,
      ProgAction.VarEqualsNumber,
      ProgAction.VarGreaterThanOrEqualNumber,
      ProgAction.VarLessThanOrEqualNumber,
      ProgAction.VarNotEqualsNumber,
      // Other commands that may require values
      ProgAction.PlaySound,
    ].includes(actionCode);

    if (result) {
      console.log(`🔢 Command ${this.getActionName(actionCode)} (${actionCode}) requires value`);
    }

    return result;
  }

  /**
   * Check if action needs coordinates
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private needsCoordinates(_actionCode: ProgAction): boolean {
    // Note: Teleport action might be implemented differently or not exist
    // Coordinates handling might be done through different mechanisms
    return false;
  }

  /**
   * Get default value for action
   */
  private getDefaultValueForAction(actionCode: ProgAction): number {
    // Return specific defaults for certain actions
    switch (actionCode) {
      case ProgAction.PlaySound:
        return 1;
      default:
        return 0;
    }
  }
}
