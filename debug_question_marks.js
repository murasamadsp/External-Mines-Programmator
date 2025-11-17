// Debug script to understand the question marks issue
import { ProgAction } from './src/core/constants/actions.js';
import { formatInstruction } from './src/utils/formatters/program-formatter.js';

// Test some actions
console.log("Testing ProgAction enum:");
console.log("MoveUp:", ProgAction.MoveUp);
console.log("MoveUp type:", typeof ProgAction.MoveUp);
console.log("ProgAction['MoveUp']:", ProgAction['MoveUp']);

// Test formatInstruction with valid instruction
const validInstruction = { action: ProgAction.MoveUp, label: null, value: null };
console.log("\nTesting formatInstruction with valid instruction:");
const result = formatInstruction(validInstruction);
console.log("Result:", result);

// Test formatInstruction with invalid instruction
const invalidInstruction = { action: null, label: null, value: null };
console.log("\nTesting formatInstruction with invalid instruction:");
const invalidResult = formatInstruction(invalidInstruction);
console.log("Invalid result:", invalidResult);

// Test formatInstruction with undefined action
const undefinedInstruction = { action: undefined, label: null, value: null };
console.log("\nTesting formatInstruction with undefined action:");
const undefinedResult = formatInstruction(undefinedInstruction);
console.log("Undefined result:", undefinedResult);

// Get all actions from palette
const allPaletteActions = [
  'AddNumberToVar', 'AddVarToVar', 'BooleanAND', 'BooleanOR', 'BoxAll', 'BoxBlue', 'BoxCyan',
  'BoxGreen', 'BoxHalf', 'BoxRed', 'BoxViolet', 'BoxWhite', 'BuildBlock', 'BuildQuadro',
  'BuildRoad', 'BuildWar', 'Call', 'CallArg', 'CallState', 'CallWhenDied', 'Cell', 'CellDown',
  'CellDownLeft', 'CellDownRight', 'CellForward', 'CellLeft', 'CellLefthand', 'CellRight',
  'CellRighthand', 'CellUp', 'CellUpLeft', 'CellUpRight', 'ChargeGun', 'DebugPause', 'DebugShow',
  'Dig', 'DisableAggression', 'DisableAutoDig', 'DisableHand', 'DivNumberToVar', 'DivVarToVar',
  'EnableAggression', 'EnableAutoDig', 'EnableHand', 'Flip', 'Goto', 'Heal', 'InventoryDown',
  'InventoryLeft', 'InventoryRight', 'InventoryUp', 'IsAcid', 'IsAcidRock', 'IsAliveCrystal',
  'IsBasketFull', 'IsBlackAlive', 'IsBlackRock', 'IsBlueAlive', 'IsBoulder', 'IsBox',
  'IsBreakable', 'IsCrystal', 'IsCyanAlive', 'IsEmpty', 'IsFalling', 'IsFallingLikeBoulder',
  'IsFallingLikeLiquid', 'IsGeoFull', 'IsGreenBlock', 'IsHealthLessThanHalf', 'IsHealthNotFull',
  'IsInsideGun', 'IsLava', 'IsNotEmpty', 'IsQuadro', 'IsRainbowAlive', 'IsRedAlive', 'IsRedBlock',
  'IsRedRock', 'IsRoad', 'IsSand', 'IsStructure', 'IsUnbreakable', 'IsVioletAlive', 'IsWhiteAlive',
  'IsYellowBlock', 'Label', 'MoveDown', 'MoveForward', 'MoveLeft', 'MoveRight', 'MoveUp',
  'MultNumberToVar', 'MultVarToVar', 'NextLine', 'NoYesGoto', 'NoYesGotoStart', 'NoYesNextRow',
  'NoYesTerminate', 'PlaySound', 'ReadVarToState', 'RefillCraft', 'RepeatLastAction', 'Return',
  'ReturnArg', 'ReturnState', 'RotateDown', 'RotateLeft', 'RotateLefthand', 'RotateRandom',
  'RotateRight', 'RotateRighthand', 'RotateUp', 'STDBlock', 'STDDig', 'STDHeal', 'STDTunnel',
  'SetNumberToVar', 'SetStart', 'SetStartWhenBotNearby', 'SetStartWhenDied', 'SetStartWhenHurt',
  'ShiftDown', 'ShiftForward', 'ShiftLeft', 'ShiftRight', 'ShiftUp', 'SubNumberToVar',
  'SubVarToVar', 'Terminate', 'Upgrade', 'UseBoom', 'UseC190', 'UseGeo', 'UseGeopack',
  'UseNano', 'UsePoly', 'UseProt', 'UseRaz', 'UseRem', 'UseZZ', 'VarCeil', 'VarEqualsNumber',
  'VarEqualsState', 'VarFloor', 'VarGreaterThanNumber', 'VarGreaterThanOrEqualNumber',
  'VarGreaterThanOrEqualsState', 'VarGreaterThanState', 'VarLessThanNumber',
  'VarLessThanOrEqualNumber', 'VarLessThanOrEqualState', 'VarLessThanState', 'VarNotEqualsNumber',
  'VarNotEqualsState', 'VarRound', 'WriteStateToVar', 'YesNoGoto', 'YesNoGotoStart',
  'YesNoNextRow', 'YesNoTerminate'
];

// Test some actions from palette
const testActions = ['MoveUp', 'MoveLeft', 'Dig', 'BoxAll', 'InventoryUp', 'VarCeil', 'VarFloor', 'ReadVarToState'];

console.log("\nTesting actions from palette:");
testActions.forEach(actionName => {
  const actionCode = ProgAction[actionName];
  console.log(`${actionName}: code=${actionCode}, type=${typeof actionCode}`);

  if (actionCode !== undefined) {
    const testInst = { action: actionCode, label: null, value: null };
    const fmt = formatInstruction(testInst);
    console.log(`  Formatted: "${fmt.shortCode}" - "${fmt.description}"`);
  } else {
    console.log(`  ERROR: Action ${actionName} not found in ProgAction enum!`);
  }
});
