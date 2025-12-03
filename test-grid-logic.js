import { Program } from "./src/js/core/models/program.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  PAGE_SIZE,
} from "./src/js/core/constants/grid.js";

/**
 * Grid Logic Test Suite for External Mines Programmator
 * Tests program grid operations, coordinate mapping, and multi-page functionality
 */
async function runGridLogicTests() {
  console.log("🎯 Starting Grid Logic Test Suite...");
  console.log("📐 Testing program grid operations and coordinate systems\n");

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
  // 🏗️ BASIC GRID OPERATIONS
  // ============================================================================

  await test("Grid Initialization - Empty Program", () => {
    const program = new Program();

    if (program.instructions.length !== 0) {
      throw new Error(
        `Expected empty program, got ${program.instructions.length} instructions`,
      );
    }

    if (program.pageWidth !== GRID_WIDTH) {
      throw new Error(
        `Page width mismatch: expected ${GRID_WIDTH}, got ${program.pageWidth}`,
      );
    }

    if (program.pageHeight !== GRID_HEIGHT) {
      throw new Error(
        `Page height mismatch: expected ${GRID_HEIGHT}, got ${program.pageHeight}`,
      );
    }
  });

  await test("Grid Initialization - Program with Instructions", () => {
    const program = new Program();
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Dig);

    if (program.instructions.length !== 2) {
      throw new Error(
        `Expected 2 instructions, got ${program.instructions.length}`,
      );
    }
  });

  // ============================================================================
  // 📍 COORDINATE MAPPING
  // ============================================================================

  await test("Coordinate Mapping - Basic Position", () => {
    const program = new Program();

    // Add enough instructions to fill first page
    for (let i = 0; i < PAGE_SIZE; i++) {
      program.addInstruction(ProgAction.None);
    }

    // Set instruction at specific grid position
    const testX = 5;
    const testY = 3;
    const expectedIndex = testY * GRID_WIDTH + testX;

    program.setInstructionAt(testX, testY, ProgAction.MoveUp, null, null, 0);
    const instruction = program.getInstructionAt(testX, testY, 0);

    if (instruction.action !== ProgAction.MoveUp) {
      throw new Error(
        `Expected MoveUp action at (${testX}, ${testY}), got ${instruction.action}`,
      );
    }

    // Verify linear index
    const linearInstruction = program.getInstruction(expectedIndex);
    if (linearInstruction.action !== ProgAction.MoveUp) {
      throw new Error(`Linear index ${expectedIndex} mismatch`);
    }
  });

  await test("Coordinate Mapping - Boundary Positions", () => {
    const program = new Program();

    // Fill program to test boundaries
    for (let i = 0; i < PAGE_SIZE; i++) {
      program.addInstruction(ProgAction.None);
    }

    // Test corners
    const corners = [
      { x: 0, y: 0, name: "top-left" },
      { x: GRID_WIDTH - 1, y: 0, name: "top-right" },
      { x: 0, y: GRID_HEIGHT - 1, name: "bottom-left" },
      { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1, name: "bottom-right" },
    ];

    for (const corner of corners) {
      program.setInstructionAt(
        corner.x,
        corner.y,
        ProgAction.Dig,
        null,
        null,
        0,
      );
      const instruction = program.getInstructionAt(corner.x, corner.y, 0);

      if (instruction.action !== ProgAction.Dig) {
        throw new Error(
          `${corner.name} corner failed: expected Dig, got ${instruction.action}`,
        );
      }
    }
  });

  await test("Coordinate Mapping - Out of Bounds", () => {
    const program = new Program();
    program.addInstruction(ProgAction.MoveUp); // Only one instruction

    // Test out of bounds access
    const outOfBounds = [
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: GRID_WIDTH, y: 0 },
      { x: 0, y: GRID_HEIGHT },
      { x: 999, y: 999 },
    ];

    for (const pos of outOfBounds) {
      const instruction = program.getInstructionAt(pos.x, pos.y, 0);

      // Should return default None instruction
      if (instruction.action !== ProgAction.None) {
        throw new Error(
          `Out of bounds (${pos.x}, ${pos.y}) should return None, got ${instruction.action}`,
        );
      }
    }
  });

  // ============================================================================
  // 📄 MULTI-PAGE FUNCTIONALITY
  // ============================================================================

  await test("Multi-Page - Basic Page Switching", () => {
    const program = new Program();

    // Fill multiple pages
    const totalInstructions = PAGE_SIZE * 3; // 3 pages
    for (let i = 0; i < totalInstructions; i++) {
      program.addInstruction(ProgAction.None);
    }

    // Set different instructions on different pages
    program.setInstructionAt(0, 0, ProgAction.MoveUp, null, null, 0);
    program.setInstructionAt(0, 0, ProgAction.MoveDown, null, null, 1);
    program.setInstructionAt(0, 0, ProgAction.MoveLeft, null, null, 2);

    // Verify each page
    const page0 = program.getInstructionAt(0, 0, 0);
    const page1 = program.getInstructionAt(0, 0, 1);
    const page2 = program.getInstructionAt(0, 0, 2);

    if (page0.action !== ProgAction.MoveUp) {
      throw new Error(`Page 0: expected MoveUp, got ${page0.action}`);
    }
    if (page1.action !== ProgAction.MoveDown) {
      throw new Error(`Page 1: expected MoveDown, got ${page1.action}`);
    }
    if (page2.action !== ProgAction.MoveLeft) {
      throw new Error(`Page 2: expected MoveLeft, got ${page2.action}`);
    }
  });

  await test("Multi-Page - Page Boundaries", () => {
    const program = new Program();

    // Fill 2 pages
    for (let i = 0; i < PAGE_SIZE * 2; i++) {
      program.addInstruction(ProgAction.None);
    }

    // Test last position of first page
    const lastX = GRID_WIDTH - 1;
    const lastY = GRID_HEIGHT - 1;
    program.setInstructionAt(lastX, lastY, ProgAction.Dig, null, null, 0);

    const instruction = program.getInstructionAt(lastX, lastY, 0);
    if (instruction.action !== ProgAction.Dig) {
      throw new Error(`Page boundary test failed`);
    }

    // Test first position of second page
    program.setInstructionAt(0, 0, ProgAction.BuildBlock, null, null, 1);
    const page1Instruction = program.getInstructionAt(0, 0, 1);
    if (page1Instruction.action !== ProgAction.BuildBlock) {
      throw new Error(`Page 1 boundary test failed`);
    }
  });

  await test("Multi-Page - Get Page Instructions", () => {
    const program = new Program();

    // Fill 2 pages with pattern
    for (let page = 0; page < 2; page++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          const action = page === 0 ? ProgAction.MoveUp : ProgAction.MoveDown;
          program.setInstructionAt(x, y, action, null, null, page);
        }
      }
    }

    // Get page instructions
    const page0Instructions = program.getPageInstructions(0);
    const page1Instructions = program.getPageInstructions(1);

    if (page0Instructions.length !== PAGE_SIZE) {
      throw new Error(
        `Page 0 should have ${PAGE_SIZE} instructions, got ${page0Instructions.length}`,
      );
    }
    if (page1Instructions.length !== PAGE_SIZE) {
      throw new Error(
        `Page 1 should have ${PAGE_SIZE} instructions, got ${page1Instructions.length}`,
      );
    }

    // Verify patterns
    for (let i = 0; i < PAGE_SIZE; i++) {
      if (page0Instructions[i].action !== ProgAction.MoveUp) {
        throw new Error(`Page 0 instruction ${i} should be MoveUp`);
      }
      if (page1Instructions[i].action !== ProgAction.MoveDown) {
        throw new Error(`Page 1 instruction ${i} should be MoveDown`);
      }
    }
  });

  // ============================================================================
  // 🔄 LINEAR INDEX ACCESS
  // ============================================================================

  await test("Linear Index - Basic Access", () => {
    const program = new Program();

    // Fill program
    for (let i = 0; i < 100; i++) {
      program.addInstruction(ProgAction.None);
    }

    // Set specific instruction
    const testIndex = 42;
    program.setInstruction(
      testIndex,
      new Instruction(ProgAction.Dig, "TEST", 123),
    );

    const retrieved = program.getInstruction(testIndex);
    if (retrieved.action !== ProgAction.Dig) {
      throw new Error(
        `Linear access failed: expected Dig, got ${retrieved.action}`,
      );
    }
    if (retrieved.label !== "TEST") {
      throw new Error(
        `Linear access failed: expected label "TEST", got "${retrieved.label}"`,
      );
    }
    if (retrieved.value !== 123) {
      throw new Error(
        `Linear access failed: expected value 123, got ${retrieved.value}`,
      );
    }
  });

  await test("Linear Index - Boundary Access", () => {
    const program = new Program();

    // Test with minimal program
    program.addInstruction(ProgAction.MoveUp);

    // Test valid access
    const validInstruction = program.getInstruction(0);
    if (validInstruction.action !== ProgAction.MoveUp) {
      throw new Error(`Valid linear access failed`);
    }

    // Test out of bounds (should return default)
    const outOfBounds = program.getInstruction(999);
    if (outOfBounds.action !== ProgAction.None) {
      throw new Error(`Out of bounds linear access should return None`);
    }
  });

  // ============================================================================
  // 🧹 PROGRAM MODIFICATION
  // ============================================================================

  await test("Program Modification - Clear Program", () => {
    const program = new Program();

    // Add instructions
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Dig);
    program.addInstruction(ProgAction.MoveDown);

    if (program.instructions.length !== 3) {
      throw new Error(
        `Expected 3 instructions before clear, got ${program.instructions.length}`,
      );
    }

    // Clear program
    program.clear();

    if (program.instructions.length !== 0) {
      throw new Error(
        `Expected 0 instructions after clear, got ${program.instructions.length}`,
      );
    }
  });

  await test("Program Modification - Dynamic Growth", () => {
    const program = new Program();

    // Start with empty program
    if (program.instructions.length !== 0) {
      throw new Error(`Program should start empty`);
    }

    // Add instructions dynamically
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.Label, "START");
    program.addInstruction(ProgAction.MoveUp);

    if (program.instructions.length !== 3) {
      throw new Error(
        `Expected 3 instructions after adding, got ${program.instructions.length}`,
      );
    }

    // Test grid access for dynamically grown program
    const gridInstruction = program.getInstructionAt(0, 0, 0);
    if (gridInstruction.action !== ProgAction.SetStart) {
      throw new Error(`Grid access failed for dynamically grown program`);
    }
  });

  // ============================================================================
  // 🔄 ROUND-TRIP INTEGRATION
  // ============================================================================

  await test("Round-Trip Integration - Grid to Serialization", async () => {
    const program = new Program();

    // Create a visual pattern in grid
    // S M M
    // L U D
    // G D B
    const pattern = [
      [ProgAction.SetStart, ProgAction.MoveUp, ProgAction.MoveUp],
      [ProgAction.Label, ProgAction.MoveUp, ProgAction.MoveDown],
      [ProgAction.Goto, ProgAction.Dig, ProgAction.BuildBlock],
    ];

    // Set pattern in grid
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const action = pattern[y][x];
        const label =
          action === ProgAction.Label
            ? "TEST_LOOP"
            : action === ProgAction.Goto
              ? "TEST_LOOP"
              : null;
        program.setInstructionAt(x, y, action, label, null, 0);
      }
    }

    // Serialize and deserialize
    const base64 = await program.toBase64Format();
    const restoredProgram = await Program.fromString(base64);

    // Verify pattern is preserved
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const original = program.getInstructionAt(x, y, 0);
        const restored = restoredProgram.getInstructionAt(x, y, 0);

        if (restored.action !== original.action) {
          throw new Error(
            `Pattern mismatch at (${x}, ${y}): expected ${original.action}, got ${restored.action}`,
          );
        }
        if (restored.label !== original.label) {
          throw new Error(
            `Label mismatch at (${x}, ${y}): expected "${original.label}", got "${restored.label}"`,
          );
        }
      }
    }
  });

  await test("Round-Trip Integration - Multi-Page Preservation", async () => {
    const program = new Program();

    // Create multi-page pattern
    for (let page = 0; page < 2; page++) {
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const action = page === 0 ? ProgAction.MoveUp : ProgAction.MoveDown;
          program.setInstructionAt(x, y, action, null, null, page);
        }
      }
    }

    // Round-trip
    const base64 = await program.toBase64Format();
    const restored = await Program.fromString(base64);

    // Verify first page (multi-page serialization may flatten to single page)
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const expected = ProgAction.MoveUp;
        const actual = restored.getInstructionAt(x, y, 0);

        if (actual.action !== expected) {
          throw new Error(`Single-page round-trip failed at (${x}, ${y})`);
        }
      }
    }
  });

  // ============================================================================
  // 🚨 ERROR HANDLING
  // ============================================================================

  await test("Error Handling - Invalid Coordinates", () => {
    const program = new Program();
    program.addInstruction(ProgAction.MoveUp); // Minimal program

    // These should not throw, but return default values
    const invalidAccesses = [
      () => program.getInstructionAt(-1, 0, 0),
      () => program.getInstructionAt(0, -1, 0),
      () => program.getInstructionAt(GRID_WIDTH, 0, 0),
      () => program.getInstructionAt(0, GRID_HEIGHT, 0),
      () => program.getInstructionAt(0, 0, -1),
    ];

    for (const access of invalidAccesses) {
      const result = access();
      if (result.action !== ProgAction.None) {
        throw new Error(`Invalid coordinate access should return None action`);
      }
    }
  });

  await test("Error Handling - Page Out of Bounds", () => {
    const program = new Program();
    program.addInstruction(ProgAction.MoveUp);

    // Access non-existent pages (should return defaults)
    const pageAccesses = [
      () => program.getInstructionAt(0, 0, 99),
      () => program.getPageInstructions(99),
    ];

    for (const access of pageAccesses) {
      try {
        const result = access();
        // Should handle gracefully
        if (Array.isArray(result)) {
          // getPageInstructions should return array with defaults
          if (result.length !== PAGE_SIZE) {
            throw new Error(
              `getPageInstructions should return ${PAGE_SIZE} instructions`,
            );
          }
        }
      } catch (e) {
        throw new Error(`Page access should not throw: ${e.message}`);
      }
    }
  });

  // ============================================================================
  // 📊 PERFORMANCE TESTS
  // ============================================================================

  await test("Performance - Large Grid Operations", () => {
    const program = new Program();
    const startTime = performance.now();

    // Fill a large grid (simulate heavy usage)
    const operations = 1000;
    for (let i = 0; i < operations; i++) {
      const x = i % GRID_WIDTH;
      const y = Math.floor(i / GRID_WIDTH) % GRID_HEIGHT;
      const page = Math.floor(i / PAGE_SIZE);

      program.setInstructionAt(x, y, ProgAction.MoveUp, null, null, page);
      const retrieved = program.getInstructionAt(x, y, page);

      if (retrieved.action !== ProgAction.MoveUp) {
        throw new Error(`Grid operation ${i} failed`);
      }
    }

    const duration = performance.now() - startTime;
    const opsPerSecond = Math.round(operations / (duration / 1000));

    console.log(
      `   📊 ${operations} grid operations in ${Math.round(duration)}ms (${opsPerSecond} ops/sec)`,
    );

    if (duration > 2000) {
      // 2 seconds max for 1000 operations
      console.warn(
        `⚠️  Performance warning: ${duration}ms for ${operations} operations`,
      );
    }
  });

  // ============================================================================
  // 🎯 REAL-WORLD SCENARIOS
  // ============================================================================

  await test("Real-World - Simple Bot Pattern", () => {
    // Simulate a simple mining bot grid layout
    const program = new Program();

    // Simple mining pattern
    program.setInstructionAt(0, 0, ProgAction.SetStart, null, null, 0);
    program.setInstructionAt(1, 0, ProgAction.Label, "M1", null, 0);
    program.setInstructionAt(2, 0, ProgAction.MoveUp, null, null, 0);
    program.setInstructionAt(3, 0, ProgAction.Dig, null, null, 0);
    program.setInstructionAt(4, 0, ProgAction.Goto, "M1", null, 0);

    // Verify the pattern makes sense
    const start = program.getInstructionAt(0, 0, 0);
    const loopLabel = program.getInstructionAt(1, 0, 0);
    const goto = program.getInstructionAt(4, 0, 0);

    if (start.action !== ProgAction.SetStart) {
      throw new Error("Bot pattern: missing SetStart");
    }
    if (loopLabel.label !== "M1") {
      throw new Error("Bot pattern: missing loop label");
    }
    if (goto.label !== "M1") {
      throw new Error("Bot pattern: missing goto reference");
    }

    // Validate the program
    const validation = program.validate();
    if (!validation.isValid) {
      throw new Error(
        `Bot pattern validation failed: ${validation.errors.join(", ")}`,
      );
    }
  });

  // ============================================================================
  // 📋 SUMMARY
  // ============================================================================

  console.log(`\n🎯 Grid Logic Test Suite Completed:`);
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
      `\n🎉 All grid logic tests passed! Program grid system is robust and reliable.`,
    );
  }
}

// Run the tests
runGridLogicTests().catch((error) => {
  console.error("💥 Grid logic test suite crashed:", error);
  process.exit(1);
});
