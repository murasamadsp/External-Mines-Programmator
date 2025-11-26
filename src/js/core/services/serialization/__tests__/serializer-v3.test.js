import assert from "assert";
import { ProgramSerializer } from "../serializer.js";
import { Instruction, ProgAction } from "../../../index.js";

console.log("Running ProgramSerializer V3 tests...");

async function runTests() {
  try {
    // Test 1: Detect V3 format
    console.log("Test 1: Detect V3 format");
    const v3Source = "$...^W...";
    assert.strictEqual(ProgramSerializer.probeFormatVersion(v3Source), 3, "Should detect V3 format");
    console.log("PASS");

    // Test 2: Decode simple V3 program
    console.log("Test 2: Decode simple V3 program");
    const source = "$^W^A^S^D";
    const instructions = ProgramSerializer.decodeV3(source);
    assert.strictEqual(instructions[0].action, ProgAction.MoveUp);
    assert.strictEqual(instructions[1].action, ProgAction.MoveLeft);
    assert.strictEqual(instructions[2].action, ProgAction.MoveDown);
    assert.strictEqual(instructions[3].action, ProgAction.MoveRight);
    console.log("PASS");

    // Test 3: Handle page skips
    console.log("Test 3: Handle page skips");
    const sourceSkip = "$^W~^S";
    const instructionsSkip = ProgramSerializer.decodeV3(sourceSkip);
    assert.strictEqual(instructionsSkip[0].action, ProgAction.MoveUp);
    // Should skip to next page (16*12 = 192 instructions)
    // Index 192 is the first instruction of the second page
    assert.strictEqual(instructionsSkip[192].action, ProgAction.MoveDown);
    console.log("PASS");

    // Test 4: Encode simple V3 program
    console.log("Test 4: Encode simple V3 program");
    const program = [
      new Instruction(ProgAction.MoveUp),
      new Instruction(ProgAction.MoveLeft),
    ];
    const encoded = ProgramSerializer.encodeV3(program);
    // Note: encodeV3 might add newlines/formatting. 
    // "$^W^A" is the minimal expectation, but it might be "$^W^A\n" or similar.
    // Let's check if it starts with correct sequence.
    assert.ok(encoded.startsWith("$^W^A"), `Encoded string '${encoded}' should start with '$^W^A'`);
    console.log("PASS");

    // Test 5: Round-trip
    console.log("Test 5: Round-trip");
    const sourceRT = "$^W^A^S^D";
    const decodedRT = ProgramSerializer.decodeV3(sourceRT);
    const encodedRT = ProgramSerializer.encodeV3(decodedRT);
    // Normalization might change it (e.g. adding newlines).
    // Let's verify the decoded instructions from the re-encoded string match original.
    const decodedAgain = ProgramSerializer.decodeV3(encodedRT);
    assert.strictEqual(decodedAgain[0].action, ProgAction.MoveUp);
    assert.strictEqual(decodedAgain[1].action, ProgAction.MoveLeft);
    assert.strictEqual(decodedAgain[2].action, ProgAction.MoveDown);
    assert.strictEqual(decodedAgain[3].action, ProgAction.MoveRight);
    console.log("PASS");

    console.log("All tests passed!");
  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exit(1);
  }
}

runTests();
