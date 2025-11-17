// Simplified Stylelint configuration - focus on quality, not formatting
// Prettier handles formatting, Stylelint handles logic and style
module.exports = {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-order"],
  rules: {
    // Code Guide rules
    "color-function-notation": "modern", // rgb() instead of rgba()
    "color-hex-length": "short", // #fff instead of #ffffff
    "color-named": "never", // Prohibit named colors

    // BEM naming (without extra checks)
    "selector-class-pattern": "^[a-z][a-zA-Z0-9_-]+$", // Allow _

    // Limit nesting depth
    "max-nesting-depth": 3,

    // Allow empty blocks for placeholder styles
    "block-no-empty": null,

    // Simple property order (Code Guide inspired)
    "order/properties-order": [
      "position",
      "top",
      "right",
      "bottom",
      "left",
      "z-index",
      "display",
      "flex-direction",
      "justify-content",
      "align-items",
      "width",
      "height",
      "padding",
      "margin",
      "font-family",
      "font-size",
      "line-height",
      "color",
      "background",
      "border",
      "border-radius",
      "opacity",
      "transform",
      "transition",
    ],
  },
};
