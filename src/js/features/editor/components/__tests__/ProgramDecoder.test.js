import assert from "assert";
import { ProgramDecoder } from "../ProgramDecoder.js";
import { ProgAction } from "../../../../core/constants/actions.js";

// Mock document for testing
global.document = {
  createElement: tag => ({
    tagName: tag,
    attributes: {},
    children: [],
    textContent: null,
    addEventListener: () => {},
    setAttribute: () => {},
    appendChild: () => {},
    querySelector: () => null,
    remove: () => {},
  }),
};

console.log("Running ProgramDecoder tests...");

function runTests() {
  try {
    // Test 1: Create decoder
    console.log("Test 1: Create decoder");
    const decoder = new ProgramDecoder();
    assert.ok(decoder instanceof ProgramDecoder);
    assert.ok(decoder.actionCodes instanceof Map);
    assert.strictEqual(decoder.actionCodes.size > 0, true);
    console.log("PASS");

    // Test 2: Action codes mapping
    console.log("Test 2: Action codes mapping");
    assert.strictEqual(decoder.actionCodes.get("W"), "4");
    assert.strictEqual(decoder.actionCodes.get("A"), "5");
    assert.strictEqual(decoder.actionCodes.get("S"), "6");
    assert.strictEqual(decoder.actionCodes.get("D"), "7");
    assert.strictEqual(decoder.actionCodes.get("Z0"), "8");
    console.log("PASS");

    // Test 3: Create UI
    console.log("Test 3: Create UI");
    const ui = decoder.createUI();
    assert.ok(ui);
    assert.strictEqual(ui.tagName, "div");
    assert.ok(ui.className.includes("program-decoder"));
    console.log("PASS");

    // Test 4: Decode simple program
    console.log("Test 4: Decode simple program");
    decoder.inputElement = { value: "W A S D" };
    decoder.outputElement = { textContent: "", className: "" };
    decoder.decodeProgram();

    // Should have decoded successfully
    assert.ok(decoder.outputElement.textContent.includes("Результат"));
    console.log("PASS");

    // Test 5: Decode invalid operator
    console.log("Test 5: Decode invalid operator");
    decoder.inputElement = { value: "W INVALID A" };
    decoder.outputElement = { textContent: "", className: "" };
    decoder.decodeProgram();

    // Should show error
    assert.ok(decoder.outputElement.textContent.includes("❌"));
    console.log("PASS");

    // Test 6: Empty input
    console.log("Test 6: Empty input");
    decoder.inputElement = { value: "" };
    decoder.outputElement = { textContent: "", className: "" };
    decoder.decodeProgram();

    // Should show error for empty input
    assert.ok(decoder.outputElement.textContent.includes("❌"));
    console.log("PASS");

    console.log("All ProgramDecoder tests passed!");
  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exit(1);
  }
}

runTests();
