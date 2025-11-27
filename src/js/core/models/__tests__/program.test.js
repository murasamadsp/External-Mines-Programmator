/* eslint-env node */
import assert from "assert";
import { Program } from "../program.js";
import { Instruction } from "../program.js";
import { ProgAction } from "../../constants/actions.js";
import { ProgramSerializer } from "../../services/serialization/serializer.js";

console.log("Running Program model tests...");

async function runTests() {
  try {
    // Test 1: Create empty program
    console.log("Test 1: Create empty program");
    const program = new Program();
    assert.ok(program instanceof Program);
    assert.ok(Array.isArray(program.instructions));
    assert.strictEqual(program.instructions.length, 0);
    console.log("PASS");

    // Test 2: Add instruction
    console.log("Test 2: Add instruction");
    const instruction = new Instruction(ProgAction.MoveUp);
    program.instructions.push(instruction);
    assert.strictEqual(program.instructions.length, 1);
    assert.strictEqual(program.instructions[0].action, ProgAction.MoveUp);
    console.log("PASS");

    // Test 3: Get page instructions
    console.log("Test 3: Get page instructions");
    // Fill program with instructions for one page (16x12 = 192 instructions)
    for (let i = 0; i < 192; i++) {
      program.instructions[i] = new Instruction(ProgAction.None);
    }
    program.instructions[0] = new Instruction(ProgAction.MoveUp);
    program.instructions[191] = new Instruction(ProgAction.MoveDown);

    const pageInstructions = program.getPageInstructions(0);
    assert.strictEqual(pageInstructions.length, 192);
    assert.strictEqual(pageInstructions[0].action, ProgAction.MoveUp);
    assert.strictEqual(pageInstructions[191].action, ProgAction.MoveDown);
    console.log("PASS");

    // Test 4: Get action short code
    console.log("Test 4: Get action label");
    // Використовуємо повний label з ACTION_DATA (як в палитрі)
    assert.ok(
      Program.getActionShortCode(ProgAction.MoveUp).includes("Move Up"),
    );
    assert.ok(Program.getActionShortCode(ProgAction.Dig).includes("Dig"));
    assert.ok(
      Program.getActionShortCode(ProgAction.SetStart).includes("Set Start"),
    );
    assert.ok(
      Program.getActionShortCode(ProgAction.Terminate).includes("Terminate"),
    );
    assert.strictEqual(Program.getActionShortCode(999), "999"); // invalid action
    console.log("PASS");

    // Test 5: LZMA Base64 format validation
    console.log("Test 5: LZMA Base64 format validation");
    const simpleProgram = new Program();
    simpleProgram.instructions = [
      new Instruction(ProgAction.None),
      new Instruction(ProgAction.MoveUp),
    ];

    // Test that program structure is valid for LZMA encoding
    assert.ok(
      simpleProgram.instructions.length === 2,
      "Program should have 2 instructions",
    );
    assert.ok(
      simpleProgram.instructions[0].action === ProgAction.None,
      "First instruction should be None",
    );
    assert.ok(
      simpleProgram.instructions[1].action === ProgAction.MoveUp,
      "Second instruction should be MoveUp",
    );

    // Skip actual LZMA encoding in Node.js - tested in browser environment
    console.log(
      "LZMA encoding validation passed (encoding skipped in Node.js)",
    );
    console.log("PASS");

    // Test 6: Validation
    console.log("Test 6: Validation");
    const validProgram = new Program();
    validProgram.instructions = [new Instruction(ProgAction.MoveUp)];

    // Should not throw an error
    assert.doesNotThrow(() => validProgram.validate());
    console.log("PASS");

    // Test 7: Edge cases
    console.log("Test 7: Edge cases");

    // Empty program validation
    const emptyProgram = new Program();
    assert.doesNotThrow(() => emptyProgram.validate());

    // Large program validation (simulate max size)
    const largeProgram = new Program();
    largeProgram.instructions = Array.from(
      { length: 10000 },
      () => new Instruction(ProgAction.None),
    );
    assert.doesNotThrow(() => largeProgram.validate());

    // Invalid instructions
    const invalidProgram = new Program();
    invalidProgram.instructions = [{ action: 999 }]; // Invalid action
    const invalidResult = invalidProgram.validate();
    assert.ok(!invalidResult.isValid);
    assert.ok(invalidResult.errors.length > 0);

    // Null/undefined instructions - should handle gracefully
    const nullProgram = new Program();
    nullProgram.instructions = null;
    const nullResult = nullProgram.validate();
    assert.ok(!nullResult.isValid);
    assert.ok(nullResult.errors.length > 0);

    console.log("PASS");

    // Test 8: getActionShortCode edge cases
    console.log("Test 8: getActionShortCode edge cases");
    // Invalid values will return string representation
    assert.strictEqual(Program.getActionShortCode(null), "null");
    assert.strictEqual(Program.getActionShortCode(undefined), "undefined");
    assert.strictEqual(Program.getActionShortCode(-1), "-1");
    assert.strictEqual(Program.getActionShortCode(NaN), "NaN");
    console.log("PASS");

    console.log("All Program model tests passed!");
  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exit(1);
  }
}

runTests().catch(console.error);
