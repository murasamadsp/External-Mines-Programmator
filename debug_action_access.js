// Debug action access
import { ProgAction } from './src/core/constants/actions.js';

console.log('=== DEBUGGING ACTION ACCESS ===\n');

// Test direct access
console.log('Direct access:');
console.log('ProgAction.MultNumberToVar:', ProgAction.MultNumberToVar);

// Test string access
console.log('\nString access:');
console.log('ProgAction["MultNumberToVar"]:', ProgAction['MultNumberToVar']);

// Test all actions from palette that require values
const valueActions = [
  'SetNumberToVar', 'AddNumberToVar', 'MultNumberToVar', 'DivNumberToVar', 'SubNumberToVar',
  'VarGreaterThanNumber', 'VarLessThanNumber', 'VarEqualsNumber',
  'VarGreaterThanOrEqualNumber', 'VarLessThanOrEqualNumber', 'VarNotEqualsNumber'
];

console.log('\nTesting value-requiring actions:');
valueActions.forEach(actionName => {
  const direct = ProgAction[actionName];
  const expectedCode = ProgAction[actionName];

  console.log(`${actionName}:`);
  console.log(`  Direct access: ${direct}`);
  console.log(`  Type: ${typeof direct}`);

  if (direct === undefined) {
    console.log(`  ❌ PROBLEM: ${actionName} is undefined!`);
  } else {
    console.log(`  ✅ OK: ${actionName} = ${direct}`);
  }
  console.log('');
});

// Test the range checks
console.log('\nTesting range checks:');
const testAction = 'MultNumberToVar';
const actionCode = ProgAction[testAction];
console.log(`${testAction} code: ${actionCode}`);

console.log('Range checks:');
console.log(`SetNumberToVar (${ProgAction.SetNumberToVar}) <= ${actionCode} <= SubNumberToVar (${ProgAction.SubNumberToVar}):`, ProgAction.SetNumberToVar <= actionCode && actionCode <= ProgAction.SubNumberToVar);

console.log('\n=== DEBUG COMPLETE ===');
