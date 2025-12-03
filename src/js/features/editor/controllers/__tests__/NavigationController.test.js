import assert from "assert";
import { NavigationController } from "../NavigationController.js";
import { MAX_PAGES } from "../../../../core/constants/grid.js";

console.log("Running NavigationController tests...");

// Mock classes for dependencies
class MockUIController {
  constructor() {
    this.currentPage = 0;
    this.gridCurrentPage = 0;
  }

  setGridCurrentPage(page) {
    this.gridCurrentPage = page;
  }

  updatePageDisplay(page, maxPages) {
    this.currentPage = page;
  }

  updateGridDisplay() {
    // Mock implementation
  }
}

function runTests() {
  try {
    // Test 1: Constructor
    console.log("Test 1: Constructor");
    const mockUI = new MockUIController();
    const controller = new NavigationController(null, mockUI);
    assert.ok(controller instanceof NavigationController);
    assert.strictEqual(controller.currentPage, 0);
    assert.strictEqual(controller.getCurrentPage(), 0);
    assert.strictEqual(controller.getMaxPages(), MAX_PAGES);
    console.log("PASS");

    // Test 2: Cyclic next page navigation
    console.log("Test 2: Cyclic next page navigation");
    // Start from page 0
    assert.strictEqual(controller.getCurrentPage(), 0);

    // Go to next page (should go to page 1)
    controller.switchToNextPage();
    assert.strictEqual(controller.getCurrentPage(), 1);
    assert.strictEqual(mockUI.gridCurrentPage, 1);

    // Continue to last page
    for (let i = 2; i < MAX_PAGES; i++) {
      controller.switchToNextPage();
      assert.strictEqual(
        controller.getCurrentPage(),
        i,
        `Should be on page ${i}`,
      );
    }

    // From last page, next should go to first page (cyclic)
    assert.strictEqual(controller.getCurrentPage(), MAX_PAGES - 1);
    controller.switchToNextPage();
    assert.strictEqual(
      controller.getCurrentPage(),
      0,
      "Should cycle back to page 0",
    );
    console.log("PASS");

    // Test 3: Cyclic previous page navigation
    console.log("Test 3: Cyclic previous page navigation");
    // Start from page 0
    assert.strictEqual(controller.getCurrentPage(), 0);

    // Go to previous page from page 0 (should go to last page)
    controller.switchToPrevPage();
    assert.strictEqual(
      controller.getCurrentPage(),
      MAX_PAGES - 1,
      "Should cycle to last page",
    );
    assert.strictEqual(mockUI.gridCurrentPage, MAX_PAGES - 1);

    // Continue to first page
    for (let i = MAX_PAGES - 2; i >= 0; i--) {
      controller.switchToPrevPage();
      assert.strictEqual(
        controller.getCurrentPage(),
        i,
        `Should be on page ${i}`,
      );
    }

    // From first page, previous should go to last page (cyclic)
    assert.strictEqual(controller.getCurrentPage(), 0);
    controller.switchToPrevPage();
    assert.strictEqual(
      controller.getCurrentPage(),
      MAX_PAGES - 1,
      "Should cycle back to last page",
    );
    console.log("PASS");

    // Test 4: switchToPage with valid page
    console.log("Test 4: switchToPage with valid page");
    controller.switchToPage(5);
    assert.strictEqual(controller.getCurrentPage(), 5);
    assert.strictEqual(mockUI.gridCurrentPage, 5);
    console.log("PASS");

    // Test 5: switchToPage with invalid page (should not change)
    console.log("Test 5: switchToPage with invalid page");
    controller.switchToPage(-1);
    assert.strictEqual(
      controller.getCurrentPage(),
      5,
      "Should not change for invalid page",
    );
    controller.switchToPage(MAX_PAGES);
    assert.strictEqual(
      controller.getCurrentPage(),
      5,
      "Should not change for invalid page",
    );
    console.log("PASS");

    // Test 6: onPageNavigation
    console.log("Test 6: onPageNavigation");
    controller.onPageNavigation("next");
    assert.strictEqual(controller.getCurrentPage(), 6);
    controller.onPageNavigation("prev");
    assert.strictEqual(controller.getCurrentPage(), 5);
    console.log("PASS");

    // Test 7: destroy
    console.log("Test 7: destroy");
    controller.destroy();
    assert.strictEqual(controller.program, null);
    assert.strictEqual(controller.uiController, null);
    assert.strictEqual(controller.currentPage, 0);
    console.log("PASS");

    console.log("All NavigationController tests passed!");
  } catch (error) {
    console.error("❌ NavigationController test failed:", error.message);
    throw error;
  }
}

runTests();



