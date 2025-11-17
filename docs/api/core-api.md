# 🔧 Core API Documentation

## 🎯 Обзор

Core API предоставляет основные интерфейсы для работы с программами бота, их сериализацией и валидацией.

## 📋 Program Class

### Конструктор
```javascript
new Program()
```

Создает новый экземпляр программы.

### Свойства
```javascript
program.instructions // Array<Instruction> - массив инструкций
program.pageWidth    // number - ширина страницы (16)
program.pageHeight   // number - высота страницы (12)
program.maxPages     // number - максимум страниц (16)
```

### Методы

#### Управление инструкциями
```javascript
// Получить инструкцию по координатам
Instruction getInstructionAt(x: number, y: number, page: number)

// Установить инструкцию
void setInstructionAt(x: number, y: number, action: number, label?: string, value?: number, page: number)

// Получить все инструкции страницы
Array<Instruction> getPageInstructions(page: number)

// Очистить страницу
void clearPage(page: number)

// Проверить, пустая ли страница
boolean isPageEmpty(page: number)
```

#### Экспорт/Импорт
```javascript
// Экспорт в разные форматы
string toBase64Format()     // Base64 с LZMA компрессией
string toTextFormat()       // Читаемый текстовый формат
string toCodesFormat()      // Только коды действий

// Импорт из строки
boolean fromString(source: string)

// Валидация программы
ValidationResult validate()
```

#### Утилиты
```javascript
// Клонирование программы
Program clone()

// Получить статистику
ProgramStats getStats()

// Найти использование лейбла
Array<Position> findLabelUsage(label: string)
```

### Примеры использования

```javascript
// Создание программы
const program = new Program();

// Добавление инструкции
program.setInstructionAt(0, 0, ProgAction.Forward, null, null, 0);

// Получение инструкции
const instruction = program.getInstructionAt(0, 0, 0);
console.log(instruction.action); // 1 (Forward)

// Экспорт
const base64 = program.toBase64Format();
```

## 📄 Instruction Class

### Конструктор
```javascript
new Instruction(action: number, label?: string, value?: number)
```

### Свойства
```javascript
instruction.action  // number - код действия (ProgAction)
instruction.label   // string|null - текстовая метка
instruction.value   // number|null - числовое значение
```

### Методы
```javascript
// Клонирование
Instruction clone()

// Проверка на пустоту
boolean isEmpty()

// Сериализация для хранения
object toJSON()

// Десериализация
static Instruction fromJSON(data: object)
```

### Примеры

```javascript
// Простая инструкция
const forward = new Instruction(ProgAction.Forward);

// Инструкция с лейблом
const goto = new Instruction(ProgAction.Goto, "loop");

// Инструкция со значением
const setVar = new Instruction(ProgAction.SetNumberToVar, null, 42);

// Проверка
if (instruction.isEmpty()) {
  console.log("Empty cell");
}
```

## 🔧 ProgramSerializer Class

### Статические методы

#### Определение формата
```javascript
// Автоматическое определение формата
ProgramFormatVersion probeFormatVersion(source: string)
```

#### Декодирование
```javascript
// Декодирование из разных форматов
Array<Instruction> decodeV1(source: string)                    // Version1
Array<Instruction> decodeV2(source: string)                    // Base64 (LZMA)
Array<Instruction> decodeV3(source: string)                    // Version3 (читаемый)
Array<Instruction> decodeV4(source: string)                    // Packed

// Универсальный декодер
Array<Instruction> decode(source: string, format?: ProgramFormatVersion)
```

#### Кодирование
```javascript
// Кодирование в разные форматы
string encodeV1(instructions: Array<Instruction>)              // Version1
string encodeV2(instructions: Array<Instruction>)              // Base64 (LZMA)
string encodeV3(instructions: Array<Instruction>)              // Version3
string encodeV4(instructions: Array<Instruction>)              // Packed

// Универсальный кодер
string encode(instructions: Array<Instruction>, format: ProgramFormatVersion)
```

### Примеры

```javascript
// Декодирование Base64 программы
const instructions = await ProgramSerializer.decodeV2(base64String);

// Кодирование в читаемый формат
const textProgram = ProgramSerializer.encodeV3(instructions);

// Автоматическое определение формата
const format = ProgramSerializer.probeFormatVersion(source);
const instructions = await ProgramSerializer.decode(source, format);
```

## ✅ ValidationResult Class

### Свойства
```javascript
validationResult.isValid       // boolean - общая валидность
validationResult.errors        // Array<ValidationError> - ошибки
validationResult.warnings      // Array<ValidationWarning> - предупреждения
validationResult.stats         // ProgramStats - статистика программы
```

### ValidationError
```javascript
{
  type: 'error' | 'warning',
  code: string,           // Код ошибки ('INVALID_ACTION', 'MISSING_LABEL', etc.)
  message: string,        // Человеко-читаемое сообщение
  position: Position,     // Позиция ошибки {x, y, page}
  instruction: Instruction // Проблемная инструкция
}
```

## 📊 ProgramStats Class

### Свойства
```javascript
stats.totalInstructions        // number - общее количество инструкций
stats.pagesUsed               // number - используемых страниц
stats.uniqueActions           // number - уникальных действий
stats.labelsUsed              // Array<string> - используемые лейблы
stats.missingLabels           // Array<string> - отсутствующие лейблы
stats.unusedLabels            // Array<string> - неиспользуемые лейблы
stats.complexity              // number - оценка сложности (0-100)
```

## 🎯 ProgAction Enum API

### Доступ к enum
```javascript
import { ProgAction } from './core/constants/actions.js';

// Использование
const action = ProgAction.Forward;  // 1
const name = ProgAction[action];    // "Forward"
```

### Проверка типов действий
```javascript
// Требует ли действие лейбл?
function needsLabel(action: number): boolean {
  return [ProgAction.Goto, ProgAction.Call, /* ... */].includes(action);
}

// Требует ли действие значение?
function needsValue(action: number): boolean {
  return action >= ProgAction.VarGreaterThanNumber &&
         action <= ProgAction.SubNumberToVar;
}

// Получить категорию действия
function getActionCategory(action: number): string {
  if (action >= 1 && action <= 9) return 'basic';
  if (action >= 70 && action <= 119) return 'variables';
  // ...
}
```

## 🔄 LZMA Compression API

### LZMACompressor Class
```javascript
// Компрессия
Uint8Array compress(data: Uint8Array): Promise<Uint8Array>

// Декомпрессия
Uint8Array decompress(data: Uint8Array): Promise<Uint8Array>

// Проверка доступности
boolean isAvailable(): boolean
```

### Использование
```javascript
import LZMACompressor from './services/lzma-js-polyfill.js';

// Компрессия данных
const compressed = await LZMACompressor.compress(originalData);

// Декомпрессия
const decompressed = await LZMACompressor.decompress(compressedData);
```

## 🎨 Formatter API

### ProgramFormatter Functions

#### Форматирование инструкций
```javascript
// Получить короткий код действия
string getActionShortCode(action: number)

// Получить полное описание
string getActionDescription(action: number)

// Форматировать инструкцию для отображения
FormattedInstruction formatInstruction(instruction: Instruction)
```

#### FormattedInstruction
```javascript
{
  shortCode: string,      // Короткий код ("↑", "V=S", "?")
  description: string,    // Полное описание
  category: string,       // Категория действия
  hasLabel: boolean,      // Есть ли лейбл
  hasValue: boolean       // Есть ли значение
}
```

### Примеры

```javascript
import { formatInstruction, getActionShortCode } from './utils/formatters/program-formatter.js';

// Форматирование инструкции
const formatted = formatInstruction(instruction);
console.log(formatted.shortCode);     // "V=42"
console.log(formatted.description);   // "Set variable to 42"

// Только код действия
const code = getActionShortCode(ProgAction.Forward); // "↑"
```

## 🚨 Error Handling

### Типы ошибок
```javascript
class ValidationError extends Error {
  constructor(code: string, message: string, position?: Position)
}

class SerializationError extends Error {
  constructor(format: ProgramFormatVersion, message: string)
}

class LZMAError extends Error {
  constructor(operation: string, message: string)
}
```

### Graceful degradation
```javascript
try {
  const result = await LZMACompressor.compress(data);
} catch (error) {
  if (error instanceof LZMAError) {
    console.warn('LZMA unavailable, using fallback');
    // Fallback логика
  }
}
```

## 📋 Constants API

### Grid Constants
```javascript
import { GRID_WIDTH, GRID_HEIGHT, MAX_PAGES, MAX_INSTRUCTIONS } from './core/constants/grid.js';

console.log(GRID_WIDTH);     // 16
console.log(GRID_HEIGHT);    // 12
console.log(MAX_PAGES);      // 16
console.log(MAX_INSTRUCTIONS); // 3072 (16*12*16)
```

### Format Versions
```javascript
import { ProgramFormatVersion } from './core/constants/formats.js';

const formats = {
  Version1: 0,    // Простой текст
  Base64: 1,      // LZMA + Base64
  Version3: 2,    // Читаемый формат
  Packed: 3       // Packed бинарный
};
```

## 🔍 Validators API

### Program Validation
```javascript
import { validateProgram } from './utils/validators/program-validator.js';

// Валидация массива инструкций
ValidationResult validateProgram(instructions: Array<Instruction>): ValidationResult

// Проверка отдельных инструкций
boolean validateInstruction(instruction: Instruction): boolean

// Проверка лейблов
LabelValidationResult validateLabels(instructions: Array<Instruction>)
```

### Примеры использования

```javascript
// Полная валидация программы
const result = validateProgram(instructions);
if (!result.isValid) {
  result.errors.forEach(error => {
    console.error(`${error.position}: ${error.message}`);
  });
}

// Проверка лейблов
const labelResult = validateLabels(instructions);
console.log('Missing labels:', labelResult.missing);
console.log('Unused labels:', labelResult.unused);
```

---

## 📚 Ссылки на спецификации

- [ProgAction Enum Spec](./specs/ProgAction-enum.md)
- [Program Format Spec](./specs/Program-format.md)
- [LZMA Compression Spec](./specs/lzma-compression.md)

---
*API Version: 1.0.0*
*Last Updated: November 2025*
