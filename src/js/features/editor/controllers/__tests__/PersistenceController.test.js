import assert from "assert";
import { PersistenceController } from "../PersistenceController.js";
import { Program } from "../../../../core/models/program.js";

console.log("Running PersistenceController tests...");

// Mock classes for dependencies
class MockUIController {
  constructor() {
    this.programGrid = {
      program: null,
      render: () => {},
    };
  }
}

class MockDialogController {
  constructor() {
    this.lastConfirmOptions = null;
  }

  async showConfirmDialog(options) {
    this.lastConfirmOptions = options;
    return true; // Always confirm for tests
  }
}

function runTests() {
  try {
    // Test 1: Constructor
    console.log("Test 1: Constructor");
    const program = new Program();
    const mockUI = new MockUIController();
    const mockDialog = new MockDialogController();
    const controller = new PersistenceController(program, mockUI, mockDialog);
    assert.ok(controller instanceof PersistenceController);
    assert.strictEqual(controller.program, program);
    assert.strictEqual(controller.uiController, mockUI);
    assert.strictEqual(controller.dialogController, mockDialog);
    assert.strictEqual(controller.autosaveTimer, null);
    assert.strictEqual(controller.isDestroyed, false);
    console.log("PASS");

    // Test 2: startAutosave
    console.log("Test 2: startAutosave");
    controller.startAutosave();
    assert.ok(controller.autosaveTimer !== null);
    console.log("PASS");

    // Test 3: stopAutosave
    console.log("Test 3: stopAutosave");
    controller.stopAutosave();
    assert.strictEqual(controller.autosaveTimer, null);
    console.log("PASS");

    // Test 4: calculateProgramHash
    console.log("Test 4: calculateProgramHash");
    const instructions = [
      { action: 1, value: 10, label: "test1" },
      { action: 2, value: 20, label: "test2" },
    ];
    const hash1 = controller.calculateProgramHash(instructions);
    const hash2 = controller.calculateProgramHash(instructions);
    const hash3 = controller.calculateProgramHash([
      { action: 1, value: 10, label: "test1" },
      { action: 3, value: 30, label: "test3" },
    ]);

    assert.strictEqual(typeof hash1, "string");
    assert.ok(hash1.length > 0); // Hash should be non-empty string
    assert.strictEqual(hash1, hash2); // Same input should produce same hash
    assert.notStrictEqual(hash1, hash3); // Different input should produce different hash
    console.log("PASS");

    // Test 5: calculateProgramHash with empty array
    console.log("Test 5: calculateProgramHash with empty array");
    const emptyHash = controller.calculateProgramHash([]);
    assert.strictEqual(typeof emptyHash, "string");
    assert.ok(emptyHash.length > 0);
    console.log("PASS");

    // Test 6: destroy
    console.log("Test 6: destroy");
    controller.startAutosave(); // Start timer first
    assert.ok(controller.autosaveTimer !== null);

    controller.destroy();
    assert.strictEqual(controller.autosaveTimer, null);
    assert.strictEqual(controller.isDestroyed, true);
    assert.strictEqual(controller.program, null);
    assert.strictEqual(controller.uiController, null);
    assert.strictEqual(controller.dialogController, null);
    console.log("PASS");

    console.log("All PersistenceController tests passed!");
  } catch (error) {
    console.error("❌ PersistenceController test failed:", error.message);
    throw error;
  }
}

runTests();
