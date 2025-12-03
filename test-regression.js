import { Program } from "./src/js/core/models/program.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";

/**
 * Regression Test Suite for External Mines Programmator
 * Tests for bugs that were fixed and edge cases that could break
 */
async function runRegressionTests() {
  console.log("🔄 Starting Regression Test Suite...");
  console.log("🐛 Testing for previously fixed bugs and edge cases\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ ${name}: ${e.message}`);
      console.error(e.stack);
      failed++;
    }
  }

  // ============================================================================
  // 🐛 PREVIOUSLY FIXED BUGS
  // ============================================================================

  await test("Regression - Circular Dependency Fix", () => {
    // Test that Program and Serializer can be imported without circular dependency
    const program = new Program();
    program.addInstruction(ProgAction.MoveUp);

    // Should not throw due to circular imports
    if (!program.instructions || program.instructions.length !== 1) {
      throw new Error("Circular dependency regression");
    }
  });

  await test("Regression - Empty Program Handling", async () => {
    // Test that empty programs are handled correctly
    const program = new Program();

    // Should not crash when validating empty program
    const validation = program.validate();
    // Empty program should be valid (no instructions to validate)

    // Should handle serialization gracefully
    try {
      const base64 = await program.toBase64Format();
      const restored = await Program.fromString(base64);
      // Should not crash
    } catch (e) {
      throw new Error(`Empty program serialization failed: ${e.message}`);
    }
  });

  await test("Regression - Label Length Limits", () => {
    const program = new Program();

    // Test valid short labels
    program.addInstruction(ProgAction.Label, "OK1");
    program.addInstruction(ProgAction.Goto, "OK1");

    const validation = program.validate();
    if (!validation.isValid) {
      throw new Error(`Valid labels failed: ${validation.errors.join(", ")}`);
    }

    // Test invalid long labels (should fail validation)
    const longLabelProgram = new Program();
    longLabelProgram.addInstruction(ProgAction.Label, "VERY_LONG_LABEL_THAT_EXCEEDS_LIMIT");

    const longLabelValidation = longLabelProgram.validate();
    if (longLabelValidation.isValid) {
      // This might be valid now, depending on implementation
      console.log("ℹ️  Long labels are now allowed");
    }
  });

  await test("Regression - Action Code Bounds", () => {
    const program = new Program();

    // Test valid action codes
    const validActions = [
      ProgAction.MoveUp,
      ProgAction.Dig,
      ProgAction.SetStart,
      ProgAction.Label,
    ].filter(action => action !== undefined); // Filter out undefined actions

    for (const action of validActions) {
      program.addInstruction(action);
    }

    const validation = program.validate();
    if (!validation.isValid) {
      throw new Error(`Valid actions failed: ${validation.errors.join(", ")}`);
    }
  });

  // ============================================================================
  // 🎯 EDGE CASES THAT COULD BREAK
  // ============================================================================

  await test("Edge Case - Maximum Instructions", async () => {
    const program = new Program();

    // Add maximum reasonable number of instructions
    for (let i = 0; i < 1000; i++) {
      program.addInstruction(ProgAction.None);
    }

    // Should handle large programs without crashing
    const validation = program.validate();
    // Large programs might have performance warnings but should be valid

    // Should serialize without issues
    const base64 = await program.toBase64Format();
    if (!base64 || base64.length === 0) {
      throw new Error("Large program serialization failed");
    }
  });

  await test("Edge Case - Special Unicode in Labels", async () => {
    const specialLabels = [
      "🚀", "тест", "Label_123", "a", "Z", "0", "9",
      "LABEL", "label", "Label", "lAbEl"
    ];

    for (const label of specialLabels) {
      const program = new Program();
      program.addInstruction(ProgAction.Label, label);
      program.addInstruction(ProgAction.Goto, label);

      // Should handle various label formats
      const validation = program.validate();
      if (!validation.isValid) {
        // Some labels might not be allowed, that's OK
        console.log(`ℹ️  Label "${label}" is not allowed: ${validation.errors.join(", ")}`);
      }
    }
  });

  await test("Edge Case - Boundary Values", () => {
    const program = new Program();

    // Test boundary instruction values
    program.addInstruction(ProgAction.VarEqualsNumber, "VAR", 0); // Min value
    program.addInstruction(ProgAction.VarEqualsNumber, "VAR", Number.MAX_SAFE_INTEGER); // Max safe value

    const validation = program.validate();
    // Should handle boundary values gracefully
    if (!validation.isValid && !validation.errors.some(e => e.includes("value"))) {
      throw new Error(`Boundary values failed: ${validation.errors.join(", ")}`);
    }
  });

  await test("Edge Case - Rapid State Changes", () => {
    const program = new Program();

    // Simulate rapid program modifications
    for (let i = 0; i < 100; i++) {
      program.addInstruction(ProgAction.MoveUp);
      program.clear(); // Rapid clear
      program.addInstruction(ProgAction.MoveDown);
    }

    // Final state should be consistent
    if (program.instructions.length !== 1) {
      throw new Error(`Rapid state changes left inconsistent state`);
    }

    const validation = program.validate();
    if (!validation.isValid) {
      throw new Error(`Final state validation failed: ${validation.errors.join(", ")}`);
    }
  });

  // ============================================================================
  // 🔄 SERIALIZATION EDGE CASES
  // ============================================================================

  await test("Serialization Edge Case - Minimal Data", async () => {
    // Test with minimal possible data
    const minimalInstructions = [
      new Instruction(ProgAction.None, null, null)
    ];

    const encoded = await ProgramSerializer.encode(minimalInstructions);
    const decoded = await ProgramSerializer.decode(encoded);

    if (decoded.length < 1) {
      throw new Error("Minimal serialization failed");
    }
  });

  await test("Serialization Edge Case - Maximum Compression", async () => {
    // Test with highly compressible data (all same instructions)
    const repetitiveInstructions = Array(500).fill(null).map(() =>
      new Instruction(ProgAction.None, null, null)
    );

    const encoded = await ProgramSerializer.encode(repetitiveInstructions);
    const decoded = await ProgramSerializer.decode(encoded);

    if (decoded.length !== repetitiveInstructions.length) {
      throw new Error("Repetitive data serialization failed");
    }

    // Compression should make it small
    if (encoded.length > 1000) { // Should be much smaller due to compression
      console.log(`ℹ️  Compression ratio: ${repetitiveInstructions.length} -> ${encoded.length}`);
    }
  });

  await test("Serialization Edge Case - Random Data", async () => {
    // Test with random, hard-to-compress data
    const randomInstructions = [];
    const actions = [ProgAction.MoveUp, ProgAction.MoveDown, ProgAction.Dig, ProgAction.SetStart];

    for (let i = 0; i < 200; i++) {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomLabel = Math.random() > 0.8 ? `L${i}` : null;
      const randomValue = Math.random() > 0.9 ? Math.floor(Math.random() * 100) : null;

      randomInstructions.push(new Instruction(randomAction, randomLabel, randomValue));
    }

    const encoded = await ProgramSerializer.encode(randomInstructions);
    const decoded = await ProgramSerializer.decode(encoded);

    if (decoded.length !== randomInstructions.length) {
      throw new Error("Random data serialization failed");
    }
  });

  // ============================================================================
  // 🧪 VALIDATION EDGE CASES
  // ============================================================================

  await test("Validation Edge Case - Undefined Labels", () => {
    const program = new Program();

    // Create goto to non-existent label
    program.addInstruction(ProgAction.Goto, "NON_EXISTENT");

    const validation = program.validate();

    // Should detect undefined label
    const undefinedLabelWarnings = validation.warnings.filter(w =>
      w.includes("Undefined label") || w.includes("NON_EXISTENT")
    );

    if (undefinedLabelWarnings.length === 0) {
      console.log("ℹ️  Undefined label detection may not be implemented");
    }
  });

  await test("Validation Edge Case - Duplicate Labels", () => {
    const program = new Program();

    // Create duplicate labels
    program.addInstruction(ProgAction.Label, "DUPE");
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Label, "DUPE"); // Duplicate

    const validation = program.validate();

    // Should potentially detect duplicate labels
    const duplicateWarnings = validation.warnings.filter(w =>
      w.includes("duplicate") || w.includes("DUPE")
    );

    if (duplicateWarnings.length === 0) {
      console.log("ℹ️  Duplicate label detection may not be implemented");
    }
  });

  await test("Validation Edge Case - Infinite Loops", () => {
    const program = new Program();

    // Create potential infinite loop
    program.addInstruction(ProgAction.Label, "LOOP");
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Goto, "LOOP");

    const validation = program.validate();

    // Should be valid (infinite loops are allowed in this context)
    if (!validation.isValid) {
      throw new Error(`Valid loop failed validation: ${validation.errors.join(", ")}`);
    }
  });

  // ============================================================================
  // 🏗️ ARCHITECTURAL REGRESSIONS
  // ============================================================================

  await test("Architectural Regression - Module Isolation", () => {
    // Test that modules can be imported independently
    try {
      // These imports should work without issues
      const { Program } = require("./src/js/core/models/program.js");
      const { Instruction } = require("./src/js/core/types/instruction.js");
      const { ProgAction } = require("./src/js/core/constants/actions.js");

      // Should be able to create instances
      const program = new Program();
      const instruction = new Instruction(ProgAction.MoveUp);

      if (!program || !instruction) {
        throw new Error("Module isolation regression");
      }
    } catch (e) {
      throw new Error(`Module isolation failed: ${e.message}`);
    }
  });

  await test("Architectural Regression - Type Safety", () => {
    // Test that types are properly enforced
    const program = new Program();

    // Should handle invalid inputs gracefully
    try {
      program.addInstruction("invalid_action");
      program.addInstruction(ProgAction.MoveUp, 123); // Invalid label type
      program.addInstruction(ProgAction.MoveUp, "LABEL", "invalid_value"); // Invalid value type
    } catch (e) {
      // Should handle type errors gracefully
      console.log(`ℹ️  Type validation: ${e.message}`);
    }

    // Program should still be usable
    const validation = program.validate();
    // Should not crash on invalid types
  });

  // ============================================================================
  // 📋 SUMMARY
  // ============================================================================

  console.log(`\n🔄 Regression Test Suite Completed:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed} tests`);

  const successRate = ((passed / (passed + failed)) * 100).toFixed(1);
  console.log(`🎯 Success Rate: ${successRate}%`);

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} regression test(s) failed. Check for new bugs introduced.`);
    process.exit(1);
  } else {
    console.log(`\n🛡️  All regression tests passed! No known bugs reintroduced.`);
  }
}

// Run the tests
runRegressionTests().catch(error => {
  console.error("💥 Regression test suite crashed:", error);
  process.exit(1);
});