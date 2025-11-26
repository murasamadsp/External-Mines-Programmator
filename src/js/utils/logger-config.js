/**
 * Конфігурація системи логування
 * Дозволяє налаштовувати рівень логування для різних середовищ
 */

import { Logger, LOG_LEVELS, loggers } from "./logger.js";

// Налаштування рівня логування залежно від середовища
export function configureLogger() {
  const finalLevel = determineLogLevel();
  applyLoggerSettings(finalLevel);
  return finalLevel;
}

// Визначає рівень логування з пріоритетами: URL > localStorage > default
function determineLogLevel() {
  const isDevelopment = import.meta?.env?.DEV || window.location.hostname === "localhost";
  const defaultLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

  // Спроба отримати рівень з URL
  const urlLevel = getLogLevelFromUrl();
  if (urlLevel !== null) {
    return urlLevel;
  }

  // Спроба отримати рівень з localStorage
  const storedLevel = getLogLevelFromStorage();
  if (storedLevel !== null) {
    return storedLevel;
  }

  return defaultLevel;
}

// Отримує рівень логування з URL параметрів
function getLogLevelFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLogLevel = urlParams.get("loglevel");

  if (urlLogLevel) {
    const parsedLevel = parseLogLevel(urlLogLevel);
    if (parsedLevel !== null) {
      // Зберігаємо в localStorage для майбутніх сесій
      loggers.storage.debug(`Збереження рівня логування ${LOG_LEVELS[parsedLevel]} в localStorage`);
      localStorage.setItem("emp-log-level", LOG_LEVELS[parsedLevel]);
      loggers.storage.info(`Рівень логування встановлено через URL: ${LOG_LEVELS[parsedLevel]}`);
      return parsedLevel;
    }
  }

  return null;
}

// Отримує рівень логування з localStorage
function getLogLevelFromStorage() {
  const storedLogLevel = localStorage.getItem("emp-log-level");

  if (storedLogLevel) {
    const parsedLevel = parseInt(storedLogLevel);
    if (!isNaN(parsedLevel) && parsedLevel >= 0 && parsedLevel <= 4) {
      loggers.storage.debug(`Завантажено рівень логування з localStorage: ${LOG_LEVELS[parsedLevel]}`);
      return parsedLevel;
    }
  }

  return null;
}

// Застосовує налаштування логування
function applyLoggerSettings(level) {
  const isDevelopment = import.meta?.env?.DEV || window.location.hostname === "localhost";

  Logger.setLevel(level);
  Logger.setColors(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  Logger.setTimestamps(true);
  Logger.setCallerInfo(isDevelopment);
}

// Маппинг рядкових значень до числових рівнів логування
const LOG_LEVEL_MAP = {
  "DEBUG": LOG_LEVELS.DEBUG,
  "0": LOG_LEVELS.DEBUG,
  "INFO": LOG_LEVELS.INFO,
  "1": LOG_LEVELS.INFO,
  "WARN": LOG_LEVELS.WARN,
  "WARNING": LOG_LEVELS.WARN,
  "2": LOG_LEVELS.WARN,
  "ERROR": LOG_LEVELS.ERROR,
  "3": LOG_LEVELS.ERROR,
  "OFF": LOG_LEVELS.OFF,
  "NONE": LOG_LEVELS.OFF,
  "4": LOG_LEVELS.OFF,
};

/**
 * Парсить рядковий рівень логування
 */
function parseLogLevel(levelStr) {
  if (!levelStr) return null;

  const upperStr = levelStr.toUpperCase();
  const level = LOG_LEVEL_MAP[upperStr];

  if (level !== undefined) {
    return level;
  }

  loggers.storage.warn(`Невідомий рівень логування: ${levelStr}`);
  return null;
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
          `Рівень логування встановлено: ${Object.keys(LOG_LEVELS)[parsedLevel]}`,
        );
      }
    },

    getLevel: () => {
      const currentLevel = Object.keys(LOG_LEVELS).find(
        key => LOG_LEVELS[key] === Logger.level,
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
