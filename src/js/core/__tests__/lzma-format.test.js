import assert from "assert";
import { Program } from "../models/program.js";
import { ProgAction } from "../constants/actions.js";

console.log("Testing LZMA Base64 format...");

async function runTests() {
  try {
    // Test 1: Simple program with one instruction
    console.log("Test 1: Simple program serialization");
    const program = new Program();
    program.setInstructionAt(0, 0, ProgAction.SetStart, null, null, 0);

    const serialized = await program.toBase64Format();
    console.log("Serialized:", serialized.substring(0, 50) + "...");

    const deserializedProgram = await Program.fromString(serialized);
    console.log(
      "Deserialized instructions count:",
      deserializedProgram.instructions.length,
    );
    console.log(
      "First instruction action:",
      deserializedProgram.instructions[0]?.action,
    );
    console.log(
      "First instruction label:",
      deserializedProgram.instructions[0]?.label,
    );

    // Test 2: Check if action is correct
    assert.strictEqual(
      deserializedProgram.instructions[0]?.action,
      ProgAction.SetStart,
    );
    console.log("✅ Action matches");

    // Test 3: Program with label and value
    console.log("Test 3: Program with label and value");
    const program2 = new Program();
    program2.setInstructionAt(0, 0, ProgAction.Label, "test", 42, 0);

    const serialized2 = await program2.toBase64Format();
    console.log("Serialized with label:", serialized2.substring(0, 50) + "...");

    const deserializedProgram2 = await Program.fromString(serialized2);
    console.log(
      "Deserialized label:",
      deserializedProgram2.instructions[0]?.label,
    );
    console.log(
      "Deserialized value:",
      deserializedProgram2.instructions[0]?.value,
    );

    // Note: C# DecodeV2 uses ToUpper() on labels, so "test" becomes "TEST"
    assert.strictEqual(deserializedProgram2.instructions[0]?.label, "TEST");
    assert.strictEqual(deserializedProgram2.instructions[0]?.value, 42);
    console.log("✅ Label and value match");

    console.log("All LZMA format tests passed!");
  } catch (error) {
    console.error("❌ LZMA format test failed:", error.message);
    throw error;
  }
}

runTests();
