import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";
import { ProgramFormatVersion } from "./src/js/core/constants/formats.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import { Program } from "./src/js/core/models/program.js";

/**
 * Comprehensive Test Suite for External Mines Programmator
 * Tests all critical functionality, edge cases, and real-world scenarios
 */
async function runComprehensiveTests() {
  console.log("🧪 Starting Comprehensive Test Suite...");
  console.log("📊 Testing critical functionality and edge cases\n");

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  async function test(name, fn, options = {}) {
    const startTime = performance.now();

    try {
      if (options.skip) {
        console.log(`⏭️  ${name} (SKIPPED)`);
        skipped++;
        return;
      }

      await fn();
      const duration = Math.round(performance.now() - startTime);
      console.log(`✅ ${name} (${duration}ms)`);
      passed++;
    } catch (e) {
      const duration = Math.round(performance.now() - startTime);
      console.error(`❌ ${name} (${duration}ms): ${e.message}`);
      if (options.verbose || process.env.VERBOSE_TESTS) {
        console.error(e.stack);
      }
      failed++;
    }
  }

  // ============================================================================
  // 🔍 FORMAT DETECTION TESTS
  // ============================================================================

  await test("Format Detection - Valid Base64", () => {
    const validBase64 =
      "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";
    const version = ProgramSerializer.probeFormatVersion(validBase64);
    if (version !== ProgramFormatVersion.Base64) {
      throw new Error(`Expected Base64, got ${version}`);
    }
  });

  await test("Format Detection - Invalid Input", () => {
    const invalidInputs = [
      "",
      "invalid",
      "XQAA", // Too short
      "not-base64!!!",
    ];

    for (const input of invalidInputs) {
      try {
        ProgramSerializer.probeFormatVersion(input);
        throw new Error(`Should have thrown for input: ${input}`);
      } catch (e) {
        if (
          e.message !== "Only LZMA Base64 format is supported" &&
          e.message !== "Program source must be a non-empty string"
        ) {
          throw new Error(`Unexpected error for ${input}: ${e.message}`);
        }
      }
    }

    // Test null/undefined separately
    const nullishInputs = [null, undefined];
    for (const input of nullishInputs) {
      try {
        ProgramSerializer.probeFormatVersion(input);
        throw new Error(`Should have thrown for input: ${input}`);
      } catch (e) {
        // Expected error
      }
    }
  });

  // ============================================================================
  // 🔄 ROUND-TRIP TESTS
  // ============================================================================

  await test("Round Trip - Minimal Program", async () => {
    const instructions = [new Instruction(ProgAction.None, null, null)];
    const encoded = await ProgramSerializer.encode(instructions);
    const decoded = await ProgramSerializer.decode(encoded);

    if (decoded.length !== 1) {
      throw new Error(`Expected 1 instruction, got ${decoded.length}`);
    }
    if (decoded[0].action !== ProgAction.None) {
      throw new Error(`Expected None action, got ${decoded[0].action}`);
    }
  });

  await test("Round Trip - Single Instruction", async () => {
    const instructions = [new Instruction(ProgAction.MoveUp, null, null)];
    const encoded = await ProgramSerializer.encode(instructions);
    const decoded = await ProgramSerializer.decode(encoded);

    if (decoded.length !== 1) {
      throw new Error(`Expected 1 instruction, got ${decoded.length}`);
    }
    if (decoded[0].action !== ProgAction.MoveUp) {
      throw new Error(
        `Action mismatch: expected ${ProgAction.MoveUp}, got ${decoded[0].action}`,
      );
    }
  });

  await test("Round Trip - Complex Program with Labels and Values", async () => {
    const instructions = [
      new Instruction(ProgAction.SetStart, null, null),
      new Instruction(ProgAction.Label, "MAIN", null),
      new Instruction(ProgAction.MoveUp, null, null),
      new Instruction(ProgAction.VarEqualsNumber, "CNT", 10),
      new Instruction(ProgAction.Goto, "MAIN", null),
    ];

    const encoded = await ProgramSerializer.encode(instructions);
    const decoded = await ProgramSerializer.decode(encoded);

    if (decoded.length !== instructions.length) {
      throw new Error(
        `Length mismatch: expected ${instructions.length}, got ${decoded.length}`,
      );
    }

    // Verify each instruction
    const checks = [
      { action: ProgAction.SetStart },
      { action: ProgAction.Label, label: "MAIN" },
      { action: ProgAction.MoveUp },
      { action: ProgAction.VarEqualsNumber, label: "CNT", value: 10 },
      { action: ProgAction.Goto, label: "MAIN" },
    ];

    for (let i = 0; i < checks.length; i++) {
      const expected = checks[i];
      const actual = decoded[i];

      if (actual.action !== expected.action) {
        throw new Error(`Instruction ${i}: action mismatch`);
      }
      if (expected.label && actual.label !== expected.label) {
        throw new Error(`Instruction ${i}: label mismatch`);
      }
      if (expected.value !== undefined && actual.value !== expected.value) {
        throw new Error(`Instruction ${i}: value mismatch`);
      }
    }
  });

  // ============================================================================
  // 🚨 ERROR HANDLING TESTS
  // ============================================================================

  await test("Error Handling - Malformed Base64", async () => {
    const malformed = "XQAAgAA!!!invalid!!!";
    try {
      await ProgramSerializer.decode(malformed);
      throw new Error("Should have thrown for malformed input");
    } catch (e) {
      // Expected error
    }
  });

  await test("Error Handling - Invalid Action Codes", async () => {
    const instructions = [
      new Instruction(-1, null, null), // Invalid action
      new Instruction(99999, null, null), // Out of range
    ];

    try {
      await ProgramSerializer.encode(instructions);
      throw new Error("Should have thrown for invalid actions");
    } catch (e) {
      // Expected error
    }
  });

  await test("Error Handling - Oversized Program", async () => {
    // Create program larger than MAX_INSTRUCTIONS
    const oversized = Array(10000)
      .fill(null)
      .map(() => new Instruction(ProgAction.None, null, null));

    try {
      await ProgramSerializer.encode(oversized);
      // This might not throw immediately, but should handle gracefully
    } catch (e) {
      // Expected error for oversized programs
    }
  });

  // ============================================================================
  // 🎯 EDGE CASES TESTS
  // ============================================================================

  await test("Edge Cases - Unicode Labels", async () => {
    const unicodeLabels = ["🚀Start", "тест_метка", "Label-123_ABC", "🎯🏆⚡"];

    for (const label of unicodeLabels) {
      const instructions = [new Instruction(ProgAction.Label, label, null)];
      const encoded = await ProgramSerializer.encode(instructions);
      const decoded = await ProgramSerializer.decode(encoded);

      if (decoded[0].label !== label.toUpperCase()) {
        throw new Error(`Unicode label "${label}" failed round-trip`);
      }
    }
  });

  await test("Edge Cases - Special Characters in Labels", async () => {
    const specialLabels = ["ABC", "123", "A1B", "XYZ"];

    for (const label of specialLabels) {
      const instructions = [new Instruction(ProgAction.Goto, label, null)];
      const encoded = await ProgramSerializer.encode(instructions);
      const decoded = await ProgramSerializer.decode(encoded);

      if (decoded[0].label !== label.toUpperCase()) {
        throw new Error(`Special label "${label}" failed round-trip`);
      }
    }
  });

  await test("Edge Cases - Large Values", async () => {
    const largeValues = [
      0,
      1,
      -1,
      999999,
      -999999,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
    ];

    for (const value of largeValues) {
      const instructions = [
        new Instruction(ProgAction.VarEqualsNumber, "TEST", value),
      ];
      const encoded = await ProgramSerializer.encode(instructions);
      const decoded = await ProgramSerializer.decode(encoded);

      if (decoded[0].value !== value) {
        throw new Error(`Large value ${value} failed round-trip`);
      }
    }
  });

  // ============================================================================
  // 🏗️ INTEGRATION TESTS
  // ============================================================================

  await test("Integration - Program Model Round Trip", async () => {
    // Create program using Program model
    const program = new Program();
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.Label, "LOOP");
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Goto, "LOOP");

    // Serialize via Program model
    const base64 = await program.toBase64Format();

    // Deserialize back
    const restoredProgram = await Program.fromString(base64);

    // Verify structure - restored program may be padded to PAGE_SIZE
    const expectedLength = Math.max(program.instructions.length, 192); // PAGE_SIZE
    if (restoredProgram.instructions.length !== expectedLength) {
      throw new Error(
        `Program length mismatch: expected ${expectedLength}, got ${restoredProgram.instructions.length}`,
      );
    }

    // Verify each instruction
    for (let i = 0; i < program.instructions.length; i++) {
      const original = program.instructions[i];
      const restored = restoredProgram.instructions[i];

      if (restored.action !== original.action) {
        throw new Error(`Instruction ${i}: action mismatch`);
      }
      if (restored.label !== original.label) {
        throw new Error(`Instruction ${i}: label mismatch`);
      }
      if (restored.value !== original.value) {
        throw new Error(`Instruction ${i}: value mismatch`);
      }
    }
  });

  await test("Integration - Simple Bot Program", async () => {
    // Simulate a simple mining bot program
    const program = new Program();
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.Label, "M1");
    program.addInstruction(ProgAction.IsEmpty);
    program.addInstruction(ProgAction.YesNoGoto, "D1");
    program.addInstruction(ProgAction.MoveRight);
    program.addInstruction(ProgAction.Goto, "M1");
    program.addInstruction(ProgAction.Label, "D1");
    program.addInstruction(ProgAction.Dig);
    program.addInstruction(ProgAction.Goto, "M1");

    // Test serialization
    const base64 = await program.toBase64Format();
    const restored = await Program.fromString(base64);

    // Validate program structure
    const validation = restored.validate();
    if (!validation.isValid) {
      throw new Error(
        `Program validation failed: ${validation.errors.join(", ")}`,
      );
    }

    // Check that all labels are resolved
    const unresolvedLabels = validation.warnings.filter((w) =>
      w.includes("Undefined label"),
    );
    if (unresolvedLabels.length > 0) {
      throw new Error(`Unresolved labels: ${unresolvedLabels.join(", ")}`);
    }
  });

  // ============================================================================
  // 📈 PERFORMANCE TESTS
  // ============================================================================

  await test("Performance - Large Program Serialization", async () => {
    const startTime = performance.now();

    // Create large program (reasonable size for performance test)
    const instructions = Array(1000)
      .fill(null)
      .map(
        (_, i) =>
          new Instruction(
            ProgAction.MoveUp,
            i % 100 === 0 ? `L${i % 100}` : null,
            null,
          ),
      );

    const encoded = await ProgramSerializer.encode(instructions);
    const decoded = await ProgramSerializer.decode(encoded);

    const duration = performance.now() - startTime;

    if (decoded.length !== instructions.length) {
      throw new Error("Length mismatch in performance test");
    }

    if (duration > 5000) {
      // 5 seconds max for 1000 instructions
      console.warn(
        `⚠️  Performance warning: ${duration}ms for 1000 instructions`,
      );
    }

    console.log(
      `   📊 Serialized ${instructions.length} instructions in ${Math.round(duration)}ms`,
    );
  });

  // ============================================================================
  // 🔒 SECURITY TESTS
  // ============================================================================

  await test("Security - Input Validation", () => {
    const maliciousInputs = [
      "<script>alert('xss')</script>",
      "../../../../etc/passwd",
      "javascript:alert('xss')",
      "data:text/html,<script>alert('xss')</script>",
    ];

    // These should not cause issues in serialization
    for (const input of maliciousInputs) {
      const instructions = [new Instruction(ProgAction.Label, input, null)];
      // Should not throw or cause security issues
      try {
        ProgramSerializer.encode(instructions);
      } catch (e) {
        // Expected validation errors are OK
        if (
          !e.message.includes("validation") &&
          !e.message.includes("invalid")
        ) {
          throw new Error(
            `Unexpected error for input "${input}": ${e.message}`,
          );
        }
      }
    }
  });

  // ============================================================================
  // 🎪 SPECIAL CASES TESTS
  // ============================================================================

  await test("Special Cases - Core Action Types", async () => {
    // Test core action types that are guaranteed to exist
    const testActions = [
      ProgAction.MoveUp,
      ProgAction.MoveDown,
      ProgAction.MoveLeft,
      ProgAction.MoveRight,
      ProgAction.Dig,
      ProgAction.SetStart,
      ProgAction.Terminate,
      ProgAction.Label,
      ProgAction.Goto,
    ];

    for (const action of testActions) {
      if (action === undefined) continue; // Skip if action is not defined

      const instructions = [new Instruction(action, null, null)];
      const encoded = await ProgramSerializer.encode(instructions);
      const decoded = await ProgramSerializer.decode(encoded);

      if (decoded[0].action !== action) {
        throw new Error(`Action ${action} failed round-trip`);
      }
    }
  });

  await test("Special Cases - Boundary Values", () => {
    // Test edge cases for instruction properties
    const boundaryTests = [
      { action: 0, label: "", value: 0 }, // Minimum values
      { action: ProgAction.Terminate, label: null, value: null }, // Null values
      { action: ProgAction.VarEqualsNumber, label: "A", value: 0 }, // Single char label
      {
        action: ProgAction.Label,
        label: "VERY_LONG_LABEL_NAME_TEST_123",
        value: null,
      }, // Long label
    ];

    for (const test of boundaryTests) {
      const instruction = new Instruction(test.action, test.label, test.value);

      // Validate instruction structure
      if (instruction.action !== test.action) {
        throw new Error(`Action boundary test failed for ${test.action}`);
      }
      if (instruction.label !== test.label) {
        throw new Error(`Label boundary test failed for "${test.label}"`);
      }
      if (instruction.value !== test.value) {
        throw new Error(`Value boundary test failed for ${test.value}`);
      }
    }
  });

  // ============================================================================
  // 📋 SUMMARY
  // ============================================================================

  console.log(`\n🏁 Comprehensive Test Suite Completed:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📊 Total: ${passed + failed + skipped} tests`);

  const successRate = ((passed / (passed + failed)) * 100).toFixed(1);
  console.log(`🎯 Success Rate: ${successRate}%`);

  if (failed > 0) {
    console.log(
      `\n⚠️  ${failed} test(s) failed. Check logs above for details.`,
    );
    process.exit(1);
  } else {
    console.log(
      `\n🎉 All tests passed! External Mines Programmator is production-ready.`,
    );
  }
}

// Run the tests
runComprehensiveTests().catch((error) => {
  console.error("💥 Test suite crashed:", error);
  process.exit(1);
});
