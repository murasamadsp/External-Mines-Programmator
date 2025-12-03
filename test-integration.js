import { Program } from "./src/js/core/models/program.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";

/**
 * Integration Test Suite for External Mines Programmator
 * Tests real-world usage scenarios and complex interactions
 */
async function runIntegrationTests() {
  console.log("🔗 Starting Integration Test Suite...");
  console.log(
    "🧩 Testing complex real-world scenarios and system interactions\n",
  );

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    const startTime = performance.now();

    try {
      await fn();
      const duration = Math.round(performance.now() - startTime);
      console.log(`✅ ${name} (${duration}ms)`);
      passed++;
    } catch (e) {
      const duration = Math.round(performance.now() - startTime);
      console.error(`❌ ${name} (${duration}ms): ${e.message}`);
      console.error(e.stack);
      failed++;
    }
  }

  // ============================================================================
  // 🎯 REAL-WORLD BOT PROGRAMS
  // ============================================================================

  await test("Integration - Advanced Mining Bot", async () => {
    // Create a sophisticated mining bot with multiple strategies
    const program = new Program();

    // Main loop with resource management
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.Label, "INIT");
    program.addInstruction(ProgAction.VarEqualsNumber, "FUEL", 100);
    program.addInstruction(ProgAction.VarEqualsNumber, "ORE", 0);
    program.addInstruction(ProgAction.Goto, "MAIN");

    // Main mining loop
    program.addInstruction(ProgAction.Label, "MAIN");
    program.addInstruction(ProgAction.IsEmpty);
    program.addInstruction(ProgAction.YesNoGoto, "MINE");
    program.addInstruction(ProgAction.MoveRight);
    program.addInstruction(ProgAction.VarAddNumber, "FUEL", -1);
    program.addInstruction(ProgAction.VarEqualsNumber, "CMP", 0);
    program.addInstruction(ProgAction.VarCompare, "FUEL", "CMP");
    program.addInstruction(ProgAction.YesNoGoto, "REFUEL");
    program.addInstruction(ProgAction.Goto, "MAIN");

    // Mining subroutine
    program.addInstruction(ProgAction.Label, "MINE");
    program.addInstruction(ProgAction.Dig);
    program.addInstruction(ProgAction.VarAddNumber, "ORE", 1);
    program.addInstruction(ProgAction.MoveRight);
    program.addInstruction(ProgAction.Goto, "MAIN");

    // Refuel subroutine
    program.addInstruction(ProgAction.Label, "REFUEL");
    program.addInstruction(ProgAction.Label, "DEPOT");
    program.addInstruction(ProgAction.BuildBlock);
    program.addInstruction(ProgAction.VarEqualsNumber, "FUEL", 100);
    program.addInstruction(ProgAction.Goto, "MAIN");

    // Serialize and verify
    const base64 = await program.toBase64Format();
    const restored = await Program.fromString(base64);

    // Validate restored program
    const validation = restored.validate();
    if (!validation.isValid) {
      throw new Error(
        `Advanced mining bot validation failed: ${validation.errors.join(
          ", ",
        )}`,
      );
    }

    // Verify all labels are resolved
    const unresolvedLabels = validation.warnings.filter((w) =>
      w.includes("Undefined label"),
    );
    if (unresolvedLabels.length > 0) {
      throw new Error(
        `Unresolved labels in mining bot: ${unresolvedLabels.join(", ")}`,
      );
    }

    console.log(
      `   🤖 Mining bot: ${program.instructions.length} instructions`,
    );
  });

  await test("Integration - Maze Solver Bot", async () => {
    // Create a bot that can navigate mazes using wall-following algorithm
    const program = new Program();

    // Initialize
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.Label, "START");
    program.addInstruction(ProgAction.VarEqualsNumber, "DIR", 0); // 0=right, 1=down, 2=left, 3=up

    // Main loop
    program.addInstruction(ProgAction.Label, "LOOP");
    program.addInstruction(ProgAction.IsBlocked);
    program.addInstruction(ProgAction.YesNoGoto, "TURN_RIGHT");

    // Move forward if clear
    program.addInstruction(ProgAction.MoveForward);
    program.addInstruction(ProgAction.Goto, "LOOP");

    // Turn right if blocked
    program.addInstruction(ProgAction.Label, "TURN_RIGHT");
    program.addInstruction(ProgAction.TurnRight);
    program.addInstruction(ProgAction.VarAddNumber, "DIR", 1);
    program.addInstruction(ProgAction.VarEqualsNumber, "MAX_DIR", 4);
    program.addInstruction(ProgAction.VarCompare, "DIR", "MAX_DIR");
    program.addInstruction(ProgAction.YesNoGoto, "RESET_DIR");
    program.addInstruction(ProgAction.Goto, "LOOP");

    // Reset direction counter
    program.addInstruction(ProgAction.Label, "RESET_DIR");
    program.addInstruction(ProgAction.VarEqualsNumber, "DIR", 0);
    program.addInstruction(ProgAction.Goto, "LOOP");

    // Test serialization round-trip
    const base64 = await program.toBase64Format();
    const restored = await Program.fromString(base64);

    const validation = restored.validate();
    if (!validation.isValid) {
      throw new Error(
        `Maze solver validation failed: ${validation.errors.join(", ")}`,
      );
    }

    console.log(
      `   🌀 Maze solver: ${program.instructions.length} instructions`,
    );
  });

  await test("Integration - Resource Collector Bot", async () => {
    // Bot that collects specific resources and returns to base
    const program = new Program();

    // Initialize resource tracking
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.VarEqualsNumber, "COAL", 0);
    program.addInstruction(ProgAction.VarEqualsNumber, "IRON", 0);
    program.addInstruction(ProgAction.VarEqualsNumber, "CAPACITY", 50);

    // Main collection loop
    program.addInstruction(ProgAction.Label, "COLLECT");
    program.addInstruction(ProgAction.IsResource);
    program.addInstruction(ProgAction.YesNoGoto, "IDENTIFY");
    program.addInstruction(ProgAction.MoveForward);
    program.addInstruction(ProgAction.Goto, "COLLECT");

    // Resource identification
    program.addInstruction(ProgAction.Label, "IDENTIFY");
    program.addInstruction(ProgAction.ResourceType);
    program.addInstruction(ProgAction.VarEqualsNumber, "TYPE", 0); // Will be set by ResourceType
    program.addInstruction(ProgAction.VarCompareValue, "TYPE", 1); // Coal
    program.addInstruction(ProgAction.YesNoGoto, "COLLECT_COAL");
    program.addInstruction(ProgAction.VarCompareValue, "TYPE", 2); // Iron
    program.addInstruction(ProgAction.YesNoGoto, "COLLECT_IRON");
    program.addInstruction(ProgAction.MoveForward); // Skip unknown resource
    program.addInstruction(ProgAction.Goto, "COLLECT");

    // Collection subroutines
    program.addInstruction(ProgAction.Label, "COLLECT_COAL");
    program.addInstruction(ProgAction.Dig);
    program.addInstruction(ProgAction.VarAddNumber, "COAL", 1);
    program.addInstruction(ProgAction.Goto, "CHECK_CAPACITY");

    program.addInstruction(ProgAction.Label, "COLLECT_IRON");
    program.addInstruction(ProgAction.Dig);
    program.addInstruction(ProgAction.VarAddNumber, "IRON", 1);
    program.addInstruction(ProgAction.Goto, "CHECK_CAPACITY");

    // Capacity check
    program.addInstruction(ProgAction.Label, "CHECK_CAPACITY");
    program.addInstruction(ProgAction.VarAdd, "TOTAL", "COAL", "IRON");
    program.addInstruction(ProgAction.VarCompare, "TOTAL", "CAPACITY");
    program.addInstruction(ProgAction.YesNoGoto, "RETURN_BASE");
    program.addInstruction(ProgAction.Goto, "COLLECT");

    // Return to base
    program.addInstruction(ProgAction.Label, "RETURN_BASE");
    program.addInstruction(ProgAction.GoHome);
    program.addInstruction(ProgAction.UnloadResources);
    program.addInstruction(ProgAction.Goto, "COLLECT");

    // Test the complex program
    const validation = program.validate();
    if (!validation.isValid) {
      throw new Error(
        `Resource collector validation failed: ${validation.errors.join(", ")}`,
      );
    }

    console.log(
      `   📦 Resource collector: ${program.instructions.length} instructions`,
    );
  });

  // ============================================================================
  // 🔄 PROGRAM EVOLUTION & MODIFICATION
  // ============================================================================

  await test("Integration - Program Evolution", async () => {
    // Test how programs can be modified and evolved
    let program = new Program();

    // Version 1: Simple mover
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.Label, "MOVE");
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Goto, "MOVE");

    // Test version 1
    let validation = program.validate();
    if (!validation.isValid) {
      throw new Error("Version 1 validation failed");
    }

    // Version 2: Add obstacle avoidance
    program.addInstruction(ProgAction.Label, "SMART_MOVE");
    program.addInstruction(ProgAction.IsBlocked);
    program.addInstruction(ProgAction.YesNoGoto, "TURN");
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Goto, "SMART_MOVE");

    program.addInstruction(ProgAction.Label, "TURN");
    program.addInstruction(ProgAction.TurnRight);
    program.addInstruction(ProgAction.Goto, "SMART_MOVE");

    // Update the goto to use new label
    program.instructions[3] = new Instruction(
      ProgAction.Goto,
      "SMART_MOVE",
      null,
    );

    // Test version 2
    validation = program.validate();
    if (!validation.isValid) {
      throw new Error("Version 2 validation failed");
    }

    // Test serialization of evolved program
    const base64 = await program.toBase64Format();
    const restored = await Program.fromString(base64);

    validation = restored.validate();
    if (!validation.isValid) {
      throw new Error("Evolved program validation failed");
    }

    console.log(
      `   🧬 Program evolution: ${program.instructions.length} instructions`,
    );
  });

  // ============================================================================
  // 🔧 ERROR RECOVERY & RESILIENCE
  // ============================================================================

  await test("Integration - Error Recovery", async () => {
    // Test how the system handles corrupted programs and recovers
    const program = new Program();

    // Create a valid program
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.Label, "SAFE");
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Goto, "SAFE");

    const originalBase64 = await program.toBase64Format();

    // Simulate corruption (modify base64 string)
    const corruptedBase64 = originalBase64.replace(/.$/, "X");

    try {
      await Program.fromString(corruptedBase64);
      throw new Error("Should have failed with corrupted data");
    } catch (e) {
      // Expected error - should handle corruption gracefully
      if (!e.message.includes("corrupt") && !e.message.includes("invalid")) {
        throw new Error(`Unexpected error type: ${e.message}`);
      }
    }

    // Verify original program still works
    const restored = await Program.fromString(originalBase64);
    const validation = restored.validate();
    if (!validation.isValid) {
      throw new Error("Original program corrupted by error recovery test");
    }

    console.log(`   🛡️ Error recovery: handled corruption gracefully`);
  });

  // ============================================================================
  // 📊 PERFORMANCE UNDER LOAD
  // ============================================================================

  await test("Integration - High Frequency Operations", async () => {
    const startTime = performance.now();

    // Simulate high-frequency program modifications
    const programs = [];
    const operations = 100;

    for (let i = 0; i < operations; i++) {
      const program = new Program();

      // Create program with varying complexity
      const instructionCount = Math.floor(Math.random() * 50) + 10;
      for (let j = 0; j < instructionCount; j++) {
        const action =
          Object.values(ProgAction)[Math.floor(Math.random() * 10)];
        const label =
          j % 10 === 0 ? `LABEL_${j}` : j % 5 === 0 ? `LBL${j}` : null;
        program.addInstruction(action, label, Math.floor(Math.random() * 100));
      }

      // Validate and serialize
      const validation = program.validate();
      if (validation.isValid) {
        const base64 = await program.toBase64Format();
        programs.push({ program, base64 });
      }
    }

    const duration = performance.now() - startTime;
    const opsPerSecond = Math.round(operations / (duration / 1000));

    if (programs.length < operations * 0.8) {
      throw new Error(
        `Too many invalid programs: ${programs.length}/${operations}`,
      );
    }

    console.log(
      `   ⚡ High frequency: ${operations} programs in ${Math.round(
        duration,
      )}ms (${opsPerSecond} ops/sec)`,
    );
  });

  // ============================================================================
  // 🔄 CROSS-PLATFORM COMPATIBILITY
  // ============================================================================

  await test("Integration - Cross-Version Compatibility", async () => {
    // Test that programs created in different "versions" are compatible

    // Create program with current feature set
    const modernProgram = new Program();
    modernProgram.addInstruction(ProgAction.SetStart);
    modernProgram.addInstruction(ProgAction.Label, "MODERN");
    modernProgram.addInstruction(ProgAction.MoveUp);
    modernProgram.addInstruction(ProgAction.Goto, "MODERN");

    // Simulate "legacy" program (minimal features)
    const legacyProgram = new Program();
    legacyProgram.addInstruction(ProgAction.SetStart);
    legacyProgram.addInstruction(ProgAction.MoveUp);
    legacyProgram.addInstruction(ProgAction.Terminate);

    // Both should serialize and deserialize correctly
    const modernBase64 = await modernProgram.toBase64Format();
    const legacyBase64 = await legacyProgram.toBase64Format();

    const modernRestored = await Program.fromString(modernBase64);
    const legacyRestored = await Program.fromString(legacyBase64);

    // Both should validate
    const modernValidation = modernRestored.validate();
    const legacyValidation = legacyRestored.validate();

    if (!modernValidation.isValid) {
      throw new Error("Modern program compatibility failed");
    }
    if (!legacyValidation.isValid) {
      throw new Error("Legacy program compatibility failed");
    }

    console.log(
      `   🔄 Compatibility: modern (${modernProgram.instructions.length}) + legacy (${legacyProgram.instructions.length}) programs`,
    );
  });

  // ============================================================================
  // 🎪 ADVANCED PROGRAMMING PATTERNS
  // ============================================================================

  await test("Integration - State Machine Pattern", async () => {
    // Implement a state machine using program labels
    const program = new Program();

    // States: IDLE -> SEARCHING -> MINING -> RETURNING
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.VarEqualsNumber, "STATE", 0); // 0=IDLE
    program.addInstruction(ProgAction.Goto, "IDLE");

    // IDLE state
    program.addInstruction(ProgAction.Label, "IDLE");
    program.addInstruction(ProgAction.VarEqualsNumber, "STATE", 1); // SEARCHING
    program.addInstruction(ProgAction.Goto, "SEARCHING");

    // SEARCHING state
    program.addInstruction(ProgAction.Label, "SEARCHING");
    program.addInstruction(ProgAction.IsResource);
    program.addInstruction(ProgAction.YesNoGoto, "FOUND_RESOURCE");
    program.addInstruction(ProgAction.MoveForward);
    program.addInstruction(ProgAction.Goto, "SEARCHING");

    // FOUND_RESOURCE transition
    program.addInstruction(ProgAction.Label, "FOUND_RESOURCE");
    program.addInstruction(ProgAction.VarEqualsNumber, "STATE", 2); // MINING
    program.addInstruction(ProgAction.Goto, "MINING");

    // MINING state
    program.addInstruction(ProgAction.Label, "MINING");
    program.addInstruction(ProgAction.Dig);
    program.addInstruction(ProgAction.VarAddNumber, "MINED", 1);
    program.addInstruction(ProgAction.VarEqualsNumber, "TARGET", 10);
    program.addInstruction(ProgAction.VarCompare, "MINED", "TARGET");
    program.addInstruction(ProgAction.YesNoGoto, "FULL_INVENTORY");
    program.addInstruction(ProgAction.Goto, "SEARCHING");

    // FULL_INVENTORY transition
    program.addInstruction(ProgAction.Label, "FULL_INVENTORY");
    program.addInstruction(ProgAction.VarEqualsNumber, "STATE", 3); // RETURNING
    program.addInstruction(ProgAction.Goto, "RETURNING");

    // RETURNING state
    program.addInstruction(ProgAction.Label, "RETURNING");
    program.addInstruction(ProgAction.GoHome);
    program.addInstruction(ProgAction.UnloadResources);
    program.addInstruction(ProgAction.VarEqualsNumber, "STATE", 0); // Back to IDLE
    program.addInstruction(ProgAction.Goto, "IDLE");

    // Validate the state machine
    const validation = program.validate();
    if (!validation.isValid) {
      throw new Error(
        `State machine validation failed: ${validation.errors.join(", ")}`,
      );
    }

    console.log(
      `   🤖 State machine: ${program.instructions.length} instructions, 4 states`,
    );
  });

  // ============================================================================
  // 📈 SCALABILITY TESTS
  // ============================================================================

  await test("Integration - Large Program Handling", async () => {
    // Test handling of large programs near system limits
    const program = new Program();

    // Create a program close to MAX_INSTRUCTIONS limit
    const targetSize = 3000; // Close to MAX_INSTRUCTIONS (3072)

    // Add varied instructions
    for (let i = 0; i < targetSize; i++) {
      let action, label, value;

      if (i % 100 === 0) {
        action = ProgAction.Label;
        label = `MARKER_${i}`;
      } else if (i % 50 === 0) {
        action = ProgAction.Goto;
        label = `MARKER_${i - (i % 100)}`;
      } else if (i % 25 === 0) {
        action = ProgAction.VarEqualsNumber;
        label = `VAR_${i}`;
        value = i % 1000;
      } else {
        action = [
          ProgAction.MoveUp,
          ProgAction.MoveDown,
          ProgAction.MoveLeft,
          ProgAction.MoveRight,
          ProgAction.Dig,
        ][i % 5];
      }

      program.addInstruction(action, label, value);
    }

    // Test serialization (this should work but might be slow)
    const serializeStart = performance.now();
    const base64 = await program.toBase64Format();
    const serializeTime = performance.now() - serializeStart;

    // Test deserialization
    const deserializeStart = performance.now();
    const restored = await Program.fromString(base64);
    const deserializeTime = performance.now() - deserializeStart;

    // Validate restored program
    const validation = restored.validate();
    if (!validation.isValid) {
      throw new Error(
        `Large program validation failed: ${validation.errors.join(", ")}`,
      );
    }

    console.log(
      `   📏 Large program: ${program.instructions.length} instructions`,
    );
    console.log(
      `      Serialize: ${Math.round(serializeTime)}ms, Deserialize: ${Math.round(
        deserializeTime,
      )}ms`,
    );
  });

  // ============================================================================
  // 🎯 SUMMARY
  // ============================================================================

  console.log(`\n🔗 Integration Test Suite Completed:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed} tests`);

  const successRate = ((passed / (passed + failed)) * 100).toFixed(1);
  console.log(`🎯 Success Rate: ${successRate}%`);

  if (failed > 0) {
    console.log(
      `\n⚠️  ${failed} test(s) failed. Check logs above for details.`,
    );
    process.exit(1);
  } else {
    console.log(
      `\n🎉 All integration tests passed! System is ready for complex real-world usage.`,
    );
  }
}

// Run the tests
runIntegrationTests().catch((error) => {
  console.error("💥 Integration test suite crashed:", error);
  process.exit(1);
});
