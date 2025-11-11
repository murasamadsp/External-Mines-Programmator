// PostCSS config - минимальный для современных браузеров
// Autoprefixer удален - современные браузеры не требуют префиксов
module.exports = {
  plugins: [
    // Можно добавить другие плагины при необходимости:
    // require('cssnano') - для минификации
    // require('postcss-preset-env') - для современных функций
  ],
};
