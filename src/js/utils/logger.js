/**
 * Система логирования с многоуровневой поддержкой
 * Уровни: DEBUG, INFO, WARN, ERROR, OFF
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  OFF: 4,
};

export const LOG_LEVEL_NAMES = {
  [LOG_LEVELS.DEBUG]: "DEBUG",
  [LOG_LEVELS.INFO]: "INFO",
  [LOG_LEVELS.WARN]: "WARN",
  [LOG_LEVELS.ERROR]: "ERROR",
  [LOG_LEVELS.OFF]: "OFF",
};

/**
 * Конфигурация логгера
 */
const LOG_CONFIG = {
  level: LOG_LEVELS.DEBUG, // Минимальный уровень логирования
  enableTimestamp: true,
  enableColors: true,
  enableCallerInfo: true,
};

/**
 * Цвета для разных уровней логирования
 */
const LOG_COLORS = {
  [LOG_LEVELS.DEBUG]: "\x1b[36m", // Cyan
  [LOG_LEVELS.INFO]: "\x1b[32m", // Green
  [LOG_LEVELS.WARN]: "\x1b[33m", // Yellow
  [LOG_LEVELS.ERROR]: "\x1b[31m", // Red
  reset: "\x1b[0m",
};

/**
 * Основной класс логгера
 */
export class Logger {
  constructor(context = "APP") {
    this.context = context;
  }

  /**
   * Проверяет, нужно ли логировать на данном уровне
   */
  shouldLog(level) {
    return level >= LOG_CONFIG.level;
  }

  /**
   * Форматирует сообщение для логирования
   */
  formatMessage(level, message, ..._args) {
    const timestamp = LOG_CONFIG.enableTimestamp
      ? new Date().toISOString()
      : "";
    const levelName = LOG_LEVEL_NAMES[level];
    const callerInfo = LOG_CONFIG.enableCallerInfo ? this.getCallerInfo() : "";

    let formattedMessage = "";

    if (LOG_CONFIG.enableColors) {
      formattedMessage = `${LOG_COLORS[level]}[${levelName}]${LOG_COLORS.reset}`;
    } else {
      formattedMessage = `[${levelName}]`;
    }

    if (timestamp) {
      formattedMessage += ` ${timestamp}`;
    }

    formattedMessage += ` ${this.context}`;

    if (callerInfo) {
      formattedMessage += ` ${callerInfo}`;
    }

    formattedMessage += `: ${message}`;

    return formattedMessage;
  }

  /**
   * Получает информацию о вызывающем коде
   */
  getCallerInfo() {
    const error = new Error();
    const stack = error.stack || "";
    const stackLines = stack.split("\n");

    // Ищем первую строку стека после текущего метода
    for (let i = 0; i < stackLines.length; i++) {
      const line = stackLines[i];
      if (line.includes("Logger.") && line.includes("formatMessage")) {
        // Следующая строка должна содержать реального вызывающего
        if (i + 1 < stackLines.length) {
          const callerLine = stackLines[i + 1].trim();
          // Извлекаем имя файла и номер строки
          const match = callerLine.match(
            /at\s+(?:.*?\s+)?(?:\(|\s)([^:)]+):(\d+):(\d+)/,
          );
          if (match) {
            const [, file, line] = match;
            const fileName = file.split("/").pop() || file;
            return `${fileName}:${line}`;
          }
        }
        break;
      }
    }

    return "";
  }

  /**
   * Логирование уровня DEBUG
   */
  debug(message, ...args) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, ...args));
    }
  }

  /**
   * Логирование уровня INFO
   */
  info(message, ...args) {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.info(this.formatMessage(LOG_LEVELS.INFO, message, ...args));
    }
  }

  /**
   * Логирование уровня WARN
   */
  warn(message, ...args) {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this.formatMessage(LOG_LEVELS.WARN, message, ...args));
    }
  }

  /**
   * Логирование уровня ERROR
   */
  error(message, ...args) {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this.formatMessage(LOG_LEVELS.ERROR, message, ...args));
    }
  }

  /**
   * Создание дочернего логгера с новым контекстом
   */
  child(context) {
    return new Logger(`${this.context}:${context}`);
  }

  /**
   * Установка уровня логирования
   */
  static setLevel(level) {
    if (typeof level === "string") {
      const upperLevel = level.toUpperCase();
      level = LOG_LEVELS[upperLevel];
    }

    if (
      level !== undefined &&
      level >= LOG_LEVELS.DEBUG &&
      level <= LOG_LEVELS.OFF
    ) {
      LOG_CONFIG.level = level;
      console.log(`🔧 Logger level set to: ${LOG_LEVEL_NAMES[level]}`);
    } else {
      console.warn(`⚠️ Invalid log level: ${level}`);
    }
  }

  /**
   * Включение/отключение цветов
   */
  static setColors(enabled) {
    LOG_CONFIG.enableColors = enabled;
  }

  /**
   * Включение/отключение временных меток
   */
  static setTimestamps(enabled) {
    LOG_CONFIG.enableTimestamp = enabled;
  }

  /**
   * Включение/отключение информации о вызывающем
   */
  static setCallerInfo(enabled) {
    LOG_CONFIG.enableCallerInfo = enabled;
  }
}

/**
 * Глобальный экземпляр логгера для приложения
 */
export const logger = new Logger("EMP");

/**
 * Специализированные логгеры для разных частей приложения
 */
export const loggers = {
  // Основное приложение
  app: logger,

  // Пользовательский интерфейс
  ui: logger.child("UI"),

  // Редактор программы
  editor: logger.child("EDITOR"),

  // Сервисы приложения
  services: logger.child("SERVICES"),

  // Ядро приложения
  core: logger.child("CORE"),

  // Сериализация и импорт/экспорт
  serialization: logger.child("SERIAL"),

  // Валидация программ
  validation: logger.child("VALIDATION"),

  // Сетевое взаимодействие
  network: logger.child("NET"),

  // Работа с хранилищем
  storage: logger.child("STORAGE"),
};

/**
 * Установка уровня логирования из переменных окружения
 */
export function initLogger() {
  // В браузере можно использовать localStorage или URL параметры
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const logLevel =
      urlParams.get("loglevel") || localStorage.getItem("emp-log-level");

    if (logLevel) {
      Logger.setLevel(logLevel);
      logger.info(`Logger initialized with level: ${logLevel}`);
    }
  }

  // Логируем инициализацию
  logger.info("🚀 External Mines Programmator logger initialized");
  logger.debug("Debug logging enabled");
}

/**
 * Экспорт по умолчанию
 */
export default Logger;

