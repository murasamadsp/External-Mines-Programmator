/**
 * Advanced Testing Suite for External Mines Programmator
 * Comprehensive testing including property-based, integration, and performance tests
 */
import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";
import { ProgramFormatVersion } from "./src/js/core/constants/formats.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import { Program } from "./src/js/core/models/program.js";
import { ProgramGrid } from "./src/js/features/editor/components/ProgramGrid.js";

/**
 * Enhanced Property-Based Testing Framework
 */
class AdvancedPropertyTester {
  constructor() {
    this.tests = [];
    this.failures = [];
    this.successes = [];
  }

  /**
   * Run property test with multiple random inputs
   */
  property(name, generator, propertyFn, iterations = 100) {
    this.tests.push({ name, type: "property", iterations });

    console.log(`🔬 Running property test: ${name} (${iterations} iterations)`);

    for (let i = 0; i < iterations; i++) {
      try {
        const input = generator();
        const result = propertyFn(input);

        if (result !== true) {
          throw new Error(
            `Property failed for input: ${JSON.stringify(input)}`,
          );
        }

        this.successes.push({ name, iteration: i, input });
      } catch (e) {
        this.failures.push({
          name,
          iteration: i,
          error: e.message,
          stack: e.stack,
        });

        console.error(
          `❌ Property "${name}" failed at iteration ${i}: ${e.message}`,
        );
        break; // Stop on first failure
      }
    }

    if (this.failures.length === 0) {
      console.log(`✅ Property "${name}" passed all ${iterations} iterations`);
    }
  }

  /**
   * Run integration test
   */
  integration(name, testFn) {
    this.tests.push({ name, type: "integration" });

    try {
      const result = testFn();

      if (result instanceof Promise) {
        return result
          .then(() => {
            console.log(`✅ Integration "${name}" passed`);
            this.successes.push({ name, type: "integration" });
          })
          .catch((e) => {
            console.error(`❌ Integration "${name}" failed: ${e.message}`);
            this.failures.push({ name, type: "integration", error: e.message });
          });
      } else {
        console.log(`✅ Integration "${name}" passed`);
        this.successes.push({ name, type: "integration" });
      }
    } catch (e) {
      console.error(`❌ Integration "${name}" failed: ${e.message}`);
      this.failures.push({ name, type: "integration", error: e.message });
    }
  }

  /**
   * Run performance test
   */
  performance(name, testFn, maxDuration = 1000) {
    this.tests.push({ name, type: "performance", maxDuration });

    const startTime = performance.now();

    try {
      const result = testFn();

      const handleResult = () => {
        const duration = performance.now() - startTime;

        if (duration > maxDuration) {
          const error = `Performance test exceeded ${maxDuration}ms (took ${Math.round(duration)}ms)`;
          console.error(`❌ Performance "${name}" failed: ${error}`);
          this.failures.push({ name, type: "performance", error });
        } else {
          console.log(
            `✅ Performance "${name}" passed (${Math.round(duration)}ms)`,
          );
          this.successes.push({ name, type: "performance", duration });
        }
      };

      if (result instanceof Promise) {
        return result.then(handleResult);
      } else {
        handleResult();
      }
    } catch (e) {
      console.error(`❌ Performance "${name}" failed: ${e.message}`);
      this.failures.push({ name, type: "performance", error: e.message });
    }
  }

  /**
   * Generate random data for testing
   */
  static generators = {
    string: (length = 10) => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789🚀🎯⚡🔧";
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join("");
    },

    label: () => {
      const length = Math.floor(Math.random() * 3) + 1; // 1-3 chars for valid labels
      return this.generators.string(length).toUpperCase();
    },

    action: () => {
      const actions = Object.values(ProgAction).filter(
        (v) => typeof v === "number" && v >= 0,
      );
      return actions[Math.floor(Math.random() * actions.length)];
    },

    value: () => Math.floor(Math.random() * 2000) - 1000, // -1000 to 999

    instruction: () => {
      const action = this.generators.action();
      const hasLabel = Math.random() < 0.3; // 30% chance of label
      const hasValue = Math.random() < 0.2; // 20% chance of value

      return new Instruction(
        action,
        hasLabel ? this.generators.label() : null,
        hasValue ? this.generators.value() : null,
      );
    },

    program: (size = 50) => {
      const program = new Program();
      for (let i = 0; i < size; i++) {
        program.addInstruction(this.generators.instruction());
      }
      return program;
    },

    gridProgram: (pages = 2) => {
      const program = new Program();
      const instructionsPerPage = 16 * 12; // 16x12 grid

      for (let page = 0; page < pages; page++) {
        for (let i = 0; i < instructionsPerPage; i++) {
          if (Math.random() < 0.1) {
            // 10% filled cells
            program.setInstructionAt(
              i % 16, // x
              Math.floor(i / 16), // y
              this.generators.action(),
              Math.random() < 0.3 ? this.generators.label() : null,
              Math.random() < 0.2 ? this.generators.value() : null,
              page,
            );
          }
        }
      }

      return program;
    },
  };

  /**
   * Report test results
   */
  report() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 ADVANCED TESTING REPORT");
    console.log("=".repeat(60));

    console.log(`\n📈 Test Summary:`);
    console.log(`   Total tests: ${this.tests.length}`);
    console.log(`   ✅ Passed: ${this.successes.length}`);
    console.log(`   ❌ Failed: ${this.failures.length}`);

    const successRate = (
      (this.successes.length / this.tests.length) *
      100
    ).toFixed(1);
    console.log(`   📊 Success Rate: ${successRate}%`);

    if (this.failures.length > 0) {
      console.log(`\n❌ Test Failures:`);
      this.failures.forEach((failure) => {
        console.log(`   • ${failure.name} (${failure.type}): ${failure.error}`);
      });
    }

    console.log("\n" + "=".repeat(60));

    return this.failures.length === 0;
  }
}

/**
 * Memory usage monitoring
 */
class MemoryMonitor {
  constructor() {
    this.initialMemory = this.getMemoryUsage();
    this.checkpoints = [];
  }

  getMemoryUsage() {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage();
    }
    return { heapUsed: 0, heapTotal: 0, external: 0 };
  }

  checkpoint(name) {
    const current = this.getMemoryUsage();
    this.checkpoints.push({
      name,
      memory: current,
      delta: {
        heapUsed:
          current.heapUsed -
          (this.checkpoints[this.checkpoints.length - 1]?.memory.heapUsed ||
            this.initialMemory.heapUsed),
        heapTotal:
          current.heapTotal -
          (this.checkpoints[this.checkpoints.length - 1]?.memory.heapTotal ||
            this.initialMemory.heapTotal),
      },
    });
  }

  report() {
    console.log("\n🧠 Memory Usage Report:");

    this.checkpoints.forEach((cp) => {
      const heapMB = Math.round(cp.memory.heapUsed / 1024 / 1024);
      const deltaMB = Math.round(cp.delta.heapUsed / 1024 / 1024);
      console.log(
        `   ${cp.name}: ${heapMB}MB ${deltaMB >= 0 ? "+" : ""}${deltaMB}MB`,
      );
    });
  }
}

/**
 * Run comprehensive advanced testing
 */
async function runAdvancedTests() {
  console.log("🚀 Starting Advanced Testing Suite...");
  console.log(
    "🧪 Running property-based, integration, and performance tests\n",
  );

  const tester = new AdvancedPropertyTester();
  const memoryMonitor = new MemoryMonitor();

  // ============================================================================
  // PROPERTY-BASED TESTS
  // ============================================================================

  console.log("🔬 PROPERTY-BASED TESTS");

  // Test serialization round-trip property
  tester.property(
    "Serialization Round-Trip",
    () =>
      AdvancedPropertyTester.generators.program(
        Math.floor(Math.random() * 20) + 1,
      ),
    async (program) => {
      const base64 = await program.toBase64Format();
      const restored = await Program.fromString(base64);

      // Check that program structure is preserved
      return restored.instructions.length >= program.instructions.length;
    },
    50,
  );

  // Test instruction validity property
  tester.property(
    "Instruction Validity",
    () => AdvancedPropertyTester.generators.instruction(),
    (instruction) => {
      // Check that instruction has required properties
      return (
        typeof instruction.action === "number" &&
        instruction.action >= 0 &&
        (instruction.label === null || typeof instruction.label === "string") &&
        (instruction.value === null || typeof instruction.value === "number")
      );
    },
    100,
  );

  // Test grid coordinate mapping
  tester.property(
    "Grid Coordinate Mapping",
    () => ({
      x: Math.floor(Math.random() * 16),
      y: Math.floor(Math.random() * 12),
      page: Math.floor(Math.random() * 16),
      action: AdvancedPropertyTester.generators.action(),
    }),
    (data) => {
      const program = new Program();
      program.setInstructionAt(
        data.x,
        data.y,
        data.action,
        null,
        null,
        data.page,
      );

      const retrieved = program.getInstructionAt(data.x, data.y, data.page);
      return retrieved.action === data.action;
    },
    50,
  );

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  console.log("\n🔗 INTEGRATION TESTS");

  // Complex program lifecycle
  await tester.integration("Complex Program Lifecycle", async () => {
    const program = new Program();

    // Build complex program
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.Label, "MAIN");
    program.addInstruction(ProgAction.IsEmpty);
    program.addInstruction(ProgAction.YesNoGoto, "DIG");
    program.addInstruction(ProgAction.MoveRight);
    program.addInstruction(ProgAction.Goto, "MAIN");
    program.addInstruction(ProgAction.Label, "DIG");
    program.addInstruction(ProgAction.Dig);
    program.addInstruction(ProgAction.VarAddNumber, "ORE", 1);
    program.addInstruction(ProgAction.Goto, "MAIN");

    // Serialize
    const base64 = await program.toBase64Format();

    // Deserialize
    const restored = await Program.fromString(base64);

    // Validate
    const validation = restored.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    return true;
  });

  // Grid interaction integration
  await tester.integration("Grid Component Integration", async () => {
    // Mock DOM for testing
    global.document = {
      createElement: () => ({
        className: "",
        style: {},
        addEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        appendChild: () => {},
      }),
      querySelector: () => null,
      querySelectorAll: () => [],
    };

    const program = new Program();
    program.addInstruction(ProgAction.MoveUp);

    // Create grid component
    const container = { appendChild: () => {} };
    const grid = new ProgramGrid(container, program, () => {});

    // Verify grid was created
    if (!grid.program || !grid.container) {
      throw new Error("Grid component not properly initialized");
    }

    return true;
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  console.log("\n⚡ PERFORMANCE TESTS");

  memoryMonitor.checkpoint("Start");

  // Large program serialization
  await tester.performance(
    "Large Program Serialization",
    async () => {
      const program = AdvancedPropertyTester.generators.program(500);
      const base64 = await program.toBase64Format();
      const restored = await Program.fromString(base64);

      if (restored.instructions.length < program.instructions.length) {
        throw new Error("Serialization lost data");
      }
    },
    3000,
  );

  memoryMonitor.checkpoint("After Large Program");

  // Grid operations performance
  await tester.performance(
    "Bulk Grid Operations",
    () => {
      const program = new Program();

      // Perform 1000 grid operations
      for (let i = 0; i < 1000; i++) {
        const x = i % 16;
        const y = Math.floor(i / 16) % 12;
        const page = Math.floor(i / (16 * 12));

        program.setInstructionAt(x, y, ProgAction.MoveUp, null, null, page);
        const retrieved = program.getInstructionAt(x, y, page);

        if (retrieved.action !== ProgAction.MoveUp) {
          throw new Error(`Grid operation ${i} failed`);
        }
      }
    },
    2000,
  );

  memoryMonitor.checkpoint("After Grid Operations");

  // Memory cleanup test
  await tester.performance(
    "Memory Cleanup",
    () => {
      const programs = [];

      // Create many programs
      for (let i = 0; i < 100; i++) {
        const program = AdvancedPropertyTester.generators.program(20);
        programs.push(program);
      }

      // Clear all
      programs.forEach((p) => p.clear());

      return true;
    },
    1000,
  );

  memoryMonitor.checkpoint("After Cleanup");

  // ============================================================================
  // ADVANCED EDGE CASES
  // ============================================================================

  console.log("\n🎯 ADVANCED EDGE CASES");

  // Boundary conditions
  await tester.integration("Boundary Conditions", async () => {
    const program = new Program();

    // Test all boundary positions
    for (let page = 0; page < 2; page++) {
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 12; y++) {
          program.setInstructionAt(x, y, ProgAction.MoveUp, null, null, page);
          const retrieved = program.getInstructionAt(x, y, page);

          if (retrieved.action !== ProgAction.MoveUp) {
            throw new Error(
              `Boundary test failed at (${x}, ${y}, page ${page})`,
            );
          }
        }
      }
    }

    return true;
  });

  // Concurrent operations simulation
  await tester.integration("Concurrent Operations", async () => {
    const program = new Program();

    // Simulate concurrent access patterns
    const operations = [];

    for (let i = 0; i < 50; i++) {
      operations.push(
        new Promise((resolve) => {
          setTimeout(() => {
            const x = Math.floor(Math.random() * 16);
            const y = Math.floor(Math.random() * 12);
            program.setInstructionAt(x, y, ProgAction.Dig, null, null, 0);
            const retrieved = program.getInstructionAt(x, y, 0);

            if (retrieved.action === ProgAction.Dig) {
              resolve(true);
            } else {
              resolve(false);
            }
          }, Math.random() * 10);
        }),
      );
    }

    const results = await Promise.all(operations);
    const successCount = results.filter((r) => r).length;

    if (successCount < results.length * 0.9) {
      // 90% success rate
      throw new Error(
        `Concurrent operations failed: ${successCount}/${results.length} successful`,
      );
    }

    return true;
  });

  // ============================================================================
  // REPORTING
  // ============================================================================

  memoryMonitor.report();

  const success = tester.report();

  if (!success) {
    console.log("\n❌ Advanced testing failed!");
    process.exit(1);
  } else {
    console.log("\n🎉 Advanced testing completed successfully!");
    console.log("🚀 External Mines Programmator passed all advanced tests!");
  }
}

// Run the advanced tests
runAdvancedTests().catch((error) => {
  console.error("💥 Advanced test suite crashed:", error);
  process.exit(1);
});



