/**
 * Test utilities for setting up DOM mocks and test environment
 */

/**
 * Setup DOM mock for testing components that require DOM access
 */
export function setupDOMMock() {
  // Mock document
  global.document = {
    createElement: tag => {
      const element = {
        tagName: tag.toLowerCase(),
        attributes: {},
        children: [],
        textContent: null,
        className: "",
        style: {},
        addEventListener: () => {},
        setAttribute: function (name, value) {
          this.attributes[name] = value;
        },
        appendChild: function (child) {
          this.children.push(child);
        },
        remove: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementById: id => {
          // Mock elements for specific IDs used in tests
          const mockElements = {
            "total-instructions": { textContent: "", innerHTML: "" },
            "unique-actions": { textContent: "", innerHTML: "" },
            "movement-actions": { textContent: "", innerHTML: "" },
            "logic-actions": { textContent: "", innerHTML: "" },
            "condition-actions": { textContent: "", innerHTML: "" },
            "labeled-instructions": { textContent: "", innerHTML: "" },
            "program-recommendations": {
              textContent: "",
              className: "",
              innerHTML: "",
            },
          };
          return mockElements[id] || null;
        },
      };
      return element;
    },
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  // Mock window
  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

/**
 * Clean up DOM mock after tests
 */
export function cleanupDOMMock() {
  delete global.document;
  delete global.window;
}

/**
 * Create a test wrapper that sets up and cleans up DOM mock
 */
export function withDOMMock(testFn) {
  return () => {
    setupDOMMock();
    try {
      testFn();
    } finally {
      cleanupDOMMock();
    }
  };
}



