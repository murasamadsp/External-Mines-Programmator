/**
 * Конфігурація системи логування
 * Дозволяє налаштовувати рівень логування для різних середовищ
 */

import { Logger, LOG_LEVELS, loggers } from "./logger.js";

// Налаштування рівня логування залежно від середовища
export function configureLogger() {
  // У режимі розробки - DEBUG рівень
  // У продакшені - INFO рівень
  const isDevelopment =
    import.meta?.env?.DEV || window.location.hostname === "localhost";
  const defaultLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

  // Перевіряємо URL параметри
  const urlParams = new URLSearchParams(window.location.search);
  const urlLogLevel = urlParams.get("loglevel");

  // Перевіряємо localStorage
  const storedLogLevel = localStorage.getItem("emp-log-level");

  // Пріоритет: URL > localStorage > default
  let finalLevel = defaultLevel;

  if (urlLogLevel) {
    const parsedLevel = parseLogLevel(urlLogLevel);
    if (parsedLevel !== null) {
      finalLevel = parsedLevel;
      // Зберігаємо в localStorage для майбутніх сесій
      loggers.storage.debug(`Збереження рівня логування ${LOG_LEVELS[parsedLevel]} в localStorage`);
      localStorage.setItem("emp-log-level", LOG_LEVELS[parsedLevel]);
      loggers.storage.info(`Рівень логування встановлено через URL: ${LOG_LEVELS[parsedLevel]}`);
    }
  } else if (storedLogLevel) {
    const parsedLevel = parseInt(storedLogLevel);
    if (!isNaN(parsedLevel) && parsedLevel >= 0 && parsedLevel <= 4) {
      finalLevel = parsedLevel;
      loggers.storage.debug(`Завантажено рівень логування з localStorage: ${LOG_LEVELS[parsedLevel]}`);
    }
  }

  Logger.setLevel(finalLevel);

  // Налаштування інших параметрів логування
  Logger.setColors(
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  Logger.setTimestamps(true);
  Logger.setCallerInfo(isDevelopment);

  return finalLevel;
}

/**
 * Парсить рядковий рівень логування
 */
function parseLogLevel(levelStr) {
  if (!levelStr) return null;

  const upperStr = levelStr.toUpperCase();

  switch (upperStr) {
    case "DEBUG":
    case "0":
      return LOG_LEVELS.DEBUG;
    case "INFO":
    case "1":
      return LOG_LEVELS.INFO;
    case "WARN":
    case "WARNING":
    case "2":
      return LOG_LEVELS.WARN;
    case "ERROR":
    case "3":
      return LOG_LEVELS.ERROR;
    case "OFF":
    case "NONE":
    case "4":
      return LOG_LEVELS.OFF;
    default:
      loggers.storage.warn(`Невідомий рівень логування: ${levelStr}`);
      return null;
  }
}

/**
 * Утиліти для керування логуванням через консоль
 */
if (typeof window !== "undefined") {
  window.LoggerAPI = {
    setLevel: level => {
      const parsedLevel =
        typeof level === "string" ? parseLogLevel(level) : level;
      if (parsedLevel !== null) {
        Logger.setLevel(parsedLevel);
        localStorage.setItem("emp-log-level", parsedLevel);
        console.log(
          `Рівень логування встановлено: ${Object.keys(LOG_LEVELS)[parsedLevel]}`
        );
      }
    },

    getLevel: () => {
      const currentLevel = Object.keys(LOG_LEVELS).find(
        key => LOG_LEVELS[key] === Logger.level
      );
      console.log(`Поточний рівень логування: ${currentLevel}`);
      return currentLevel;
    },

    enableDebug: () => window.LoggerAPI.setLevel("DEBUG"),
    enableInfo: () => window.LoggerAPI.setLevel("INFO"),
    disableLogs: () => window.LoggerAPI.setLevel("OFF"),

    help: () => {
      console.log(`
LoggerAPI - керування логуванням EMP:

LoggerAPI.setLevel(level) - встановити рівень логування
  level: 'DEBUG', 'INFO', 'WARN', 'ERROR', 'OFF' або 0-4

LoggerAPI.getLevel() - отримати поточний рівень

LoggerAPI.enableDebug() - увімкнути DEBUG логування
LoggerAPI.enableInfo() - встановити INFO рівень
LoggerAPI.disableLogs() - вимкнути логування

Рівні логування зберігаються в localStorage.
Також можна використовувати URL параметр: ?loglevel=DEBUG
    `);
    },
  };
}

// Показуємо довідку при першому запуску в режимі розробки
if (import.meta?.env?.DEV) {
  setTimeout(() => {
    console.log("💡 Для керування логуванням використовуйте LoggerAPI.help()");
  }, 1000);
}
