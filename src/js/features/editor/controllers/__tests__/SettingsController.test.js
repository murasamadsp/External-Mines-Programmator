import assert from "assert";
import { SettingsController } from "../SettingsController.js";
import { SettingsStorage } from "../../../../utils/helpers/storage.js";

console.log("Running SettingsController tests...");

// Mock classes for dependencies
class MockPersistenceController {
  constructor() {
    this.autosaveStarted = false;
    this.autosaveStopped = false;
  }

  startAutosave() {
    this.autosaveStarted = true;
  }

  stopAutosave() {
    this.autosaveStopped = true;
  }
}

class MockDialogController {
  constructor() {
    this.showExpertSettingsDialogCalled = false;
    this.lastCallback = null;
  }

  async showExpertSettingsDialog(callback) {
    this.showExpertSettingsDialogCalled = true;
    this.lastCallback = callback;
    // Simulate dialog acceptance with some settings
    callback({ autoSave: true, someSetting: "test" });
  }
}

function runTests() {
  try {
    // Test 1: Constructor
    console.log("Test 1: Constructor");
    const mockPersistence = new MockPersistenceController();
    const mockDialog = new MockDialogController();
    const controller = new SettingsController(mockPersistence, mockDialog);
    assert.ok(controller instanceof SettingsController);
    assert.strictEqual(controller.persistenceController, mockPersistence);
    assert.strictEqual(controller.dialogController, mockDialog);
    console.log("PASS");

    // Test 2: getCurrentSettings
    console.log("Test 2: getCurrentSettings");
    const settings = controller.getCurrentSettings();
    assert.ok(typeof settings === "object");
    assert.ok("autoSave" in settings);
    console.log("PASS");

    // Test 3: applyExpertSettings - autoSave enabled
    console.log("Test 3: applyExpertSettings - autoSave enabled");
    controller.applyExpertSettings({ autoSave: true });
    assert.strictEqual(mockPersistence.autosaveStarted, true);
    assert.strictEqual(mockPersistence.autosaveStopped, false);
    console.log("PASS");

    // Test 4: applyExpertSettings - autoSave disabled
    console.log("Test 4: applyExpertSettings - autoSave disabled");
    const freshMockPersistence = new MockPersistenceController();
    const controller2 = new SettingsController(
      freshMockPersistence,
      mockDialog,
    );
    controller2.applyExpertSettings({ autoSave: false });
    assert.strictEqual(freshMockPersistence.autosaveStopped, true);
    assert.strictEqual(freshMockPersistence.autosaveStarted, false);
    console.log("PASS");

    // Test 5: showExpertSettingsDialog
    console.log("Test 5: showExpertSettingsDialog");
    const freshMockDialog = new MockDialogController();
    const controller3 = new SettingsController(
      mockPersistence,
      freshMockDialog,
    );

    // Mock async test
    const dialogPromise = controller3.showExpertSettingsDialog();
    assert.ok(dialogPromise instanceof Promise);

    // Wait for async operation (in real test environment this would be handled properly)
    setTimeout(() => {
      assert.strictEqual(freshMockDialog.showExpertSettingsDialogCalled, true);
      console.log("PASS");
    }, 10);

    // Test 6: resetToDefaults
    console.log("Test 6: resetToDefaults");
    const freshMockPersistence2 = new MockPersistenceController();
    const controller4 = new SettingsController(
      freshMockPersistence2,
      mockDialog,
    );
    controller4.resetToDefaults();
    assert.strictEqual(freshMockPersistence2.autosaveStarted, true);
    console.log("PASS");

    // Test 7: destroy
    console.log("Test 7: destroy");
    controller.destroy();
    assert.strictEqual(controller.persistenceController, null);
    assert.strictEqual(controller.dialogController, null);
    console.log("PASS");

    console.log("All SettingsController tests passed!");
  } catch (error) {
    console.error("❌ SettingsController test failed:", error.message);
    throw error;
  }
}

runTests();
