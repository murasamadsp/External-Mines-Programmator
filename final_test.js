// Final test to verify the fix
import { ProgAction } from './src/core/constants/actions.js';
import { Program } from './src/core/models/program.js';
import { formatInstruction } from './src/utils/formatters/program-formatter.js';

console.log('=== FINAL VERIFICATION ===\n');

// Test that all actions now work
const testActions = [
  'MoveUp', 'MoveLeft', 'Dig', 'BoxAll', 'InventoryUp',
  'VarCeil', 'ReadVarToState', 'SetNumberToVar'
];

console.log('Testing all previously problematic actions:');
testActions.forEach(actionName => {
  const actionCode = ProgAction[actionName];
  console.log(`${actionName}: code=${actionCode}`);

  if (actionCode !== undefined) {
    const program = new Program();
    program.setInstructionAt(0, 0, actionCode, null, null, 0);

    const retrieved = program.getInstructionAt(0, 0, 0);
    const formatted = formatInstruction(retrieved);

    console.log(`  Retrieved: ${retrieved.constructor.name} with action=${retrieved.action}`);
    console.log(`  Formatted: "${formatted.shortCode}" - "${formatted.description}"`);

    if (formatted.shortCode === '?') {
      console.log(`  ❌ STILL BROKEN!`);
    } else {
      console.log(`  ✅ FIXED!`);
    }
  } else {
    console.log(`  ❌ Action not found in ProgAction enum`);
  }
  console.log('');
});

console.log('=== TEST COMPLETE ===');
