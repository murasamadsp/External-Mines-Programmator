// Упрощенная Stylelint конфигурация - фокус на качестве, не форматировании
// Prettier обрабатывает форматирование, Stylelint - логику и стиль
module.exports = {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-order"],
  rules: {
    // Code Guide правила
    "color-function-notation": "modern", // rgb() вместо rgba()
    "color-hex-length": "short", // #fff вместо #ffffff
    "color-named": "never", // Запрет названий цветов

    // BEM нейминг (без лишних проверок)
    "selector-class-pattern": "^[a-z][a-zA-Z0-9_-]+$", // Разрешаем _

    // Ограничение глубины вложенности
    "max-nesting-depth": 3,

    // Разрешаем пустые блоки для placeholder стилей
    "block-no-empty": null,

    // Простой порядок свойств (Code Guide inspired)
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
