import assert from "assert";
import { Component } from "../Component.js";
import { withDOMMock } from "./test-utils.js";

console.log("Running Component tests...");

function runTests() {
  try {
    // Test 1: Create component
    console.log("Test 1: Create component");
    const component = new Component("div");
    assert.ok(component instanceof Component);
    assert.strictEqual(component.tagName, "div");
    assert.ok(component.attributes);
    assert.ok(component.children);
    console.log("PASS");

    // Test 2: Static create method
    console.log("Test 2: Static create method");
    const createdComponent = Component.create("span");
    assert.ok(createdComponent instanceof Component);
    assert.strictEqual(createdComponent.tagName, "span");
    console.log("PASS");

    // Test 3: Add ID
    console.log("Test 3: Add ID");
    component.id("test-id");
    assert.strictEqual(component.attributes.id, "test-id");
    assert.strictEqual(component, component.id("another-id")); // Should return this
    console.log("PASS");

    // Test 4: Add class
    console.log("Test 4: Add class");
    component.class("test-class");
    assert.strictEqual(component.attributes.className, "test-class");
    component.class("another-class");
    assert.strictEqual(
      component.attributes.className,
      "test-class another-class",
    );
    console.log("PASS");

    // Test 5: Set attribute
    console.log("Test 5: Set attribute");
    component.attr("data-test", "value");
    assert.strictEqual(component.attributes["data-test"], "value");
    console.log("PASS");

    // Test 6: Set text
    console.log("Test 6: Set text");
    component.text("Hello World");
    assert.strictEqual(component.textContent, "Hello World");
    console.log("PASS");

    // Test 7: Add child
    console.log("Test 7: Add child");
    const child = new Component("p");
    component.child(child);
    assert.strictEqual(component.children.length, 1);
    assert.strictEqual(component.children[0], child);
    console.log("PASS");

    // Test 8: Add event listener
    console.log("Test 8: Add event listener");
    let clicked = false;
    component.on("click", () => {
      clicked = true;
    });
    assert.strictEqual(component.eventListeners.length, 1);
    assert.strictEqual(component.eventListeners[0].event, "click");
    assert.ok(typeof component.eventListeners[0].handler === "function");
    console.log("PASS");

    // Test 9: Render component (basic check)
    console.log("Test 9: Render component");
    const element = component.render();
    assert.ok(element);
    assert.strictEqual(element.tagName, "div");
    console.log("PASS");

    console.log("All Component tests passed!");
  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exit(1);
  }
}

withDOMMock(runTests)();
