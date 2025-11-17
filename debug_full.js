// Full debug script for question marks issue
import { ProgAction } from './src/core/constants/actions.js';
import { Program, Instruction } from './src/core/models/program.js';
import { formatInstruction, getActionShortCode } from './src/utils/formatters/program-formatter.js';

console.log('=== FULL DEBUG SESSION ===\n');

// Test 1: Check if ProgAction is loaded correctly
console.log('1. Testing ProgAction enum:');
console.log('ProgAction available:', !!ProgAction);
console.log('ProgAction.None:', ProgAction.None);
console.log('ProgAction.MoveUp:', ProgAction.MoveUp);
console.log('ProgAction["MoveUp"]:', ProgAction['MoveUp']);
console.log('typeof ProgAction.MoveUp:', typeof ProgAction.MoveUp);

// Test 2: Test Instruction creation
console.log('\n2. Testing Instruction creation:');
const testInstruction = new Instruction(ProgAction.MoveUp, null, null);
console.log('Created instruction:', testInstruction);
console.log('instruction.action:', testInstruction.action);
console.log('instruction.action type:', typeof testInstruction.action);

// Test 3: Test getActionShortCode directly
console.log('\n3. Testing getActionShortCode directly:');
const shortCode = getActionShortCode(ProgAction.MoveUp);
console.log('getActionShortCode result:', `"${shortCode}"`);

// Test 4: Test formatInstruction directly
console.log('\n4. Testing formatInstruction directly:');
const formatted = formatInstruction(testInstruction);
console.log('formatInstruction result:', formatted);

// Test 5: Test Program operations
console.log('\n5. Testing Program operations:');
const program = new Program();
console.log('Created program, instructions length:', program.instructions.length);

program.setInstructionAt(0, 0, ProgAction.MoveUp, null, null, 0);
console.log('After setInstructionAt, instructions length:', program.instructions.length);

const retrieved = program.getInstructionAt(0, 0, 0);
console.log('Retrieved instruction:', retrieved);
console.log('retrieved.action:', retrieved.action);

// Test 6: Full cycle
console.log('\n6. Full cycle test:');
const fullFormatted = formatInstruction(retrieved);
console.log('Full cycle formatInstruction result:', fullFormatted);

// Test 7: Test with different actions
console.log('\n7. Testing different actions:');
const testActions = [
  'MoveUp', 'MoveLeft', 'Dig', 'BoxAll', 'InventoryUp', 'VarCeil', 'ReadVarToState'
];

testActions.forEach(actionName => {
  const actionCode = ProgAction[actionName];
  console.log(`\nTesting ${actionName}:`);
  console.log(`  Code: ${actionCode}`);

  if (actionCode !== undefined) {
    const inst = new Instruction(actionCode, null, null);
    const fmt = formatInstruction(inst);
    console.log(`  Formatted: "${fmt.shortCode}" - "${fmt.description}"`);
  } else {
    console.log(`  ERROR: ${actionName} not found in ProgAction!`);
  }
});

console.log('\n=== DEBUG SESSION COMPLETE ===');
