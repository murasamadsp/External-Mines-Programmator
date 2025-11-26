// Minimal Stylelint configuration for existing codebase
// Only basic checks to ensure code works
module.exports = {
  rules: {
    "color-named": "never", // Prohibit named colors
    "length-zero-no-unit": true, // 0 instead of 0px
  },
};
