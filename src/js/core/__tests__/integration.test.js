/* eslint-env node */
import assert from "assert";
import { Program } from "../models/program.js";
import { ProgAction } from "../constants/actions.js";
import { PAGE_SIZE } from "../constants/grid.js";
import { ProgramSerializer } from "../services/serialization/serializer.js";

console.log("Running Integration tests...");

async function runTests() {
  try {
    // Integration Test 1: Full program lifecycle
    console.log("Integration Test 1: Full program lifecycle");

    // Create program with multiple instructions
    const program = new Program();
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Label, "m1");
    program.addInstruction(ProgAction.Dig);
    program.addInstruction(ProgAction.Goto, "m1");

    // Validate program
    const validation = program.validate();
    console.log("Validation result:", validation);
    assert.ok(
      validation.isValid,
      `Program should be valid. Errors: ${validation.errors.join(", ")}`,
    );

    // Test that program can be validated (LZMA encoding/decoding requires browser environment)
    // Just test the validation and structure
    assert.ok(
      program.instructions.length > 0,
      "Program should have instructions",
    );
    assert.ok(
      program.instructions[0].action !== undefined,
      "Instructions should have actions",
    );

    // Test LZMA serialization (now works in Node.js too)
    console.log("Testing LZMA serialization...");
    const serialized = await program.toBase64Format();
    console.log("Serialized program:", serialized.substring(0, 50) + "...");

    const deserializedProgram = await Program.fromString(serialized);
    const deserializedInstructions = deserializedProgram.instructions;
    assert.ok(
      Array.isArray(deserializedInstructions),
      "Deserialization should return array",
    );
    assert.strictEqual(
      deserializedInstructions.length,
      PAGE_SIZE,
      "Deserialized program should be padded to PAGE_SIZE",
    );

    // Verify basic deserialization worked
    assert.ok(
      deserializedProgram instanceof Program,
      "Should deserialize to Program instance",
    );
    assert.ok(
      deserializedInstructions.length >= PAGE_SIZE,
      "Should have at least PAGE_SIZE instructions",
    );

    console.log("PASS");

    // Integration Test 2: Complex program with labels and jumps
    console.log("Integration Test 2: Complex program with labels and jumps");

    const complexProgram = new Program();
    complexProgram.addInstruction(ProgAction.SetStart);
    complexProgram.addInstruction(ProgAction.Label, "STA");
    complexProgram.addInstruction(ProgAction.MoveUp);
    complexProgram.addInstruction(ProgAction.IsEmpty);
    complexProgram.addInstruction(ProgAction.YesNoGoto, "M1");
    complexProgram.addInstruction(ProgAction.MoveDown);
    complexProgram.addInstruction(ProgAction.Goto, "STA");
    complexProgram.addInstruction(ProgAction.Label, "M1");
    complexProgram.addInstruction(ProgAction.Dig);
    complexProgram.addInstruction(ProgAction.Goto, "STA");

    // Validate complex program
    const complexValidation = complexProgram.validate();
    console.log("Complex validation result:", complexValidation);
    assert.ok(
      complexValidation.isValid,
      `Complex program should be valid. Errors: ${complexValidation.errors.join(", ")}`,
    );

    // Should have no undefined label warnings
    const undefinedLabelWarnings = complexValidation.warnings.filter((w) =>
      w.includes("Undefined label"),
    );
    assert.strictEqual(
      undefinedLabelWarnings.length,
      0,
      "Should have no undefined label warnings",
    );

    console.log("PASS");

    console.log("All Integration tests passed!");
  } catch (error) {
    console.error("INTEGRATION TEST FAILED:", error);
    process.exit(1);
  }
}

runTests().catch(console.error);
