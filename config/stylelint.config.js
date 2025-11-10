// Спрощена Stylelint конфігурація - фокус на якості, не форматуванні
// Prettier обробляє форматування, Stylelint - логіку та стиль
module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  rules: {
    // Code Guide правила
    'color-function-notation': 'modern', // rgb() замість rgba()
    'color-hex-length': 'short', // #fff замість #ffffff
    'color-named': 'never', // Заборона назв кольорів

    // BEM неймінг (без надлишкових перевірок)
    'selector-class-pattern': '^[a-z][a-zA-Z0-9_-]+$', // Дозволяємо _

    // Обмеження глибини вкладеності
    'max-nesting-depth': 3,

    // Дозволяємо пусті блоки для placeholder стилів
    'block-no-empty': null,

    // Простий порядок властивостей (Code Guide inspired)
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'display',
      'flex-direction',
      'justify-content',
      'align-items',
      'width',
      'height',
      'padding',
      'margin',
      'font-family',
      'font-size',
      'line-height',
      'color',
      'background',
      'border',
      'border-radius',
      'opacity',
      'transform',
      'transition',
    ],
  },
};
