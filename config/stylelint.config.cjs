// Code Guide compliant Stylelint configuration
// Focus on quality, consistency, and maintainability
module.exports = {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-order"],
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
      "transition",
      "animation",

      // Misc
      "cursor",
      "pointer-events",
      "user-select",
      "overflow",
    ],
  },
};
