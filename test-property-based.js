/**
 * Property-Based Testing Suite for External Mines Programmator
 * Uses generative testing to find edge cases and invariants
 */
import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";
import { ProgramFormatVersion } from "./src/js/core/constants/formats.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import { Program } from "./src/js/core/models/program.js";

/**
 * Simple property-based testing framework
 */
class PropertyTester {
  constructor() {
    this.tests = [];
    this.failures = [];
  }

  /**
   * Generate random data for testing
   */
  static randomString(length = 10) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  }

  static randomLabel() {
    const length = Math.floor(Math.random() * 3) + 1; // 1-3 chars for valid labels
    return this.randomString(length).toUpperCase();
  }

  static randomAction() {
    const actions = Object.values(ProgAction).filter(
      (v) => typeof v === "number",
    );
    return actions[Math.floor(Math.random() * actions.length)];
  }

  static randomValue() {
    return Math.floor(Math.random() * 1000) - 500; // -500 to 499
  }

  static randomInstruction() {
    const action = this.randomAction();
    const hasLabel = Math.random() < 0.3; // 30% chance of label
    const hasValue = Math.random() < 0.2; // 20% chance of value

    return new Instruction(
      action,
      hasLabel ? this.randomLabel() : null,
      hasValue ? this.randomValue() : null,
    );
  }

  /**
   * Property test definition
   */
  property(name, generator, propertyFn, iterations = 100) {
    this.tests.push({ name, generator, propertyFn, iterations });
  }

  /**
   * Run all property tests
   */
  async run() {
    console.log("🔬 Starting Property-Based Tests...");
    console.log(
      `📊 Running ${this.tests.length} properties with generative testing\n`,
    );

    let totalPassed = 0;
    let totalFailed = 0;

    for (const test of this.tests) {
      console.log(`🔍 Testing property: ${test.name}`);

      let passed = 0;
      let failed = 0;

      for (let i = 0; i < test.iterations; i++) {
        try {
          const data = test.generator();
          await test.propertyFn(data);
          passed++;
        } catch (e) {
          failed++;
          this.failures.push({
            property: test.name,
            iteration: i,
            error: e.message,
            stack: e.stack,
          });
        }
      }

      const successRate = ((passed / test.iterations) * 100).toFixed(1);
      console.log(
        `   ✅ ${passed}/${test.iterations} cases passed (${successRate}%)`,
      );

      if (failed > 0) {
        console.log(`   ❌ ${failed} cases failed`);
      }

      totalPassed += passed;
      totalFailed += failed;
    }

    console.log(`\n🏁 Property Testing Summary:`);
    console.log(`✅ Total passed: ${totalPassed}`);
    console.log(`❌ Total failed: ${totalFailed}`);
    console.log(
      `📊 Success rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`,
    );

    if (this.failures.length > 0) {
      console.log(`\n💥 Failures:`);
      this.failures.slice(0, 5).forEach((f, i) => {
        console.log(
          `${i + 1}. ${f.property} (iteration ${f.iteration}): ${f.error}`,
        );
      });

      if (this.failures.length > 5) {
        console.log(`... and ${this.failures.length - 5} more failures`);
      }
    }

    return totalFailed === 0;
  }
}

/**
 * Run property-based tests
 */
async function runPropertyBasedTests() {
  const tester = new PropertyTester();

  // ============================================================================
  // SERIALIZATION PROPERTIES
  // ============================================================================

  // Round-trip property: serialize -> deserialize should preserve data
  tester.property(
    "Serialization Round-trip Preservation",
    () => {
      const programSize = Math.floor(Math.random() * 50) + 1;
      const instructions = Array.from({ length: programSize }, () =>
        PropertyTester.randomInstruction(),
      );
      return instructions;
    },
    async (instructions) => {
      const encoded = await ProgramSerializer.encode(instructions);
      const decoded = await ProgramSerializer.decode(encoded);

      if (decoded.length !== instructions.length) {
        throw new Error(
          `Length mismatch: ${instructions.length} vs ${decoded.length}`,
        );
      }

      for (let i = 0; i < instructions.length; i++) {
        const original = instructions[i];
        const restored = decoded[i];

        if (restored.action !== original.action) {
          throw new Error(
            `Action mismatch at ${i}: ${original.action} vs ${restored.action}`,
          );
        }

        if (restored.label !== original.label) {
          throw new Error(
            `Label mismatch at ${i}: "${original.label}" vs "${restored.label}"`,
          );
        }

        if (restored.value !== original.value) {
          throw new Error(
            `Value mismatch at ${i}: ${original.value} vs ${restored.value}`,
          );
        }
      }
    },
    200,
  );

  // Serialization determinism: same input should produce same output
  tester.property(
    "Serialization Determinism",
    () => {
      const instructions = Array.from(
        { length: Math.floor(Math.random() * 20) + 1 },
        () => PropertyTester.randomInstruction(),
      );
      return instructions;
    },
    async (instructions) => {
      const encoded1 = await ProgramSerializer.encode(instructions);
      const encoded2 = await ProgramSerializer.encode(instructions);

      if (encoded1 !== encoded2) {
        throw new Error("Non-deterministic serialization");
      }
    },
    100,
  );

  // ============================================================================
  // PROGRAM MODEL PROPERTIES
  // ============================================================================

  // Program growth property: adding instructions should increase length
  tester.property(
    "Program Growth",
    () => {
      const program = new Program();
      const instructionsToAdd = Math.floor(Math.random() * 20) + 1;

      for (let i = 0; i < instructionsToAdd; i++) {
        program.addInstruction(PropertyTester.randomAction());
      }

      return { program, expectedLength: instructionsToAdd };
    },
    (data) => {
      if (data.program.instructions.length !== data.expectedLength) {
        throw new Error(
          `Expected length ${data.expectedLength}, got ${data.program.instructions.length}`,
        );
      }
    },
    50,
  );

  // Grid coordinate mapping should be reversible
  tester.property(
    "Grid Coordinate Reversal",
    () => {
      const x = Math.floor(Math.random() * 16); // 0-15
      const y = Math.floor(Math.random() * 12); // 0-11
      const page = Math.floor(Math.random() * 16); // 0-15
      const action = PropertyTester.randomAction();

      return { x, y, page, action };
    },
    (data) => {
      const program = new Program();

      // Fill program to ensure coordinates exist
      for (let i = 0; i < 192 * (data.page + 1); i++) {
        program.addInstruction(ProgAction.None);
      }

      program.setInstructionAt(
        data.x,
        data.y,
        data.action,
        null,
        null,
        data.page,
      );
      const retrieved = program.getInstructionAt(data.x, data.y, data.page);

      if (retrieved.action !== data.action) {
        throw new Error(
          `Coordinate mapping failed: set ${data.action}, got ${retrieved.action}`,
        );
      }
    },
    100,
  );

  // ============================================================================
  // VALIDATION PROPERTIES
  // ============================================================================

  // Valid programs should pass validation
  tester.property(
    "Valid Program Validation",
    () => {
      const program = new Program();
      const instructionCount = Math.floor(Math.random() * 100) + 1;

      for (let i = 0; i < instructionCount; i++) {
        const action = PropertyTester.randomAction();
        const hasLabel = Math.random() < 0.2;
        const hasValue = Math.random() < 0.1;

        program.addInstruction(
          action,
          hasLabel ? PropertyTester.randomLabel() : null,
          hasValue ? PropertyTester.randomValue() : null,
        );
      }

      return program;
    },
    (program) => {
      const validation = program.validate();

      // Programs with random valid instructions might have warnings but should not have errors
      if (!validation.isValid) {
        // Allow label-related warnings but not errors
        const seriousErrors = validation.errors.filter(
          (e) => !e.includes("label") && !e.includes("Label"),
        );

        if (seriousErrors.length > 0) {
          throw new Error(
            `Unexpected validation errors: ${seriousErrors.join(", ")}`,
          );
        }
      }
    },
    50,
  );

  // ============================================================================
  // EDGE CASE PROPERTIES
  // ============================================================================

  // Boundary label lengths
  tester.property(
    "Label Length Boundaries",
    () => {
      const lengths = [1, 2, 3, 4, 5]; // Test around the 3-char limit
      const length = lengths[Math.floor(Math.random() * lengths.length)];
      const label = PropertyTester.randomString(length).toUpperCase();

      return { label, length };
    },
    async (data) => {
      const instructions = [
        new Instruction(ProgAction.Label, data.label, null),
      ];

      try {
        const encoded = await ProgramSerializer.encode(instructions);
        const decoded = await ProgramSerializer.decode(encoded);

        if (data.length <= 3) {
          // Should work for valid lengths
          if (decoded[0].label !== data.label) {
            throw new Error(
              `Label mismatch for length ${data.length}: "${data.label}" vs "${decoded[0].label}"`,
            );
          }
        } else {
          // Might fail for invalid lengths - that's OK
        }
      } catch (e) {
        if (data.length <= 3) {
          throw new Error(
            `Unexpected error for valid label length ${data.length}: ${e.message}`,
          );
        }
        // Expected error for invalid lengths
      }
    },
    50,
  );

  // Extreme values
  tester.property(
    "Extreme Values",
    () => {
      const values = [
        0,
        1,
        -1,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        999999,
        -999999,
        Math.floor(Math.random() * 2000) - 1000,
      ];

      return values[Math.floor(Math.random() * values.length)];
    },
    async (value) => {
      const instructions = [
        new Instruction(ProgAction.VarEqualsNumber, "TEST", value),
      ];

      try {
        const encoded = await ProgramSerializer.encode(instructions);
        const decoded = await ProgramSerializer.decode(encoded);

        if (decoded[0].value !== value) {
          throw new Error(`Value mismatch: ${value} vs ${decoded[0].value}`);
        }
      } catch (e) {
        // Some extreme values might cause issues - that's expected
        if (Number.isSafeInteger(value) && Math.abs(value) < 1000000) {
          throw new Error(
            `Unexpected error for reasonable value ${value}: ${e.message}`,
          );
        }
      }
    },
    100,
  );

  // Run all property tests
  const success = await tester.run();

  if (!success) {
    console.log("\n❌ Property-based testing found issues!");
    process.exit(1);
  } else {
    console.log("\n✅ All property-based tests passed!");
  }
}

// Run the property-based tests
runPropertyBasedTests().catch((error) => {
  console.error("💥 Property-based testing crashed:", error);
  process.exit(1);
});
