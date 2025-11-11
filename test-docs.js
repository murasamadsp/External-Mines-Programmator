// Test with documentation example
const testBase64 = 'HQAAgAAIAAAAAAAAAAAFADjkobuzFSSNTOK60BytPRuvcpEnjdjhMd/+KkQA';

console.log('Testing documentation Base64:', testBase64);

// According to documentation:
// After LZMA decompression: [14, 135, 43, 139, 157, 43, 139, 15, 24, 10, 16]
// Labels: 0:0:0:0:0:0:RGT:0:0:RGT:0

const expectedActions = [14, 135, 43, 139, 157, 43, 139, 15, 24, 10, 16];
const expectedLabels = ['0', '0', '0', '0', '0', '0', 'RGT', '0', '0', 'RGT', '0'];

console.log('Expected actions:', expectedActions);
console.log('Expected labels:', expectedLabels);

// Create the correct data structure manually
// Structure: length(4 bytes LE) + actions + labels(ASCII)
const labelsStr = expectedLabels.join(':');
const manualData = new Uint8Array(4 + expectedActions.length + labelsStr.length);

// Write length (LE) - number of instructions
manualData[0] = expectedActions.length & 0xFF;
manualData[1] = (expectedActions.length >> 8) & 0xFF;
manualData[2] = (expectedActions.length >> 16) & 0xFF;
manualData[3] = (expectedActions.length >> 24) & 0xFF;

// Write actions
for (let i = 0; i < expectedActions.length; i++) {
  manualData[4 + i] = expectedActions[i];
}

// Write labels
for (let i = 0; i < labelsStr.length; i++) {
  manualData[4 + expectedActions.length + i] = labelsStr.charCodeAt(i);
}

console.log('Manually constructed data:', Array.from(manualData));
const correctBase64 = btoa(String.fromCharCode.apply(null, manualData));
console.log('Correct Base64 should be:', correctBase64);

// Test our serializer with the manually constructed data
import { ProgramSerializer, Instruction } from './src/core/index.js';

(async () => {
  try {
    console.log('\n--- Testing with manually constructed data ---');
    const decoded = await ProgramSerializer.decode(correctBase64);
    console.log('Decoded instructions:');
    decoded.forEach((inst, i) => {
      console.log(`  ${i}: action=${inst.action}, label=${inst.label}`);
    });

    const actionsMatch = decoded.length === expectedActions.length &&
      decoded.every((inst, i) => inst.action === expectedActions[i]);
    const labelsMatch = decoded.length === expectedLabels.length &&
      decoded.every((inst, i) => (inst.label || '0') === expectedLabels[i]);

    console.log('Actions match:', actionsMatch);
    console.log('Labels match:', labelsMatch);

    if (actionsMatch && labelsMatch) {
      console.log('✅ Manual test PASSED');
    } else {
      console.log('❌ Manual test FAILED');
    }
  } catch (e) {
    console.error('Manual test error:', e);
  }
})();
