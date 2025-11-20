/**
 * UI Constants
 * Константи інтерфейсу користувача для забезпечення консистентності
 * в кольорах, розмірах та анімаціях
 */

// Колірна палітра (відповідає CSS custom properties)
export const UI_COLORS = {
  background: "#6a5aaa",
  backgroundSecondary: "#564190",
  text: "#faf",
  primary: "#007bff",
  secondary: "#6c757d",
  textGlow: "rgba(255, 255, 255, 0.2)",
  success: "#28a745",
  danger: "#dc3545",
  border: "rgba(255, 255, 255, 0.1)",
  hoverBg: "rgba(255, 255, 255, 0.05)",
};

// Розміри та інтервали
export const UI_SIZES = {
  maxWidth: "1200px",
  spacingHorizontal: "40px",
  borderRadius: "4px",
  borderWidth: "1px",

  // Розміри сітки
  gridCellSize: 40,
  gridGap: 1,
  gridPadding: 10,

  // Розміри кнопок
  buttonHeight: "36px",
  buttonPadding: "8px 16px",

  // Розміри діалогів
  dialogMaxWidth: "500px",
  dialogPadding: "20px",

  // Розміри палітри дій
  actionPaletteWidth: "200px",
  actionButtonSize: "32px",
};

// Анімації та переходи
export const UI_ANIMATIONS = {
  transition: "all 0.2s ease-in-out",
  transitionFast: "all 0.1s ease-in-out",
  transitionSlow: "all 0.3s ease-in-out",

  // Тривалості
  duration: {
    fast: 100,
    normal: 200,
    slow: 300,
  },

  // Функції послаблення
  easing: {
    easeInOut: "ease-in-out",
    easeOut: "ease-out",
    easeIn: "ease-in",
  },
};

// Z-index шари
export const UI_Z_INDEX = {
  base: 1,
  overlay: 100,
  dialog: 200,
  tooltip: 300,
  dropdown: 400,
};

// Тіні
export const UI_SHADOWS = {
  small: "0 2px 4px rgba(0, 0, 0, 0.1)",
  medium: "0 4px 8px rgba(0, 0, 0, 0.15)",
  large: "0 8px 16px rgba(0, 0, 0, 0.2)",
};

// Типографіка
export const UI_TYPOGRAPHY = {
  fontFamily: '"Google Sans Code", sans-serif',
  fontSize: {
    small: "12px",
    normal: "14px",
    large: "16px",
    xlarge: "18px",
    xxlarge: "24px",
  },
  fontWeight: {
    normal: 400,
    bold: 700,
  },
  lineHeight: {
    normal: 1.5,
    tight: 1.2,
    loose: 1.8,
  },
};

// Breakpoints для адаптивного дизайну
export const UI_BREAKPOINTS = {
  mobile: "768px",
  tablet: "1024px",
  desktop: "1200px",
};

// Клавіші для обробки подій
export const UI_KEYS = {
  ENTER: "Enter",
  ESCAPE: "Escape",
  SPACE: " ",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
};

// CSS класи для повторного використання
export const UI_CLASSES = {
  button: "ui-button",
  buttonPrimary: "ui-button--primary",
  buttonSecondary: "ui-button--secondary",
  buttonDanger: "ui-button--danger",
  dialog: "ui-dialog",
  dialogOverlay: "ui-dialog-overlay",
  input: "ui-input",
  label: "ui-label",
  loading: "ui-loading",
  hidden: "ui-hidden",
  disabled: "ui-disabled",
};

// Повідомлення та лейбли
export const UI_MESSAGES = {
  loading: "Завантаження...",
  saving: "Збереження...",
  error: "Помилка",
  success: "Успішно",
  confirm: "Підтвердити",
  cancel: "Скасувати",
  close: "Закрити",
  ok: "OK",
  pageIndicator: "Page {current}/{total}",
};

// Таймаути для асинхронних операцій
export const UI_TIMEOUTS = {
  debounce: 300,
  tooltip: 2000,
  notification: 3000,
  autosave: 30000,
};
