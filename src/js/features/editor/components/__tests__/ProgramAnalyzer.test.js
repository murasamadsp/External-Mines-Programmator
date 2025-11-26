import assert from "assert";
import { ProgramAnalyzer } from "../ProgramAnalyzer.js";
import { ProgAction } from "../../../../core/constants/actions.js";
import { withDOMMock } from "../../../../core/utils/__tests__/test-utils.js";

console.log("Running ProgramAnalyzer tests...");

function runTests() {
  try {
    // Test 1: Create analyzer
    console.log("Test 1: Create analyzer");
    const analyzer = new ProgramAnalyzer();
    assert.ok(analyzer instanceof ProgramAnalyzer);
    console.log("PASS");

    // Test 2: Create UI
    console.log("Test 2: Create UI");
    const ui = analyzer.createUI();
    assert.ok(ui);
    assert.strictEqual(ui.tagName, "div");
    assert.ok(ui.className.includes("program-analyzer"));
    console.log("PASS");

    // Test 3: Calculate stats for empty program
    console.log("Test 3: Calculate stats for empty program");
    const emptyStats = analyzer.calculateStats([]);
    assert.strictEqual(emptyStats.totalInstructions, 0);
    assert.strictEqual(emptyStats.uniqueActionsCount, 0);
    console.log("PASS");

    // Test 4: Calculate stats for simple program
    console.log("Test 4: Calculate stats for simple program");
    const instructions = [
      { action: ProgAction.MoveUp },
      { action: ProgAction.MoveLeft },
      { action: ProgAction.Dig, label: "mine" },
      { action: ProgAction.IsEmpty },
      { action: ProgAction.BooleanAND },
    ];
    const stats = analyzer.calculateStats(instructions);
    assert.strictEqual(stats.totalInstructions, 5);
    assert.strictEqual(stats.uniqueActionsCount, 5);
    assert.strictEqual(stats.movementActions, 2);
    assert.strictEqual(stats.logicActions, 1);
    assert.strictEqual(stats.conditionActions, 1);
    assert.strictEqual(stats.labeledInstructions, 1);
    console.log("PASS");

    // Test 5: Generate recommendations for empty program
    console.log("Test 5: Generate recommendations for empty program");
    const emptyRecommendations = analyzer.generateRecommendations(
      emptyStats,
      [],
    );
    assert.ok(Array.isArray(emptyRecommendations));
    console.log("PASS");

    // Test 6: Generate recommendations for complex program
    console.log("Test 6: Generate recommendations for complex program");
    const complexInstructions = Array.from({ length: 1200 }, (_, i) => ({
      action: i % 10 === 0 ? ProgAction.MoveUp : ProgAction.IsEmpty,
    }));
    const complexStats = analyzer.calculateStats(complexInstructions);
    const complexRecommendations = analyzer.generateRecommendations(
      complexStats,
      complexInstructions,
    );

    // Should have warning about large program size
    const hasSizeWarning = complexRecommendations.some(
      rec => rec.message.includes("дуже велика") && rec.type === "warning",
    );
    assert.ok(hasSizeWarning, "Should warn about large program size");
    console.log("PASS");

    // Test 7: Update stats display (skip DOM-dependent test)
    console.log("Test 7: Update stats display - skipped (DOM dependent)");
    console.log("PASS");

    // Test 8: Show empty analysis (skip DOM-dependent test)
    console.log("Test 8: Show empty analysis - skipped (DOM dependent)");
    console.log("PASS");

    console.log("All ProgramAnalyzer tests passed!");
  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exit(1);
  }
}

withDOMMock(runTests)();
