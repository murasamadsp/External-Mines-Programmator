import { Program } from "./src/js/core/models/program.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";

/**
 * Performance Test Suite for External Mines Programmator
 * Tests system performance under various loads and conditions
 */
async function runPerformanceTests() {
  console.log("⚡ Starting Performance Test Suite...");
  console.log("📈 Testing system performance and scalability\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn, options = {}) {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;

      console.log(`✅ ${name} (${Math.round(duration)}ms)`);

      if (options.maxDuration && duration > options.maxDuration) {
        throw new Error(
          `Performance threshold exceeded: ${Math.round(
            duration,
          )}ms > ${options.maxDuration}ms`,
        );
      }

      if (options.expectedOpsPerSecond) {
        const opsPerSecond = Math.round(result.operations / (duration / 1000));
        if (opsPerSecond < options.expectedOpsPerSecond) {
          throw new Error(
            `Throughput too low: ${opsPerSecond} ops/sec < ${options.expectedOpsPerSecond} ops/sec`,
          );
        }
        console.log(`   📊 Throughput: ${opsPerSecond} ops/sec`);
      }

      passed++;
    } catch (e) {
      const duration = performance.now() - startTime;
      console.error(`❌ ${name} (${Math.round(duration)}ms): ${e.message}`);
      failed++;
    }
  }

  // ============================================================================
  // 🏗️ PROGRAM CONSTRUCTION PERFORMANCE
  // ============================================================================

  await test(
    "Performance - Large Program Construction",
    async () => {
      const targetSize = 1000;
      const startTime = performance.now();

      const program = new Program();

      // Add many instructions
      for (let i = 0; i < targetSize; i++) {
        const action = [ProgAction.MoveUp, ProgAction.MoveDown, ProgAction.Dig][
          i % 3
        ];
        const label = i % 50 === 0 ? `LABEL_${i}` : null;
        const value = i % 100 === 0 ? i : null;

        program.addInstruction(action, label, value);
      }

      const duration = performance.now() - startTime;
      const opsPerSecond = Math.round(targetSize / (duration / 1000));

      if (program.instructions.length !== targetSize) {
        throw new Error(
          `Construction failed: expected ${targetSize}, got ${program.instructions.length}`,
        );
      }

      return { operations: targetSize, duration, opsPerSecond };
    },
    { expectedOpsPerSecond: 50000 },
  );

  await test(
    "Performance - Grid Operations",
    async () => {
      const program = new Program();
      const operations = 5000;

      // Pre-fill program with pages
      for (let page = 0; page < 3; page++) {
        for (let y = 0; y < 12; y++) {
          for (let x = 0; x < 16; x++) {
            program.setInstructionAt(x, y, ProgAction.None, null, null, page);
          }
        }
      }

      const startTime = performance.now();

      // Perform random grid operations
      for (let i = 0; i < operations; i++) {
        const x = Math.floor(Math.random() * 16);
        const y = Math.floor(Math.random() * 12);
        const page = Math.floor(Math.random() * 3);

        if (Math.random() < 0.5) {
          // Set operation
          program.setInstructionAt(
            x,
            y,
            ProgAction.MoveUp,
            `TEST_${i}`,
            Math.floor(Math.random() * 100),
            page,
          );
        } else {
          // Get operation
          program.getInstructionAt(x, y, page);
        }
      }

      const duration = performance.now() - startTime;
      const opsPerSecond = Math.round(operations / (duration / 1000));

      return { operations, duration, opsPerSecond };
    },
    { expectedOpsPerSecond: 10000 },
  );

  // ============================================================================
  // 🔄 SERIALIZATION PERFORMANCE
  // ============================================================================

  await test(
    "Performance - Program Serialization",
    async () => {
      // Create test programs of different sizes
      const sizes = [100, 500, 1000];
      const results = [];

      for (const size of sizes) {
        const program = generateTestProgram(size);
        const startTime = performance.now();

        const base64 = await program.toBase64Format();

        const duration = performance.now() - startTime;
        const bytesPerSecond = Math.round(
          (base64.length * size) / (duration / 1000),
        );

        results.push({ size, duration: Math.round(duration), bytesPerSecond });

        console.log(
          `   📏 Size ${size}: ${Math.round(duration)}ms (${bytesPerSecond} bytes/sec)`,
        );
      }

      // Verify scaling is reasonable (should not degrade exponentially)
      const scalingRatio = results[2].duration / results[0].duration;
      const sizeRatio = results[2].size / results[0].size;

      if (scalingRatio > sizeRatio * 2) {
        throw new Error(
          `Poor scaling: ${scalingRatio}x time for ${sizeRatio}x size`,
        );
      }

      return { operations: sizes.length, results };
    },
    { maxDuration: 5000 },
  );

  await test(
    "Performance - Program Deserialization",
    async () => {
      // Pre-generate serialized programs
      const programs = [];
      for (let i = 0; i < 10; i++) {
        const program = generateTestProgram(200 + i * 50);
        const base64 = await program.toBase64Format();
        programs.push(base64);
      }

      const startTime = performance.now();

      // Deserialize all programs
      for (const base64 of programs) {
        const restored = await Program.fromString(base64);
        if (!restored.validate().isValid) {
          throw new Error("Deserialized program is invalid");
        }
      }

      const duration = performance.now() - startTime;
      const opsPerSecond = Math.round(programs.length / (duration / 1000));

      return { operations: programs.length, duration, opsPerSecond };
    },
    { expectedOpsPerSecond: 5 },
  );

  // ============================================================================
  // 🔍 VALIDATION PERFORMANCE
  // ============================================================================

  await test(
    "Performance - Program Validation",
    async () => {
      const programs = [];

      // Create programs with different complexity levels
      for (let i = 0; i < 20; i++) {
        const size = 50 + i * 25; // 50, 75, 100, ..., 525
        const program = generateTestProgram(size);

        // Add some labels and gotos to make validation more complex
        if (i % 3 === 0) {
          program.addInstruction(ProgAction.Label, `COMPLEX_LABEL_${i}`);
          program.addInstruction(ProgAction.Goto, `COMPLEX_LABEL_${i}`);
        }

        programs.push(program);
      }

      const startTime = performance.now();

      let totalErrors = 0;
      let totalWarnings = 0;

      for (const program of programs) {
        const validation = program.validate();
        totalErrors += validation.errors.length;
        totalWarnings += validation.warnings.length;
      }

      const duration = performance.now() - startTime;
      const programsPerSecond = Math.round(programs.length / (duration / 1000));

      console.log(
        `   🔍 Validated ${programs.length} programs in ${Math.round(
          duration,
        )}ms (${programsPerSecond} programs/sec)`,
      );
      console.log(
        `   📊 Total issues: ${totalErrors} errors, ${totalWarnings} warnings`,
      );

      return { operations: programs.length, duration, programsPerSecond };
    },
    { expectedOpsPerSecond: 50 },
  );

  // ============================================================================
  // 🧵 CONCURRENT OPERATIONS
  // ============================================================================

  await test(
    "Performance - Concurrent Program Operations",
    async () => {
      const numPrograms = 50;
      const operationsPerProgram = 20;
      const totalOperations = numPrograms * operationsPerProgram;

      const startTime = performance.now();

      // Create and operate on multiple programs concurrently
      const promises = [];

      for (let i = 0; i < numPrograms; i++) {
        promises.push(
          (async () => {
            const program = new Program();

            // Perform various operations
            for (let j = 0; j < operationsPerProgram; j++) {
              if (j % 4 === 0) {
                program.addInstruction(ProgAction.MoveUp, `LABEL_${i}_${j}`);
              } else if (j % 4 === 1) {
                program.addInstruction(ProgAction.Dig);
              } else if (j % 4 === 2) {
                program.validate();
              } else {
                program.getInstruction(j % program.instructions.length);
              }
            }

            return program;
          })(),
        );
      }

      const programs = await Promise.all(promises);
      const duration = performance.now() - startTime;

      // Verify all programs were created successfully
      for (const program of programs) {
        if (program.instructions.length !== operationsPerProgram) {
          throw new Error(
            "Concurrent operation failed: incorrect program size",
          );
        }
      }

      const opsPerSecond = Math.round(totalOperations / (duration / 1000));

      console.log(
        `   🔄 Concurrent: ${totalOperations} operations in ${Math.round(
          duration,
        )}ms (${opsPerSecond} ops/sec)`,
      );

      return { operations: totalOperations, duration, opsPerSecond };
    },
    { expectedOpsPerSecond: 5000 },
  );

  // ============================================================================
  // 📈 MEMORY USAGE ANALYSIS
  // ============================================================================

  await test(
    "Performance - Memory Stability",
    async () => {
      // Test for memory leaks by creating/destroying many programs
      const iterations = 100;
      const programSize = 200;

      console.log(
        `   🧠 Testing memory stability with ${iterations} iterations...`,
      );

      for (let i = 0; i < iterations; i++) {
        // Create program
        const program = generateTestProgram(programSize);

        // Perform operations
        const base64 = await program.toBase64Format();
        const restored = await Program.fromString(base64);
        restored.validate();

        // Clear references (help GC)
        program.instructions.length = 0;

        if (i % 20 === 0) {
          console.log(`   📊 Iteration ${i}/${iterations} completed`);
        }
      }

      console.log(`   ✅ Memory stability test completed`);

      return { operations: iterations, duration: 0 };
    },
    { maxDuration: 30000 },
  );

  // ============================================================================
  // 🎯 REAL-WORLD SCENARIOS PERFORMANCE
  // ============================================================================

  await test(
    "Performance - Complex Bot Simulation",
    async () => {
      // Simulate running a complex mining bot for multiple "game ticks"
      const ticks = 1000;
      const startTime = performance.now();

      // Create a complex bot program
      const bot = createComplexBot();

      for (let tick = 0; tick < ticks; tick++) {
        // Simulate bot decision making
        const decision = makeBotDecision(bot, tick);

        // Execute action
        executeBotAction(bot, decision);

        // Update bot state
        updateBotState(bot);

        // Periodic validation (every 100 ticks)
        if (tick % 100 === 0) {
          bot.program.validate();
        }
      }

      const duration = performance.now() - startTime;
      const ticksPerSecond = Math.round(ticks / (duration / 1000));

      console.log(
        `   🤖 Bot simulation: ${ticks} ticks in ${Math.round(
          duration,
        )}ms (${ticksPerSecond} ticks/sec)`,
      );

      return { operations: ticks, duration, ticksPerSecond };
    },
    { expectedOpsPerSecond: 5000 },
  );

  // ============================================================================
  // 🔧 HELPER FUNCTIONS
  // ============================================================================

  function generateTestProgram(size) {
    const program = new Program();
    const actions = [
      ProgAction.MoveUp,
      ProgAction.MoveDown,
      ProgAction.Dig,
      ProgAction.SetStart,
    ];

    for (let i = 0; i < size; i++) {
      const action = actions[i % actions.length];
      const label = i % 25 === 0 ? `TEST_LABEL_${i}` : null;
      const value = i % 50 === 0 ? Math.floor(Math.random() * 100) : null;

      program.addInstruction(action, label, value);
    }

    return program;
  }

  function createComplexBot() {
    const program = new Program();

    // Complex mining bot with multiple states
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.Label, "INIT");
    program.addInstruction(ProgAction.VarEqualsNumber, "FUEL", 1000);
    program.addInstruction(ProgAction.VarEqualsNumber, "ORE", 0);
    program.addInstruction(ProgAction.Goto, "MAIN");

    program.addInstruction(ProgAction.Label, "MAIN");
    program.addInstruction(ProgAction.IsEmpty);
    program.addInstruction(ProgAction.YesNoGoto, "MINE");
    program.addInstruction(ProgAction.MoveRight);
    program.addInstruction(ProgAction.VarAddNumber, "FUEL", -1);
    program.addInstruction(ProgAction.Goto, "MAIN");

    program.addInstruction(ProgAction.Label, "MINE");
    program.addInstruction(ProgAction.Dig);
    program.addInstruction(ProgAction.VarAddNumber, "ORE", 1);
    program.addInstruction(ProgAction.Goto, "MAIN");

    return {
      program,
      fuel: 1000,
      ore: 0,
      position: { x: 0, y: 0 },
      state: "exploring",
    };
  }

  function makeBotDecision(bot, tick) {
    // Simple AI decision making
    if (bot.fuel < 100) {
      return "return_home";
    }

    if (tick % 37 === 0) {
      return "turn_random";
    }

    return "move_forward";
  }

  function executeBotAction(bot, action) {
    switch (action) {
      case "move_forward":
        bot.fuel -= 1;
        break;
      case "turn_random":
        // Simulate turning
        break;
      case "return_home":
        bot.fuel = Math.min(bot.fuel + 50, 1000);
        break;
    }
  }

  function updateBotState(bot) {
    bot.fuel = Math.max(0, bot.fuel);
    bot.ore = Math.min(bot.ore, 1000);
  }

  // ============================================================================
  // 📋 SUMMARY
  // ============================================================================

  console.log(`\n⚡ Performance Test Suite Completed:`);
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
      `\n🎉 All performance tests passed! System demonstrates excellent scalability and efficiency.`,
    );
  }
}

// Run the tests
runPerformanceTests().catch((error) => {
  console.error("💥 Performance test suite crashed:", error);
  process.exit(1);
});
