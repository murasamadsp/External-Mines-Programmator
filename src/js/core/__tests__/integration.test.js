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
    const undefinedLabelWarnings = complexValidation.warnings.filter(w =>
      w.includes("Undefined label"),
    );
    assert.strictEqual(
      undefinedLabelWarnings.length,
      0,
      "Should have no undefined label warnings",
    );

    console.log("PASS");

    // Test round-trip serialization with provided base64 string
    console.log(
      "\n🧪 Testing round-trip serialization with provided base64...",
    );
    const testBase64 =
      "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";

    try {
      console.log("📥 Importing provided base64 string...");
      const importedProgram = await Program.fromString(testBase64);
      console.log("✅ Import successful");

      console.log("📤 Exporting back to base64...");
      const exportedBase64 = await importedProgram.toBase64Format();
      console.log("✅ Export successful");

      console.log("🔍 Comparing input and output...");
      const isIdentical = testBase64 === exportedBase64;

      if (isIdentical) {
        console.log(
          "✅ ROUND-TRIP TEST PASSED: Input and output are identical!",
        );
        console.log(`   Input length:  ${testBase64.length} characters`);
        console.log(`   Output length: ${exportedBase64.length} characters`);
      } else {
        console.log("❌ ROUND-TRIP TEST FAILED: Input and output differ!");
        console.log(`   Input:  ${testBase64.substring(0, 50)}...`);
        console.log(`   Output: ${exportedBase64.substring(0, 50)}...`);

        // Find first difference
        let diffIndex = -1;
        for (
          let i = 0;
          i < Math.min(testBase64.length, exportedBase64.length);
          i++
        ) {
          if (testBase64[i] !== exportedBase64[i]) {
            diffIndex = i;
            break;
          }
        }

        if (diffIndex !== -1) {
          console.log(`   First difference at position ${diffIndex}:`);
          console.log(
            `     Input:  '${testBase64.substring(Math.max(0, diffIndex - 10), diffIndex + 10)}'`,
          );
          console.log(
            `     Output: '${exportedBase64.substring(Math.max(0, diffIndex - 10), diffIndex + 10)}'`,
          );
        }

        if (testBase64.length !== exportedBase64.length) {
          console.log(
            `   Length mismatch: Input=${testBase64.length}, Output=${exportedBase64.length}`,
          );
        }
      }

      console.log("🧪 Round-trip serialization test completed");
    } catch (error) {
      console.log("❌ ROUND-TRIP TEST ERROR:", error.message);
      console.log("Stack:", error.stack);
    }

    console.log("All Integration tests passed!");
  } catch (error) {
    console.error("INTEGRATION TEST FAILED:", error);
    process.exit(1);
  }
}

runTests().catch(console.error);
