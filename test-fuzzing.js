/**
 * Fuzzing Test Suite for External Mines Programmator
 * Tests system robustness against malformed and unexpected inputs
 */
import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import { Program } from "./src/js/core/models/program.js";

/**
 * Fuzzing test runner
 */
class Fuzzer {
  constructor() {
    this.tests = [];
    this.failures = [];
    this.crashes = [];
  }

  /**
   * Generate malformed data for fuzzing
   */
  static generateMalformedStrings() {
    return [
      // Empty and null
      "",
      null,
      undefined,

      // Invalid base64
      "!!!invalid!!!",
      "not-base64-at-all",
      "XQAA!!!mixed!!!",

      // Truncated
      "XQAA",
      "XQAAgAA",
      "XQAAgAA3",

      // Corrupted base64
      "XQAAgAA3KwAAAAAAAAAkgrwX/EDx4j1c9T0SxHOhKSK6cpclmPzS3ZS8bty3Lo".replace(
        /A/g,
        "X",
      ),
      "XQAAgAA3KwAAAAAAAAAkgrwX/EDx4j1c9T0SxHOhKSK6cpclmPzS3ZS8bty3Lo".slice(
        0,
        50,
      ),

      // Extremely long
      "A".repeat(10000),
      "XQAA" + "A".repeat(10000),

      // Special characters
      "XQAAgAA3\x00\x01\x02", // null bytes
      "XQAAgAA3<script>alert('xss')</script>", // XSS attempts
      "XQAAgAA3../../../etc/passwd", // path traversal
      "XQAAgAA3💥🎯🔥", // emojis
    ];
  }

  static generateMalformedInstructions() {
    return [
      // Invalid action codes
      new Instruction(-1, null, null),
      new Instruction(99999, null, null),
      new Instruction(NaN, null, null),
      new Instruction(Infinity, null, null),

      // Oversized labels
      new Instruction(
        ProgAction.Label,
        "VERY_LONG_LABEL_THAT_EXCEEDS_LIMITS",
        null,
      ),
      new Instruction(ProgAction.Goto, "A".repeat(100), null),

      // Extreme values
      new Instruction(ProgAction.VarEqualsNumber, "TEST", Number.MAX_VALUE),
      new Instruction(ProgAction.VarEqualsNumber, "TEST", Number.MIN_VALUE),
      new Instruction(ProgAction.VarEqualsNumber, "TEST", NaN),
      new Instruction(ProgAction.VarEqualsNumber, "TEST", Infinity),

      // Malformed objects
      { action: ProgAction.MoveUp }, // Missing prototype
      new Instruction(ProgAction.MoveUp, null, null) &&
        Object.setPrototypeOf(
          new Instruction(ProgAction.MoveUp, null, null),
          null,
        ), // Null prototype

      // Circular references (if supported)
      (() => {
        const inst = new Instruction(ProgAction.MoveUp, null, null);
        try {
          inst.self = inst; // Circular reference
          return inst;
        } catch {
          return inst;
        }
      })(),
    ];
  }

  static generateMalformedPrograms() {
    return [
      // Empty programs
      [],
      null,
      undefined,

      // Programs with invalid instructions
      [null, undefined, {}],
      [new Instruction("invalid", null, null)],

      // Extremely large programs
      Array(10000).fill(new Instruction(ProgAction.None, null, null)),
      Array(100000)
        .fill(null)
        .map(() => new Instruction(ProgAction.None, null, null)),

      // Programs with mixed valid/invalid instructions
      [
        new Instruction(ProgAction.MoveUp, null, null),
        null,
        new Instruction(ProgAction.Dig, null, null),
        { action: ProgAction.MoveDown },
        new Instruction(ProgAction.MoveLeft, null, null),
      ],

      // Programs with duplicate labels
      [
        new Instruction(ProgAction.Label, "LOOP", null),
        new Instruction(ProgAction.MoveUp, null, null),
        new Instruction(ProgAction.Label, "LOOP", null), // Duplicate
        new Instruction(ProgAction.Goto, "LOOP", null),
      ],
    ];
  }

  /**
   * Fuzzing test definition
   */
  fuzz(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * Run all fuzzing tests
   */
  async run(iterations = 100) {
    console.log("🔬 Starting Fuzzing Tests...");
    console.log(
      `📊 Testing system robustness with ${iterations} iterations per test\n`,
    );

    let totalTests = 0;
    let totalFailures = 0;
    let totalCrashes = 0;

    for (const test of this.tests) {
      console.log(`🔍 Fuzzing: ${test.name}`);

      let failures = 0;
      let crashes = 0;

      for (let i = 0; i < iterations; i++) {
        try {
          await test.testFn();
        } catch (e) {
          failures++;
          this.failures.push({
            test: test.name,
            iteration: i,
            error: e.message,
            stack: e.stack,
          });

          // Check if it's a crash (not expected error)
          if (
            e instanceof TypeError ||
            e instanceof ReferenceError ||
            e.message.includes("Cannot read") ||
            e.message.includes("undefined")
          ) {
            crashes++;
            this.crashes.push({
              test: test.name,
              iteration: i,
              error: e.message,
              stack: e.stack,
            });
          }
        }
        totalTests++;
      }

      const failureRate = ((failures / iterations) * 100).toFixed(1);
      console.log(
        `   📊 ${iterations} iterations: ${failures} failures (${failureRate}%)`,
      );

      if (crashes > 0) {
        console.log(`   💥 ${crashes} crashes detected!`);
      }

      totalFailures += failures;
      totalCrashes += crashes;
    }

    console.log(`\n🏁 Fuzzing Summary:`);
    console.log(`🧪 Total tests: ${totalTests}`);
    console.log(`❌ Total failures: ${totalFailures}`);
    console.log(`💥 Total crashes: ${totalCrashes}`);
    console.log(
      `📊 Failure rate: ${((totalFailures / totalTests) * 100).toFixed(1)}%`,
    );

    if (this.crashes.length > 0) {
      console.log(
        `\n🚨 CRITICAL: ${this.crashes.length} system crashes detected!`,
      );
      console.log("Crashes indicate serious robustness issues:");
      this.crashes.slice(0, 3).forEach((c, i) => {
        console.log(`${i + 1}. ${c.test}: ${c.error}`);
      });

      return false;
    }

    if (totalFailures > totalTests * 0.1) {
      // More than 10% failure rate
      console.log(
        `\n⚠️  High failure rate detected. System may need hardening.`,
      );
    }

    return true;
  }
}

/**
 * Run fuzzing tests
 */
async function runFuzzingTests() {
  const fuzzer = new Fuzzer();

  // ============================================================================
  // SERIALIZATION FUZZING
  // ============================================================================

  fuzzer.fuzz("Malformed Base64 Deserialization", async () => {
    const malformedStrings = Fuzzer.generateMalformedStrings();
    const testString =
      malformedStrings[Math.floor(Math.random() * malformedStrings.length)];

    // Should not crash the system
    try {
      await ProgramSerializer.decode(testString);
    } catch (e) {
      // Expected errors are OK, crashes are not
      if (e instanceof TypeError || e instanceof ReferenceError) {
        throw e; // This is a crash
      }
      // Other errors (validation, format) are acceptable
    }
  });

  fuzzer.fuzz("Invalid Instruction Serialization", async () => {
    const malformedInstructions = Fuzzer.generateMalformedInstructions();
    const instructions = [
      malformedInstructions[
        Math.floor(Math.random() * malformedInstructions.length)
      ],
    ];

    // Should handle gracefully
    try {
      await ProgramSerializer.encode(instructions);
    } catch (e) {
      // Expected validation errors are OK
      if (e instanceof TypeError || e instanceof ReferenceError) {
        throw e; // This is a crash
      }
    }
  });

  fuzzer.fuzz("Format Detection with Garbage", async () => {
    const garbageInputs = Fuzzer.generateMalformedStrings();
    const testInput =
      garbageInputs[Math.floor(Math.random() * garbageInputs.length)];

    // Should not crash
    try {
      ProgramSerializer.probeFormatVersion(testInput);
    } catch (e) {
      if (e instanceof TypeError || e instanceof ReferenceError) {
        throw e; // Crash
      }
    }
  });

  // ============================================================================
  // PROGRAM MODEL FUZZING
  // ============================================================================

  fuzzer.fuzz("Malformed Program Operations", async () => {
    const program = new Program();

    // Try various invalid operations
    const operations = [
      () => program.getInstructionAt(-1, 0, 0),
      () => program.getInstructionAt(0, -1, 0),
      () => program.getInstructionAt(999, 999, 0),
      () => program.setInstructionAt(-1, 0, ProgAction.MoveUp, null, null, 0),
      () => program.setInstructionAt(0, -1, ProgAction.MoveUp, null, null, 0),
      () => program.getInstruction(-1),
      () =>
        program.setInstruction(
          -1,
          new Instruction(ProgAction.MoveUp, null, null),
        ),
    ];

    const randomOp = operations[Math.floor(Math.random() * operations.length)];

    try {
      randomOp();
    } catch (e) {
      if (e instanceof TypeError || e instanceof ReferenceError) {
        throw e; // Crash
      }
    }
  });

  fuzzer.fuzz("Program Validation with Garbage", async () => {
    const malformedPrograms = Fuzzer.generateMalformedPrograms();
    const testProgramData =
      malformedPrograms[Math.floor(Math.random() * malformedPrograms.length)];

    try {
      // Try to create a program-like object
      const program = new Program();
      program.instructions = testProgramData;

      // Try to validate
      program.validate();
    } catch (e) {
      if (e instanceof TypeError || e instanceof ReferenceError) {
        throw e; // Crash
      }
    }
  });

  // ============================================================================
  // INTEGRATION FUZZING
  // ============================================================================

  fuzzer.fuzz("End-to-End Fuzzing", async () => {
    // Generate completely random program data
    const programSize = Math.floor(Math.random() * 50);
    const randomInstructions = Array.from({ length: programSize }, () => {
      const action = Math.floor(Math.random() * 1000); // Random action codes
      const label =
        Math.random() < 0.5
          ? Fuzzer.generateMalformedStrings()[Math.floor(Math.random() * 5)]
          : null;
      const value =
        Math.random() < 0.5 ? Math.floor(Math.random() * 10000) - 5000 : null;

      return new Instruction(action, label, value);
    });

    try {
      // Try the full pipeline
      const encoded = await ProgramSerializer.encode(randomInstructions);
      const decoded = await ProgramSerializer.decode(encoded);

      // Try to create program
      const program = new Program();
      program.instructions = decoded;

      // Try validation
      program.validate();
    } catch (e) {
      if (e instanceof TypeError || e instanceof ReferenceError) {
        throw e; // Crash - bad
      }
      // Other errors are expected with random data
    }
  });

  // ============================================================================
  // PERFORMANCE FUZZING
  // ============================================================================

  fuzzer.fuzz("Performance with Large Data", async () => {
    const startTime = performance.now();

    // Generate large random program
    const largeSize = Math.floor(Math.random() * 1000) + 500;
    const largeInstructions = Array.from(
      { length: largeSize },
      () => new Instruction(ProgAction.None, null, null),
    );

    try {
      const encoded = await ProgramSerializer.encode(largeInstructions);
      const decoded = await ProgramSerializer.decode(encoded);

      const duration = performance.now() - startTime;

      // Performance check: should not take more than 10 seconds for 1500 instructions
      if (duration > 10000) {
        throw new Error(
          `Performance degradation: ${duration}ms for ${largeSize} instructions`,
        );
      }
    } catch (e) {
      if (e instanceof TypeError || e instanceof ReferenceError) {
        throw e; // Crash
      }
      // Performance errors are also concerning
      if (e.message.includes("Performance")) {
        throw e;
      }
    }
  });

  // Run fuzzing tests
  const success = await fuzzer.run(50); // 50 iterations per test

  if (!success) {
    console.log("\n❌ Fuzzing detected critical robustness issues!");
    process.exit(1);
  } else {
    console.log("\n✅ System passed fuzzing tests!");
  }
}

// Run the fuzzing tests
runFuzzingTests().catch((error) => {
  console.error("💥 Fuzzing crashed:", error);
  process.exit(1);
});
