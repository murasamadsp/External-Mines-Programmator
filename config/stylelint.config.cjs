// Enhanced Stylelint configuration
// Focus on quality, consistency, maintainability, accessibility, and performance
module.exports = {
  extends: ["stylelint-config-standard"],
  plugins: [
    "stylelint-order",
    // Additional plugins will be added when installed
  ],
  rules: {
    // Color notation (Code Guide)
    "color-function-notation": "modern", // rgb() instead of rgba()
    "color-hex-length": "short", // #fff instead of #ffffff
    "color-named": "never", // Prohibit named colors

    // Units (Code Guide)
    "length-zero-no-unit": true, // 0 instead of 0px

    // Selectors (Code Guide)
    "selector-class-pattern": "^[a-z][a-zA-Z0-9_-]+$", // Allow _, no camelCase
    "selector-no-qualifying-type": null, // Allow element type qualifiers for specificity

    // Nesting (Code Guide)
    "max-nesting-depth": 3,

    // Specificity
    "no-descending-specificity": null, // Allow logical ordering
    "selector-max-specificity": null, // Allow higher specificity for complex components

    // Shorthand properties (Code Guide)
    "declaration-block-no-redundant-longhand-properties": true,

    // Empty blocks
    "block-no-empty": null, // Allow for placeholder styles

    // Comments (Code Guide)
    "comment-empty-line-before": "always", // Space before comments
    "comment-whitespace-inside": "always", // Space after //

    // @ Rules
    "at-rule-no-unknown": null, // Allow custom at-rules
    "at-rule-empty-line-before": [
      "always",
      {
        except: ["blockless-after-same-name-blockless", "first-nested"],
        ignore: ["after-comment"],
      },
    ],

    // === Доступність (Accessibility) ===
    // Note: For full accessibility rules, consider installing stylelint-a11y plugin
    "selector-max-attribute": 2, // Limit attribute selectors for performance
    "selector-max-class": 3, // Limit class selectors for specificity control

    // === Продуктивність (Performance) ===
    "selector-max-combinators": 3, // Limit combinator complexity
    "selector-max-compound-selectors": 3, // Limit compound selector complexity
    "selector-max-id": 1, // Limit ID selectors (IDs are too specific)

    // === Сучасний CSS (Modern CSS) ===
    "function-disallowed-list": [], // Can be customized per project
    "property-disallowed-list": [], // Can be customized per project
    "unit-disallowed-list": [], // Can be customized per project

    // === Кастомні правила ===
    // "custom-property-pattern": "^--[a-z][a-zA-Z0-9-]*$", // CSS custom properties pattern - commented out as existing vars use different naming
    "keyframes-name-pattern": "^[a-z][a-zA-Z0-9-]*$", // Keyframes naming pattern
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "local"], // For CSS modules
      },
    ],
    "selector-pseudo-element-no-unknown": [
      true,
      {
        ignorePseudoElements: ["v-deep"], // For Vue scoped styles if needed
      },
    ],

    // === Форматування ===
    "declaration-empty-line-before": [
      "always",
      {
        except: ["after-declaration", "first-nested"],
        ignore: ["after-comment", "inside-single-line-block"],
      },
    ],
    "rule-empty-line-before": [
      "always",
      {
        except: ["after-single-line-comment", "first-nested"],
        ignore: ["after-comment"],
      },
    ],

    // Property ordering (Code Guide inspired)
    "order/properties-order": [
      // Positioning
      "position",
      "top",
      "right",
      "bottom",
      "left",
      "z-index",

      // Box model
      "display",
      "flex-direction",
      "flex-wrap",
      "justify-content",
      "align-items",
      "align-content",
      "grid-template",
      "grid-gap",
      "order",
      "width",
      "min-width",
      "max-width",
      "height",
      "min-height",
      "max-height",
      "padding",
      "margin",

      // Typography
      "font-family",
      "font-size",
      "font-weight",
      "font-style",
      "line-height",
      "letter-spacing",
      "text-align",
      "text-decoration",
      "text-transform",
      "color",

      // Visual
      "background",
      "background-color",
      "background-image",
      "background-position",
      "background-size",
      "background-repeat",
      "border",
      "border-radius",
      "box-shadow",
      "opacity",

      // Animation
      "transform",

      // Misc
      "cursor",
      "pointer-events",
      "user-select",
      "overflow",
    ],
  },
};
