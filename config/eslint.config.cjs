const js = require("@eslint/js");
const importPlugin = require("eslint-plugin-import");
const jsdocPlugin = require("eslint-plugin-jsdoc");
const promisePlugin = require("eslint-plugin-promise");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
  // Базовые правила для JavaScript
  js.configs.recommended,

  // Плагины
  {
    plugins: {
      import: importPlugin,
      jsdoc: jsdocPlugin,
      promise: promisePlugin,
      prettier: prettierPlugin,
    },
  },

  // Глобальные настройки
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        performance: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        FileReader: "readonly",
        CustomEvent: "readonly",
        Event: "readonly",
        HTMLElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLSelectElement: "readonly",
        Node: "readonly",
        NodeList: "readonly",
        DOMTokenList: "readonly",
        Map: "readonly",
        Set: "readonly",
        WeakMap: "readonly",
        WeakSet: "readonly",
        Array: "readonly",
        Object: "readonly",
        String: "readonly",
        Number: "readonly",
        Boolean: "readonly",
        Math: "readonly",
        JSON: "readonly",
        Promise: "readonly",
        Error: "readonly",
        RegExp: "readonly",
        Date: "readonly",
        Int8Array: "readonly",
        Uint8Array: "readonly",
        Uint8ClampedArray: "readonly",
        Int16Array: "readonly",
        Uint16Array: "readonly",
        Int32Array: "readonly",
        Uint32Array: "readonly",
        Float32Array: "readonly",
        Float64Array: "readonly",
        BigInt64Array: "readonly",
        BigUint64Array: "readonly",
        ArrayBuffer: "readonly",
        DataView: "readonly",
        BigInt: "readonly",
        Symbol: "readonly",
        Reflect: "readonly",
        Proxy: "readonly",
        Intl: "readonly",
        WebAssembly: "readonly",
        // Browser APIs для Vite
        globalThis: "readonly",
        crypto: "readonly",
        // Browser storage
        localStorage: "readonly",
        sessionStorage: "readonly",
        // Vite globals
        import: "readonly",
        export: "readonly",
        // Тестовые globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        assert: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },

    rules: {
      // === Стиль кода ===
      indent: ["error", 2, { SwitchCase: 1 }],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
      "no-trailing-spaces": "error",
      "eol-last": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "comma-spacing": ["error", { before: false, after: true }],
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "space-before-function-paren": [
        "error",
        { anonymous: "never", named: "never", asyncArrow: "always" },
      ],
      "space-in-parens": ["error", "never"],
      "space-before-blocks": "error",
      "keyword-spacing": "error",
      "arrow-spacing": "error",
      "brace-style": ["error", "1tbs", { allowSingleLine: true }],

      // === Лучшие практики ===
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-console": "off", // Дозволяємо console для логування
      "no-debugger": "error",
      "no-alert": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-sequences": "error",
      "no-throw-literal": "error",
      "no-unmodified-loop-condition": "error",
      "no-unused-labels": "error",
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "prefer-promise-reject-errors": "error",
      "require-await": "error",
      "no-return-await": "error",

      // === Безопасность ===
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",

      // === Импорты ===
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",
      "import/no-absolute-path": "error",
      "import/no-dynamic-require": "error",
      "import/no-self-import": "error",
      "import/no-cycle": "error",
      "import/no-useless-path-segments": "error",
      "import/export": "error",

      // === Современный JavaScript ===
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "template-curly-spacing": "error",
      "arrow-parens": ["error", "as-needed"],
      "arrow-body-style": ["error", "as-needed"],
      "prefer-destructuring": ["error", { object: true, array: false }],
      "prefer-spread": "error",
      "prefer-rest-params": "error",
      "prefer-object-spread": "error",
      "object-shorthand": "error",
      "no-useless-computed-key": "error",
      "no-useless-rename": "error",
      "prefer-numeric-literals": "error",
      "prefer-exponentiation-operator": "error",

      // === Производительность ===
      "no-loop-func": "error",
      "no-new-wrappers": "error",
      "no-extend-native": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "ForInStatement",
          message:
            "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
        },
        {
          selector: "LabeledStatement",
          message:
            "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
        },
        {
          selector: "WithStatement",
          message:
            "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
        },
        {
          selector:
            'CallExpression[callee.name="setTimeout"][arguments.0.value=0]',
          message:
            "setTimeout with 0 delay can cause accessibility issues. Use requestAnimationFrame or proper scheduling.",
        },
      ],

      // === Сложность кода ===
      complexity: ["warn", 10],
      "max-depth": ["warn", 4],
      "max-lines": ["warn", 300],
      "max-lines-per-function": ["warn", 50],
      "max-nested-callbacks": ["warn", 3],
      "max-params": ["warn", 4],

      // === Доступність (Accessibility) ===
      // Note: For comprehensive accessibility linting, consider eslint-plugin-jsx-a11y for React/Vue projects
      "no-irregular-whitespace": "error", // General accessibility best practices

      // === JSDoc ===
      "jsdoc/check-access": "warn",
      "jsdoc/check-alignment": "warn",
      "jsdoc/check-param-names": "warn",
      "jsdoc/check-property-names": "warn",
      "jsdoc/check-tag-names": "warn",
      "jsdoc/check-types": "warn",
      "jsdoc/check-values": "warn",
      "jsdoc/empty-tags": "warn",
      "jsdoc/implements-on-classes": "warn",
      "jsdoc/multiline-blocks": "warn",
      "jsdoc/no-multi-asterisks": "warn",
      "jsdoc/no-undefined-types": "warn",
      "jsdoc/require-description": "warn",
      "jsdoc/require-description-complete-sentence": "off",
      "jsdoc/require-example": "off",
      "jsdoc/require-hyphen-before-param-description": "warn",
      "jsdoc/require-param": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-param-name": "warn",
      "jsdoc/require-param-type": "warn",
      "jsdoc/require-property": "warn",
      "jsdoc/require-property-description": "warn",
      "jsdoc/require-property-name": "warn",
      "jsdoc/require-property-type": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-check": "warn",
      "jsdoc/require-returns-description": "warn",
      "jsdoc/require-returns-type": "warn",
      "jsdoc/valid-types": "warn",

      // === Promise ===
      "promise/always-return": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/catch-or-return": "error",
      "promise/no-native": "off",
      "promise/no-nesting": "warn",
      "promise/no-promise-in-callback": "warn",
      "promise/no-callback-in-promise": "warn",
      "promise/avoid-new": "off",
      "promise/no-new-statics": "error",
      "promise/no-return-in-finally": "warn",
      "promise/valid-params": "warn",

      // === Prettier ===
      "prettier/prettier": ["error", require("./prettier.config.cjs")],
    },
  },

  // Специфические правила для тестов
  {
    files: ["**/__tests__/**/*.js", "**/*.test.js", "**/test/**/*.js"],
    rules: {
      "no-console": "off",
      "max-lines-per-function": "off",
      complexity: "off",
    },
  },

  // Специфические правила для файлов логгера
  {
    files: ["**/utils/logger*.js"],
    rules: {
      "comma-dangle": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-param-type": "off",
    },
  },

  // Специфические правила для конфигурационных файлов
  {
    files: ["*.config.js", "config/**/*.js"],
    rules: {
      "no-console": "off",
    },
  },
];
