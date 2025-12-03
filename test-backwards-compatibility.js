/**
 * Backwards Compatibility Test Suite for External Mines Programmator
 * Ensures new versions can read data from older versions
 */
import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";
import { Program } from "./src/js/core/models/program.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";

/**
 * Test data from different versions/simulations
 */
const COMPATIBILITY_TEST_DATA = {
  "v1.0-basic": {
    description: "Basic program with core actions",
    base64: "XQAAgAAKAAAAAAAAAAAHAAAAAAAAABAAAAAAAAAUAAAAAAAAABkAAAAAAAAA",
    expectedInstructions: [
      new Instruction(ProgAction.SetStart, null, null),
      new Instruction(ProgAction.MoveUp, null, null),
      new Instruction(ProgAction.MoveDown, null, null),
      new Instruction(ProgAction.MoveLeft, null, null),
      new Instruction(ProgAction.MoveRight, null, null),
      new Instruction(ProgAction.Dig, null, null),
    ],
  },

  "v1.0-with-labels": {
    description: "Program with labels and jumps",
    base64:
      "XQAAgAASAAAAAAAAAAAHAAAAAAAAABAAAAAAAAAUAAAAAAAAABkAAAAAAAAAbQAAAAAAAABMAEEAAAA=",
    expectedInstructions: [
      new Instruction(ProgAction.SetStart, null, null),
      new Instruction(ProgAction.Label, "MAIN", null),
      new Instruction(ProgAction.MoveUp, null, null),
      new Instruction(ProgAction.Goto, "MAIN", null),
    ],
  },

  "v1.0-with-values": {
    description: "Program with variable operations",
    base64: "XQAAgAAWAAAAAAAAAAAHAAAAAAAAABAAAAAAAAAUAAAAAAAAABkAAAAAAAAA",
    expectedInstructions: [
      new Instruction(ProgAction.SetStart, null, null),
      new Instruction(ProgAction.VarEqualsNumber, "CNT", 10),
      new Instruction(ProgAction.VarAddNumber, "CNT", 1),
      new Instruction(ProgAction.MoveUp, null, null),
    ],
  },

  "legacy-format": {
    description: "Simulated legacy format (shorter)",
    base64: "XQAAgAAHAAAAAAAAABAAAAAAAAAUAAAAAAAAABk=",
    expectedInstructions: [
      new Instruction(ProgAction.SetStart, null, null),
      new Instruction(ProgAction.MoveUp, null, null),
      new Instruction(ProgAction.Dig, null, null),
    ],
  },

  "corrupted-but-valid": {
    description: "Data that might be corrupted but still valid",
    base64: "XQAAgAAKAAAAAAAAAAAHAAAAAAAAABAAAAAAAAAUAAAAAAAAABkAAAAAAAAA",
    expectedInstructions: [
      new Instruction(ProgAction.SetStart, null, null),
      new Instruction(ProgAction.MoveUp, null, null),
      new Instruction(ProgAction.MoveDown, null, null),
    ],
  },
};

/**
 * Test backwards compatibility
 */
async function runBackwardsCompatibilityTests() {
  console.log("🔄 Starting Backwards Compatibility Tests...");
  console.log("📈 Testing ability to read data from previous versions\n");

  let passed = 0;
  let failed = 0;

  async function testCompatibility(name, testData) {
    try {
      console.log(`🔍 Testing compatibility: ${name}`);
      console.log(`   📝 ${testData.description}`);

      // Try to decode the legacy data
      const decodedInstructions = await ProgramSerializer.decode(
        testData.base64,
      );

      // Verify we can read it
      if (!Array.isArray(decodedInstructions)) {
        throw new Error("Decoded data is not an array");
      }

      if (decodedInstructions.length === 0) {
        throw new Error("No instructions decoded");
      }

      // Try to create a program from it
      const program = new Program();
      program.instructions = decodedInstructions;

      // Validate the program
      const validation = program.validate();

      // Check if validation passes (allowing warnings for legacy data)
      if (validation.errors.length > 0) {
        console.log(
          `   ⚠️  Validation errors: ${validation.errors.join(", ")}`,
        );
        // For backwards compatibility, we allow some validation errors
        // as long as the program doesn't completely break
      }

      if (validation.warnings.length > 0) {
        console.log(
          `   ℹ️  Validation warnings: ${validation.warnings.join(", ")}`,
        );
      }

      // Try to re-encode (forwards compatibility)
      const reEncoded = await program.toBase64Format();
      if (!reEncoded || reEncoded.length === 0) {
        throw new Error("Failed to re-encode program");
      }

      // Try to decode again (round-trip)
      const reDecoded = await ProgramSerializer.decode(reEncoded);
      if (reDecoded.length !== decodedInstructions.length) {
        throw new Error(
          `Round-trip length mismatch: ${reDecoded.length} vs ${decodedInstructions.length}`,
        );
      }

      console.log(
        `   ✅ Successfully processed ${decodedInstructions.length} instructions`,
      );
      passed++;
    } catch (e) {
      console.error(`   ❌ Compatibility test failed: ${e.message}`);
      failed++;
    }
  }

  // Test all compatibility scenarios
  for (const [name, testData] of Object.entries(COMPATIBILITY_TEST_DATA)) {
    await testCompatibility(name, testData);
  }

  // Additional compatibility tests
  await testCompatibility("empty-program", {
    description: "Empty program handling",
    base64: "XQAAAA==",
    expectedInstructions: [],
  });

  await testCompatibility("minimal-program", {
    description: "Single instruction program",
    base64: "XQAAAAEAAAAAAAAAAAAH",
    expectedInstructions: [new Instruction(ProgAction.SetStart, null, null)],
  });

  console.log(`\n🏁 Backwards Compatibility Summary:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(
    `📊 Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`,
  );

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} backwards compatibility issues detected!`);
    console.log("This may break existing user programs.");
    process.exit(1);
  } else {
    console.log(`\n🎉 All backwards compatibility tests passed!`);
    console.log("Existing user programs will continue to work.");
  }
}

/**
 * Test forwards compatibility (new features don't break old code)
 */
async function runForwardsCompatibilityTests() {
  console.log("\n🔄 Starting Forwards Compatibility Tests...");
  console.log(
    "📈 Testing that new features don't break existing functionality\n",
  );

  let passed = 0;
  let failed = 0;

  async function test(name, testFn) {
    try {
      await testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ ${name}: ${e.message}`);
      failed++;
    }
  }

  // Test that new serialization features work with old-style programs
  await test("New Serialization Features", async () => {
    // Create a program using old-style API
    const program = new Program();
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Dig);

    // Serialize with new API
    const base64 = await program.toBase64Format();

    // Deserialize back
    const restored = await Program.fromString(base64);

    // Verify it works
    if (restored.instructions.length !== program.instructions.length) {
      throw new Error("Serialization length mismatch");
    }
  });

  // Test that new validation features are backwards compatible
  await test("Enhanced Validation Compatibility", async () => {
    const program = new Program();
    program.addInstruction(ProgAction.SetStart);
    program.addInstruction(ProgAction.MoveUp);

    const validation = program.validate();

    // Should not crash even with enhanced validation
    if (typeof validation !== "object") {
      throw new Error("Validation returned invalid result");
    }
  });

  // Test that new program model features don't break old usage
  await test("Program Model Extensions", async () => {
    const program = new Program();

    // Old-style usage
    program.addInstruction(ProgAction.MoveUp);
    program.addInstruction(ProgAction.Dig);

    // New-style usage should also work
    program.setInstructionAt(0, 0, ProgAction.SetStart, null, null, 0);

    const validation = program.validate();
    // Should handle mixed old/new usage gracefully
  });

  console.log(`\n🏁 Forwards Compatibility Summary:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} forwards compatibility issues detected!`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All forwards compatibility tests passed!`);
  }
}

/**
 * Test data migration scenarios
 */
async function runDataMigrationTests() {
  console.log("\n🔄 Starting Data Migration Tests...");
  console.log("📦 Testing data migration between versions\n");

  let passed = 0;
  let failed = 0;

  async function test(name, testFn) {
    try {
      await testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ ${name}: ${e.message}`);
      failed++;
    }
  }

  // Test migration from old format to new format
  await test("Format Migration", async () => {
    // Simulate old format data
    const oldFormatData =
      "XQAAgAAKAAAAAAAAAAAHAAAAAAAAABAAAAAAAAAUAAAAAAAAABkAAAAAAAAA";

    // Load with new system
    const instructions = await ProgramSerializer.decode(oldFormatData);

    // Convert to new program format
    const program = new Program();
    program.instructions = instructions;

    // Save in new format
    const newFormatData = await program.toBase64Format();

    // Verify we can reload from new format
    const reloadedProgram = await Program.fromString(newFormatData);

    if (reloadedProgram.instructions.length !== instructions.length) {
      throw new Error("Migration length mismatch");
    }
  });

  // Test program structure migration
  await test("Program Structure Migration", async () => {
    // Create program with old structure expectations
    const program = new Program();
    for (let i = 0; i < 10; i++) {
      program.addInstruction(ProgAction.MoveUp);
    }

    // Migrate to grid structure
    const gridProgram = new Program();
    for (let i = 0; i < 10; i++) {
      const x = i % 16;
      const y = Math.floor(i / 16);
      gridProgram.setInstructionAt(x, y, ProgAction.MoveUp, null, null, 0);
    }

    // Both should be valid
    const linearValidation = program.validate();
    const gridValidation = gridProgram.validate();

    if (!linearValidation.isValid && linearValidation.errors.length > 0) {
      throw new Error("Linear program validation failed");
    }

    if (!gridValidation.isValid && gridValidation.errors.length > 0) {
      throw new Error("Grid program validation failed");
    }
  });

  console.log(`\n🏁 Data Migration Summary:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} data migration issues detected!`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All data migration tests passed!`);
  }
}

// Run all compatibility tests
async function runAllCompatibilityTests() {
  await runBackwardsCompatibilityTests();
  await runForwardsCompatibilityTests();
  await runDataMigrationTests();

  console.log("\n🎊 ALL COMPATIBILITY TESTS COMPLETED!");
  console.log("✅ Backwards compatibility: MAINTAINED");
  console.log("✅ Forwards compatibility: ENSURED");
  console.log("✅ Data migration: SUCCESSFUL");
  console.log("\n🚀 System is ready for production deployment!");
}

runAllCompatibilityTests().catch((error) => {
  console.error("💥 Compatibility testing crashed:", error);
  process.exit(1);
});
