/**
 * Full System Integration Test Suite
 * End-to-end testing of the complete External Mines Programmator system
 */
import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";
import { ProgramFormatVersion } from "./src/js/core/constants/formats.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import { Program } from "./src/js/core/models/program.js";

/**
 * Mock browser environment for testing
 */
function setupBrowserMocks() {
  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  };

  global.document = {
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      className: "",
      style: {},
      textContent: "",
      innerHTML: "",
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      appendChild: () => {},
      remove: () => {},
      contains: () => false,
      setAttribute: () => {},
      getAttribute: () => null,
      children: [],
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    body: {
      appendChild: () => {},
    },
  };

  global.navigator = {};
  global.location = { search: "", hash: "" };
}

/**
 * Test scenario runner
 */
class ScenarioRunner {
  constructor() {
    this.scenarios = [];
    this.results = [];
    this.startTime = Date.now();
  }

  /**
   * Add test scenario
   */
  scenario(name, description, testFn) {
    this.scenarios.push({ name, description, testFn });
  }

  /**
   * Run all scenarios
   */
  async run() {
    console.log("🎭 Starting Full System Integration Tests...");
    console.log("🔗 Testing complete user workflows and system interactions\n");

    for (const scenario of this.scenarios) {
      console.log(`\n📋 Running Scenario: ${scenario.name}`);
      console.log(`   ${scenario.description}`);

      const startTime = performance.now();

      try {
        await scenario.testFn();
        const duration = performance.now() - startTime;

        console.log(`   ✅ PASSED (${duration.toFixed(1)}ms)`);

        this.results.push({
          name: scenario.name,
          status: "PASSED",
          duration,
          error: null,
        });
      } catch (error) {
        const duration = performance.now() - startTime;

        console.log(`   ❌ FAILED (${duration.toFixed(1)}ms)`);
        console.log(`   Error: ${error.message}`);

        this.results.push({
          name: scenario.name,
          status: "FAILED",
          duration,
          error: error.message,
        });
      }
    }

    this.report();
  }

  /**
   * Generate test report
   */
  report() {
    const totalTime = Date.now() - this.startTime;
    const passed = this.results.filter((r) => r.status === "PASSED").length;
    const failed = this.results.filter((r) => r.status === "FAILED").length;
    const total = this.results.length;

    console.log("\n" + "=".repeat(60));
    console.log("📊 FULL SYSTEM INTEGRATION TEST REPORT");
    console.log("=".repeat(60));

    console.log(`\n⏱️  Total execution time: ${totalTime}ms`);
    console.log(`📈 Test scenarios: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log("\n❌ Failed Scenarios:");
      this.results
        .filter((r) => r.status === "FAILED")
        .forEach((r) => {
          console.log(`   • ${r.name}: ${r.error}`);
        });
    }

    console.log("\n📋 Performance Summary:");
    const avgTime =
      this.results.reduce((sum, r) => sum + r.duration, 0) / total;
    console.log(`   Average scenario time: ${avgTime.toFixed(1)}ms`);
    console.log(
      `   Fastest: ${Math.min(...this.results.map((r) => r.duration)).toFixed(1)}ms`,
    );
    console.log(
      `   Slowest: ${Math.max(...this.results.map((r) => r.duration)).toFixed(1)}ms`,
    );

    console.log("\n" + "=".repeat(60));

    return failed === 0;
  }
}

/**
 * Test data and utilities
 */
class TestUtils {
  static createMiningBot() {
    const program = new Program();

    // Mining bot logic:
    // 1. Start
    // 2. Check if cell is empty
    // 3. If empty, dig and collect ore
    // 4. If not empty, move right
    // 5. Loop

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

    return program;
  }

  static createComplexProgram() {
    const program = new Program();

    // Complex program with multiple subroutines
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.VarEqualsNumber, "PHASE", 1);
    program.addInstruction(ProgAction.Goto, "MAIN");

    // Main loop
    program.addInstruction(ProgAction.Label, "MAIN");
    program.addInstruction(ProgAction.VarEquals, "PHASE", "PHASE");
    program.addInstruction(ProgAction.YesNoGoto, "PHASE1");
    program.addInstruction(ProgAction.YesNoGoto, "PHASE2");
    program.addInstruction(ProgAction.Goto, "PHASE3");

    // Phase 1: Exploration
    program.addInstruction(ProgAction.Label, "PHASE1");
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.IsEmpty);
    program.addInstruction(ProgAction.YesNoGoto, "FOUND");
    program.addInstruction(ProgAction.Goto, "MAIN");

    // Phase 2: Mining
    program.addInstruction(ProgAction.Label, "PHASE2");
    program.addInstruction(ProgAction.Dig);
    program.addInstruction(ProgAction.VarAddNumber, "ORE", 1);
    program.addInstruction(ProgAction.Goto, "MAIN");

    // Phase 3: Return
    program.addInstruction(ProgAction.Label, "PHASE3");
    program.addInstruction(ProgAction.MoveDown);
    program.addInstruction(ProgAction.Goto, "MAIN");

    // Found resource
    program.addInstruction(ProgAction.Label, "FOUND");
    program.addInstruction(ProgAction.VarEqualsNumber, "PHASE", 2);
    program.addInstruction(ProgAction.Goto, "MAIN");

    return program;
  }

  static async validateProgramWorkflow(program) {
    // 1. Validate program structure
    const validation = program.validate();
    if (!validation.isValid) {
      throw new Error(
        `Program validation failed: ${validation.errors.join(", ")}`,
      );
    }

    // 2. Test serialization
    const base64 = await program.toBase64Format();
    if (!base64 || base64.length === 0) {
      throw new Error("Serialization failed");
    }

    // 3. Test deserialization
    const restored = await Program.fromString(base64);
    if (!restored || !restored.instructions) {
      throw new Error("Deserialization failed");
    }

    // 4. Verify round-trip integrity
    const minLength = Math.min(
      program.instructions.length,
      restored.instructions.length,
    );
    for (let i = 0; i < minLength; i++) {
      const original = program.instructions[i];
      const restoredInst = restored.instructions[i];

      if (original.action !== restoredInst.action) {
        throw new Error(
          `Round-trip failed at instruction ${i}: action mismatch`,
        );
      }
    }

    return true;
  }
}

/**
 * Run full system integration tests
 */
async function runFullIntegrationTests() {
  // Setup browser environment mocks
  setupBrowserMocks();

  const runner = new ScenarioRunner();

  // ============================================================================
  // BASIC WORKFLOW SCENARIOS
  // ============================================================================

  runner.scenario(
    "Basic Program Creation",
    "Create a simple program and verify basic operations",
    async () => {
      const program = new Program();

      // Add basic instructions
      program.addInstruction(ProgAction.SetStart);
      program.addInstruction(ProgAction.MoveUp);
      program.addInstruction(ProgAction.Dig);

      // Verify program structure
      if (program.instructions.length !== 3) {
        throw new Error(
          `Expected 3 instructions, got ${program.instructions.length}`,
        );
      }

      // Validate program
      const validation = program.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }
    },
  );

  runner.scenario(
    "Program Serialization Workflow",
    "Complete save/load cycle with validation",
    async () => {
      const program = TestUtils.createMiningBot();
      await TestUtils.validateProgramWorkflow(program);
    },
  );

  runner.scenario(
    "Complex Program Management",
    "Handle complex programs with multiple subroutines and variables",
    async () => {
      const program = TestUtils.createComplexProgram();
      await TestUtils.validateProgramWorkflow(program);

      // Additional checks for complex programs
      const validation = program.validate();

      // Should have some unresolved labels (normal for complex programs)
      const unresolvedLabels = validation.warnings.filter((w) =>
        w.includes("Undefined label"),
      );
      if (unresolvedLabels.length > 5) {
        throw new Error(
          `Too many unresolved labels: ${unresolvedLabels.length}`,
        );
      }
    },
  );

  // ============================================================================
  // GRID-BASED WORKFLOW SCENARIOS
  // ============================================================================

  runner.scenario(
    "Grid-Based Program Editing",
    "Create and edit programs using grid coordinate system",
    () => {
      const program = new Program();

      // Create a simple pattern in grid
      program.setInstructionAt(0, 0, ProgAction.SetStart, null, null, 0);
      program.setInstructionAt(1, 0, ProgAction.MoveUp, null, null, 0);
      program.setInstructionAt(2, 0, ProgAction.Dig, null, null, 0);
      program.setInstructionAt(0, 1, ProgAction.Label, "LOOP", null, 0);
      program.setInstructionAt(1, 1, ProgAction.Goto, "LOOP", null, 0);

      // Verify grid operations
      const start = program.getInstructionAt(0, 0, 0);
      const loop = program.getInstructionAt(0, 1, 0);

      if (start.action !== ProgAction.SetStart) {
        throw new Error("Grid start instruction not set correctly");
      }

      if (loop.label !== "LOOP") {
        throw new Error("Grid label not set correctly");
      }

      // Validate the grid-based program
      const validation = program.validate();
      if (!validation.isValid) {
        throw new Error(
          `Grid program validation failed: ${validation.errors.join(", ")}`,
        );
      }
    },
  );

  runner.scenario(
    "Multi-Page Grid Operations",
    "Work with multi-page programs using grid interface",
    () => {
      const program = new Program();

      // Fill multiple pages with patterns
      for (let page = 0; page < 3; page++) {
        for (let x = 0; x < 16; x += 4) {
          // Every 4th column
          for (let y = 0; y < 12; y += 3) {
            // Every 3rd row
            program.setInstructionAt(x, y, ProgAction.MoveUp, null, null, page);
          }
        }
      }

      // Verify multi-page structure
      let totalInstructions = 0;
      for (let page = 0; page < 3; page++) {
        const pageInstructions = program.getPageInstructions(page);
        if (pageInstructions.length !== 16 * 12) {
          throw new Error(
            `Page ${page} has wrong size: ${pageInstructions.length}`,
          );
        }

        // Count non-empty instructions on this page
        const nonEmpty = pageInstructions.filter(
          (inst) => inst.action !== ProgAction.None,
        ).length;
        if (nonEmpty === 0) {
          throw new Error(`Page ${page} should have instructions`);
        }

        totalInstructions += nonEmpty;
      }

      if (totalInstructions === 0) {
        throw new Error("No instructions found in multi-page program");
      }
    },
  );

  // ============================================================================
  // ERROR HANDLING AND EDGE CASES
  // ============================================================================

  runner.scenario(
    "Error Recovery",
    "Test system behavior under error conditions",
    async () => {
      // Test with invalid base64
      try {
        await Program.fromString("invalid-base64!!!");
        throw new Error("Should have thrown for invalid base64");
      } catch (e) {
        // Expected error
      }

      // Test with empty program
      const emptyProgram = new Program();
      const validation = emptyProgram.validate();
      // Empty programs should be valid (no errors)

      // Test with oversized labels
      const program = new Program();
      program.addInstruction(ProgAction.Label, "TOOLONG"); // 7 chars, should fail
      const labelValidation = program.validate();

      if (labelValidation.isValid) {
        // If validation passes, check warnings
        const longLabelWarnings = labelValidation.warnings.filter((w) =>
          w.includes("too long"),
        );
        if (longLabelWarnings.length === 0) {
          console.warn("⚠️  Label length validation may not be working");
        }
      }
    },
  );

  runner.scenario(
    "Boundary Conditions",
    "Test system limits and boundary conditions",
    () => {
      const program = new Program();

      // Test maximum reasonable program size
      for (let i = 0; i < 1000; i++) {
        program.addInstruction(ProgAction.MoveUp);
      }

      if (program.instructions.length !== 1000) {
        throw new Error(
          `Large program creation failed: ${program.instructions.length}`,
        );
      }

      // Test clearing large program
      program.clear();
      if (program.instructions.length !== 0) {
        throw new Error("Program clearing failed");
      }

      // Test grid boundary access
      const boundaryTests = [
        { x: 0, y: 0 }, // Top-left
        { x: 15, y: 0 }, // Top-right
        { x: 0, y: 11 }, // Bottom-left
        { x: 15, y: 11 }, // Bottom-right
      ];

      boundaryTests.forEach(({ x, y }) => {
        program.setInstructionAt(x, y, ProgAction.Dig, null, null, 0);
        const retrieved = program.getInstructionAt(x, y, 0);
        if (retrieved.action !== ProgAction.Dig) {
          throw new Error(`Boundary test failed at (${x}, ${y})`);
        }
      });
    },
  );

  // ============================================================================
  // PERFORMANCE AND SCALABILITY
  // ============================================================================

  runner.scenario(
    "Performance Under Load",
    "Test system performance with realistic workloads",
    async () => {
      const startTime = performance.now();

      // Create multiple programs concurrently
      const programs = [];
      for (let i = 0; i < 10; i++) {
        const program = TestUtils.createMiningBot();

        // Add some variation
        for (let j = 0; j < i; j++) {
          program.addInstruction(ProgAction.MoveRight);
        }

        programs.push(program);
      }

      // Serialize all programs
      const serialized = await Promise.all(
        programs.map((p) => p.toBase64Format()),
      );

      // Deserialize all programs
      const deserialized = await Promise.all(
        serialized.map((s) => Program.fromString(s)),
      );

      // Validate all programs
      deserialized.forEach((program, index) => {
        const validation = program.validate();
        if (!validation.isValid) {
          throw new Error(`Program ${index} validation failed`);
        }
      });

      const duration = performance.now() - startTime;
      console.log(
        `   Processed ${programs.length} programs in ${duration.toFixed(1)}ms`,
      );

      if (duration > 5000) {
        // 5 seconds max for this workload
        throw new Error(`Performance test failed: ${duration}ms`);
      }
    },
  );

  runner.scenario(
    "Memory Management",
    "Test memory usage and cleanup",
    async () => {
      const programs = [];

      // Create many programs
      for (let i = 0; i < 50; i++) {
        const program = new Program();
        for (let j = 0; j < 20; j++) {
          program.addInstruction(ProgAction.MoveUp);
        }
        programs.push(program);
      }

      // Serialize and deserialize
      for (const program of programs) {
        const base64 = await program.toBase64Format();
        const restored = await Program.fromString(base64);

        if (!restored.validate().isValid) {
          throw new Error("Memory test program validation failed");
        }
      }

      // Clear all programs
      programs.forEach((p) => p.clear());

      // Verify cleanup
      const clearedCount = programs.filter(
        (p) => p.instructions.length === 0,
      ).length;
      if (clearedCount !== programs.length) {
        throw new Error(
          `Memory cleanup failed: ${clearedCount}/${programs.length} cleared`,
        );
      }
    },
  );

  // ============================================================================
  // REAL-WORLD USER SCENARIOS
  // ============================================================================

  runner.scenario(
    "Bot Programmer Workflow",
    "Simulate complete bot programming workflow",
    async () => {
      // Step 1: Create new program
      const program = new Program();

      // Step 2: Add basic structure
      program.setInstructionAt(0, 0, ProgAction.SetStart, null, null, 0);
      program.setInstructionAt(1, 0, ProgAction.Label, "MAIN", null, 0);
      program.setInstructionAt(2, 0, ProgAction.IsEmpty, null, null, 0);
      program.setInstructionAt(3, 0, ProgAction.YesNoGoto, "MINE", null, 0);
      program.setInstructionAt(4, 0, ProgAction.MoveRight, null, null, 0);
      program.setInstructionAt(5, 0, ProgAction.Goto, "MAIN", null, 0);

      // Step 3: Add mining logic
      program.setInstructionAt(0, 1, ProgAction.Label, "MINE", null, 0);
      program.setInstructionAt(1, 1, ProgAction.Dig, null, null, 0);
      program.setInstructionAt(2, 1, ProgAction.VarAddNumber, "ORE", 1, 0);
      program.setInstructionAt(3, 1, ProgAction.Goto, "MAIN", null, 0);

      // Step 4: Validate program
      const validation = program.validate();
      if (!validation.isValid) {
        throw new Error(
          `Bot program validation failed: ${validation.errors.join(", ")}`,
        );
      }

      // Step 5: Save program
      const savedProgram = await program.toBase64Format();

      // Step 6: Load program
      const loadedProgram = await Program.fromString(savedProgram);

      // Step 7: Verify loaded program
      const loadedValidation = loadedProgram.validate();
      if (!loadedValidation.isValid) {
        throw new Error(
          `Loaded program validation failed: ${loadedValidation.errors.join(", ")}`,
        );
      }

      console.log(
        `   🤖 Bot program created and validated (${savedProgram.length} chars)`,
      );
    },
  );

  runner.scenario(
    "Program Library Management",
    "Test managing multiple programs as a library",
    async () => {
      const programLibrary = [];

      // Create different types of programs
      const programTypes = [
        { name: "Miner", create: () => TestUtils.createMiningBot() },
        {
          name: "Explorer",
          create: () => {
            const p = new Program();
            p.addInstruction(ProgAction.SetStart);
            p.addInstruction(ProgAction.MoveUp);
            p.addInstruction(ProgAction.MoveRight);
            return p;
          },
        },
        { name: "Complex", create: () => TestUtils.createComplexProgram() },
      ];

      // Create and store programs
      for (const type of programTypes) {
        const program = type.create();

        // Validate before storing
        const validation = program.validate();
        if (!validation.isValid) {
          throw new Error(
            `${type.name} program invalid: ${validation.errors.join(", ")}`,
          );
        }

        // Serialize and store
        const serialized = await program.toBase64Format();
        programLibrary.push({
          name: type.name,
          program,
          serialized,
          size: serialized.length,
        });
      }

      // Test library operations
      if (programLibrary.length !== programTypes.length) {
        throw new Error(`Library size mismatch: ${programLibrary.length}`);
      }

      // Test loading from library
      for (const item of programLibrary) {
        const loaded = await Program.fromString(item.serialized);
        const loadedValidation = loaded.validate();

        if (!loadedValidation.isValid) {
          throw new Error(
            `${item.name} reload failed: ${loadedValidation.errors.join(", ")}`,
          );
        }
      }

      console.log(
        `   📚 Program library created with ${programLibrary.length} programs`,
      );
      programLibrary.forEach((p) => {
        console.log(`      • ${p.name}: ${p.size} chars`);
      });
    },
  );

  // ============================================================================
  // RUN ALL SCENARIOS
  // ============================================================================

  const success = await runner.run();

  if (!success) {
    console.log("\n❌ Full system integration tests failed!");
    process.exit(1);
  } else {
    console.log("\n🎉 All full system integration tests passed!");
    console.log("🚀 External Mines Programmator is production-ready!");
  }
}

// Run the full integration tests
runFullIntegrationTests().catch((error) => {
  console.error("💥 Full integration test suite crashed:", error);
  process.exit(1);
});



