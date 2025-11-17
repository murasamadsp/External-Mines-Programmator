// Debug MultNumberToVar specifically
import { ProgAction } from './src/core/constants/actions.js';
import { Program, Instruction } from './src/core/models/program.js';
import { formatInstruction, getActionShortCode } from './src/utils/formatters/program-formatter.js';

console.log('=== DEBUGGING MultNumberToVar ===\n');

// Test MultNumberToVar specifically
console.log('1. Testing MultNumberToVar access:');
console.log('ProgAction.MultNumberToVar:', ProgAction.MultNumberToVar);
console.log('Type:', typeof ProgAction.MultNumberToVar);

// Test creating instruction
console.log('\n2. Creating instruction:');
const actionCode = ProgAction.MultNumberToVar;
const instruction = new Instruction(actionCode, null, null);
console.log('Instruction:', instruction);
console.log('instruction.action:', instruction.action);

// Test formatting
console.log('\n3. Testing formatInstruction:');
const formatted = formatInstruction(instruction);
console.log('Formatted result:', formatted);

// Test getActionShortCode
console.log('\n4. Testing getActionShortCode:');
const shortCode = getActionShortCode(actionCode);
console.log('Short code:', `"${shortCode}"`);

// Test with value
console.log('\n5. Testing with value:');
const instructionWithValue = new Instruction(actionCode, null, 42);
console.log('Instruction with value:', instructionWithValue);
const formattedWithValue = formatInstruction(instructionWithValue);
console.log('Formatted with value:', formattedWithValue);

// Test range check
console.log('\n6. Testing range check:');
const startRange = ProgAction.SetNumberToVar;
const endRange = ProgAction.SubNumberToVar;
console.log(`SetNumberToVar (${startRange}) <= MultNumberToVar (${actionCode}) <= SubNumberToVar (${endRange}):`);
console.log(`${startRange} <= ${actionCode} <= ${endRange} = ${startRange <= actionCode && actionCode <= endRange}`);

// Test Program operations
console.log('\n7. Testing Program operations:');
const program = new Program();
program.setInstructionAt(0, 0, actionCode, null, 42, 0);
const retrieved = program.getInstructionAt(0, 0, 0);
console.log('Retrieved instruction:', retrieved);
const finalFormatted = formatInstruction(retrieved);
console.log('Final formatted:', finalFormatted);

console.log('\n=== DEBUG COMPLETE ===');
