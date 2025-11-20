// Simple test for Base64 v3 format implementation
import { ProgramSerializer, Instruction, ProgAction } from './src/core/index.js';

// Create a simple program with a few instructions
const instructions = [
  new Instruction(ProgAction.SetStart, null, null),
  new Instruction(ProgAction.MoveForward, null, null),
  new Instruction(ProgAction.Dig, null, null),
  new Instruction(ProgAction.Label, "ABC", null),
  new Instruction(ProgAction.Goto, "ABC", null),
];

console.log('Original instructions:', instructions);

// Encode to Base64 v3 format
(async () => {
try {
    const encoded = await ProgramSerializer.encode(instructions);
  console.log('Encoded Base64:', encoded);

  // Decode back
    const decoded = await ProgramSerializer.decode(encoded);
  console.log('Decoded instructions:', decoded);

  // Check if they match (null labels should become '0')
  const match = instructions.length === decoded.length &&
    instructions.every((inst, i) =>
      inst.action === decoded[i].action &&
      (inst.label || '0') === decoded[i].label &&
      inst.value === decoded[i].value
    );

  console.log('Round-trip successful:', match);

} catch (error) {
  console.error('Test failed:', error);
}
})();
