import assert from "assert";
import {
  getActionByCode,
  getActionName,
  getActionCode,
  getActionMetadata,
  getDefaultValueForAction,
  needsLabel,
  needsValue,
  needsCoordinates,
} from "../action-utils.js";
import { ProgAction } from "../../constants/actions.js";

console.log("Running action-utils tests...");

function runTests() {
  try {
    // Test 1: getActionByCode
    console.log("Test 1: getActionByCode");
    const moveUpAction = getActionByCode(ProgAction.MoveUp);
    assert.strictEqual(moveUpAction.name, "MoveUp");
    assert.strictEqual(moveUpAction.code, ProgAction.MoveUp);

    const invalidAction = getActionByCode(999);
    assert.strictEqual(invalidAction, null);
    console.log("PASS");

    // Test 2: getActionName
    console.log("Test 2: getActionName");
    assert.strictEqual(getActionName(ProgAction.MoveUp), "MoveUp");
    assert.strictEqual(getActionName(ProgAction.Dig), "Dig");
    assert.strictEqual(getActionName(999), null);
    console.log("PASS");

    // Test 3: getActionCode
    console.log("Test 3: getActionCode");
    assert.strictEqual(getActionCode("MoveUp"), ProgAction.MoveUp);
    assert.strictEqual(getActionCode("Dig"), ProgAction.Dig);
    assert.strictEqual(getActionCode("InvalidAction"), undefined);
    console.log("PASS");

    // Test 4: getActionMetadata
    console.log("Test 4: getActionMetadata");
    const moveUpMeta = getActionMetadata("MoveUp");
    assert.ok(moveUpMeta);
    assert.ok(moveUpMeta.label);
    assert.strictEqual(typeof moveUpMeta.label, "string");

    const invalidMeta = getActionMetadata("InvalidAction");
    assert.strictEqual(invalidMeta, null);
    console.log("PASS");

    // Test 5: getDefaultValueForAction
    console.log("Test 5: getDefaultValueForAction");
    assert.strictEqual(getDefaultValueForAction(ProgAction.SetNumberToVar), 0);
    assert.strictEqual(getDefaultValueForAction(ProgAction.AddNumberToVar), 1);
    assert.strictEqual(getDefaultValueForAction(ProgAction.PlaySound), 1);
    assert.strictEqual(getDefaultValueForAction(999), 0); // default case
    console.log("PASS");

    // Test 6: needsLabel
    console.log("Test 6: needsLabel");
    assert.strictEqual(needsLabel(ProgAction.Goto), true);
    assert.strictEqual(needsLabel(ProgAction.Call), true);
    assert.strictEqual(needsLabel(ProgAction.Label), true);
    assert.strictEqual(needsLabel(ProgAction.MoveUp), false);
    console.log("PASS");

    // Test 7: needsValue
    console.log("Test 7: needsValue");
    assert.strictEqual(needsValue(ProgAction.SetNumberToVar), true);
    assert.strictEqual(needsValue(ProgAction.PlaySound), true);
    assert.strictEqual(needsValue(ProgAction.MoveUp), false);
    console.log("PASS");

    // Test 8: needsCoordinates
    console.log("Test 8: needsCoordinates");
    // Note: Currently no actions need coordinates in this implementation
    assert.strictEqual(needsCoordinates(ProgAction.MoveUp), false);
    assert.strictEqual(needsCoordinates(ProgAction.Dig), false);
    console.log("PASS");

    // Test 9: Edge cases - null/undefined inputs
    console.log("Test 9: Edge cases - null/undefined inputs");
    assert.strictEqual(getActionByCode(null), null);
    assert.strictEqual(getActionByCode(undefined), null);
    assert.strictEqual(getActionName(null), null);
    assert.strictEqual(getActionName(undefined), null);
    assert.strictEqual(getActionCode(null), undefined);
    assert.strictEqual(getActionCode(undefined), undefined);
    assert.strictEqual(getActionMetadata(null), null);
    assert.strictEqual(getActionMetadata(undefined), null);
    assert.strictEqual(needsLabel(null), false);
    assert.strictEqual(needsLabel(undefined), false);
    assert.strictEqual(needsValue(null), false);
    assert.strictEqual(needsValue(undefined), false);
    assert.strictEqual(needsCoordinates(null), false);
    assert.strictEqual(needsCoordinates(undefined), false);
    console.log("PASS");

    // Test 10: getDefaultValueForAction edge cases
    console.log("Test 10: getDefaultValueForAction edge cases");
    assert.strictEqual(getDefaultValueForAction(null), 0);
    assert.strictEqual(getDefaultValueForAction(undefined), 0);
    assert.strictEqual(getDefaultValueForAction(-1), 0);
    assert.strictEqual(getDefaultValueForAction(NaN), 0);
    console.log("PASS");

    console.log("All action-utils tests passed!");
  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exit(1);
  }
}

runTests();
