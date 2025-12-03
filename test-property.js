import { Program } from "./src/js/core/models/program.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";

/**
 * Property-Based Test Suite for External Mines Programmator
 * Tests mathematical properties and invariants of the system
 */
async function runPropertyTests() {
  console.log("🔬 Starting Property-Based Test Suite...");
  console.log("⚡ Testing mathematical properties and system invariants\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn, options = {}) {
    const iterations = options.iterations || 100;
    const startTime = performance.now();

    try {
      for (let i = 0; i < iterations; i++) {
        await fn(i);
      }

      const duration = Math.round(performance.now() - startTime);
      console.log(`✅ ${name} (${iterations} iterations, ${duration}ms)`);
      passed++;
    } catch (e) {
      const duration = Math.round(performance.now() - startTime);
      console.error(`❌ ${name} (failed on iteration): ${e.message}`);
      console.error(e.stack);
      failed++;
    }
  }

  // ============================================================================
  // 🔄 SERIALIZATION PROPERTIES
  // ============================================================================

  await test("Property - Idempotent Serialization", async (i) => {
    // Property: serialize(deserialize(serialize(x))) === serialize(x)

    // Generate random program
    const program = generateRandomProgram(Math.floor(Math.random() * 50) + 1);

    // Serialize once
    const base64_1 = await program.toBase64Format();

    // Deserialize and serialize again
    const restored = await Program.fromString(base64_1);
    const base64_2 = await restored.toBase64Format();

    // Should be identical
    if (base64_1 !== base64_2) {
      throw new Error(
        `Idempotent serialization failed: first=${base64_1.substring(
          0,
          20,
        )}..., second=${base64_2.substring(0, 20)}...`,
      );
    }
  });

  await test("Property - Serialization Preserves Length", async (i) => {
    // Property: length(deserialize(serialize(x))) >= length(x)

    const program = generateRandomProgram(Math.floor(Math.random() * 100) + 1);
    const originalLength = program.instructions.length;

    const base64 = await program.toBase64Format();
    const restored = await Program.fromString(base64);

    // Restored program may be padded to page size
    if (restored.instructions.length < originalLength) {
      throw new Error(
        `Length preservation failed: ${originalLength} -> ${restored.instructions.length}`,
      );
    }
  });

  await test("Property - Valid Programs Remain Valid", async (i) => {
    // Property: validate(deserialize(serialize(x))) succeeds if validate(x) succeeds

    const program = generateRandomProgram(Math.floor(Math.random() * 50) + 1);

    // Only test programs that are initially valid
    const originalValidation = program.validate();
    if (!originalValidation.isValid) {
      return; // Skip invalid programs
    }

    const base64 = await program.toBase64Format();
    const restored = await Program.fromString(base64);
    const restoredValidation = restored.validate();

    if (!restoredValidation.isValid) {
      throw new Error(
        `Valid program became invalid after serialization: ${restoredValidation.errors.join(
          ", ",
        )}`,
      );
    }
  });

  // ============================================================================
  // 📏 PROGRAM STRUCTURE PROPERTIES
  // ============================================================================

  await test("Property - Grid Coordinate Consistency", async (i) => {
    // Property: getInstructionAt(setInstructionAt(x, y, instr)) === instr

    const program = new Program();
    const x = Math.floor(Math.random() * 16); // 0-15
    const y = Math.floor(Math.random() * 12); // 0-11
    const page = Math.floor(Math.random() * 16); // 0-15

    // Fill program to ensure space
    for (let p = 0; p <= page; p++) {
      for (let yy = 0; yy < 12; yy++) {
        for (let xx = 0; xx < 16; xx++) {
          program.setInstructionAt(xx, yy, ProgAction.None, null, null, p);
        }
      }
    }

    const testInstruction = new Instruction(
      ProgAction.MoveUp,
      `TEST_${i}`,
      Math.floor(Math.random() * 1000),
    );

    program.setInstructionAt(x, y, testInstruction.action, testInstruction.label, testInstruction.value, page);
    const retrieved = program.getInstructionAt(x, y, page);

    if (
      retrieved.action !== testInstruction.action ||
      retrieved.label !== testInstruction.label ||
      retrieved.value !== testInstruction.value
    ) {
      throw new Error(
        `Grid consistency failed at (${x}, ${y}, ${page}): set=${JSON.stringify(
          testInstruction,
        )}, got=${JSON.stringify(retrieved)}`,
      );
    }
  });

  await test("Property - Linear Index Equivalence", async (i) => {
    // Property: getInstructionAt(x,y,p) === getInstruction(linearIndex)

    const program = new Program();
    const x = Math.floor(Math.random() * 16);
    const y = Math.floor(Math.random() * 12);
    const page = Math.floor(Math.random() * 2); // Limit pages for test

    // Fill program
    const totalInstructions = (page + 1) * 192;
    for (let j = 0; j < totalInstructions; j++) {
      program.addInstruction(ProgAction.None);
    }

    const linearIndex = page * 192 + y * 16 + x;
    const gridInstruction = program.getInstructionAt(x, y, page);
    const linearInstruction = program.getInstruction(linearIndex);

    if (
      gridInstruction.action !== linearInstruction.action ||
      gridInstruction.label !== linearInstruction.label ||
      gridInstruction.value !== linearInstruction.value
    ) {
      throw new Error(
        `Linear equivalence failed: grid=${JSON.stringify(
          gridInstruction,
        )}, linear=${JSON.stringify(linearInstruction)}`,
      );
    }
  });

  // ============================================================================
  // 🔄 STATE CONSISTENCY PROPERTIES
  // ============================================================================

  await test("Property - Clear Resets State", async (i) => {
    // Property: length(clear(x)) === 0

    const program = generateRandomProgram(Math.floor(Math.random() * 100) + 1);

    // Verify it has instructions
    if (program.instructions.length === 0) {
      return; // Skip if empty
    }

    program.clear();

    if (program.instructions.length !== 0) {
      throw new Error(
        `Clear failed to reset state: ${program.instructions.length} instructions remaining`,
      );
    }
  });

  await test("Property - Add Instruction Increases Length", async (i) => {
    // Property: length(addInstruction(x, instr)) === length(x) + 1

    const program = new Program();
    const initialLength = program.instructions.length;

    const actions = Object.values(ProgAction).filter(
      (a) => typeof a === "number",
    );
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    program.addInstruction(randomAction, `LABEL_${i}`, Math.floor(Math.random() * 100));

    if (program.instructions.length !== initialLength + 1) {
      throw new Error(
        `Add instruction failed: ${initialLength} -> ${program.instructions.length}`,
      );
    }
  });

  // ============================================================================
  // 🎯 VALIDATION PROPERTIES
  // ============================================================================

  await test("Property - Validation Determinism", async (i) => {
    // Property: validate(x) === validate(x) (multiple calls return same result)

    const program = generateRandomProgram(Math.floor(Math.random() * 50) + 1);

    const result1 = program.validate();
    const result2 = program.validate();

    if (result1.isValid !== result2.isValid) {
      throw new Error("Validation non-deterministic: validity changed");
    }

    if (result1.errors.length !== result2.errors.length) {
      throw new Error("Validation non-deterministic: error count changed");
    }

    if (result1.warnings.length !== result2.warnings.length) {
      throw new Error("Validation non-deterministic: warning count changed");
    }
  });

  await test("Property - Empty Program is Valid", async (i) => {
    // Property: validate(emptyProgram).isValid === true

    const program = new Program();
    const validation = program.validate();

    if (!validation.isValid) {
      throw new Error(
        `Empty program should be valid: ${validation.errors.join(", ")}`,
      );
    }
  });

  await test("Property - Single Instruction Programs", async (i) => {
    // Property: validate(singleInstructionProgram).isValid depends on instruction type

    const actions = [
      ProgAction.SetStart, // Should be valid
      ProgAction.MoveUp, // Should be valid
      ProgAction.Label, // Should be valid
      ProgAction.Goto, // May have warnings about undefined labels
    ];

    const action = actions[Math.floor(Math.random() * actions.length)];
    const program = new Program();

    if (action === ProgAction.Label || action === ProgAction.Goto) {
      program.addInstruction(action, "TEST_LABEL");
    } else {
      program.addInstruction(action);
    }

    const validation = program.validate();

    // For single instructions, validation should not crash
    if (typeof validation.isValid !== "boolean") {
      throw new Error("Validation should return boolean isValid");
    }

    if (!Array.isArray(validation.errors)) {
      throw new Error("Validation should return errors array");
    }

    if (!Array.isArray(validation.warnings)) {
      throw new Error("Validation should return warnings array");
    }
  });

  // ============================================================================
  // 🔢 NUMERIC PROPERTIES
  // ============================================================================

  await test("Property - Action Code Range", async (i) => {
    // Property: all ProgAction values are non-negative integers

    const actions = Object.values(ProgAction).filter(
      (a) => typeof a === "number",
    );

    for (const action of actions) {
      if (!Number.isInteger(action) || action < 0) {
        throw new Error(`Invalid action code: ${action}`);
      }
    }
  });

  await test("Property - Instruction Value Constraints", async (i) => {
    // Property: instruction values should be reasonable numbers

    const program = generateRandomProgram(Math.floor(Math.random() * 20) + 1);

    for (const instruction of program.instructions) {
      if (instruction.value !== null && instruction.value !== undefined) {
        if (
          typeof instruction.value !== "number" ||
          !Number.isFinite(instruction.value) ||
          Math.abs(instruction.value) > Number.MAX_SAFE_INTEGER
        ) {
          throw new Error(`Invalid instruction value: ${instruction.value}`);
        }
      }
    }
  });

  // ============================================================================
  // 🧵 CONCURRENT OPERATION PROPERTIES
  // ============================================================================

  await test("Property - Isolated Operations", async (i) => {
    // Property: operations on different program instances don't interfere

    const program1 = generateRandomProgram(10);
    const program2 = generateRandomProgram(10);

    const originalLength1 = program1.instructions.length;
    const originalLength2 = program2.instructions.length;

    // Modify program1
    program1.addInstruction(ProgAction.MoveUp);
    program1.addInstruction(ProgAction.Dig);

    // program2 should remain unchanged
    if (program2.instructions.length !== originalLength2) {
      throw new Error("Program isolation violated: program2 length changed");
    }

    if (program1.instructions.length !== originalLength1 + 2) {
      throw new Error("Program1 modification failed");
    }
  });

  // ============================================================================
  // 🔧 HELPER FUNCTIONS
  // ============================================================================

  function generateRandomProgram(size) {
    const program = new Program();
    const actions = Object.values(ProgAction).filter(
      (a) => typeof a === "number" && a >= 0 && a <= 255,
    );

    for (let i = 0; i < size; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const shouldHaveLabel = Math.random() < 0.3; // 30% chance
      const shouldHaveValue = Math.random() < 0.2; // 20% chance

      const label = shouldHaveLabel ? `LBL_${i}_${Math.floor(Math.random() * 100)}` : null;
      const value = shouldHaveValue ? Math.floor(Math.random() * 1000) : null;

      program.addInstruction(action, label, value);
    }

    return program;
  }

  // ============================================================================
  // 📋 SUMMARY
  // ============================================================================

  console.log(`\n🔬 Property-Based Test Suite Completed:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed} tests`);

  const successRate = ((passed / (passed + failed)) * 100).toFixed(1);
  console.log(`🎯 Success Rate: ${successRate}%`);

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} test(s) failed. Check logs above for details.`);
    process.exit(1);
  } else {
    console.log(
      `\n🎉 All property tests passed! System maintains mathematical correctness.`,
    );
  }
}

// Run the tests
runPropertyTests().catch((error) => {
  console.error("💥 Property test suite crashed:", error);
  process.exit(1);
});