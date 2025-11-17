# 🏗️ Архитектура External Mines Programmator

## 🎯 Обзор

External Mines Programmator (EMP) - это веб-приложение для визуального программирования ботов в игре Mines. Архитектура построена на принципах модульности, производительности и поддерживаемости.

## 🏛️ Архитектурные принципы

### 🎨 Frontend-First
- **Vanilla JavaScript**: Без фреймворков для максимальной производительности
- **ES Modules**: Современная модульная система
- **Web Components**: Переиспользуемые UI компоненты

### 🔧 Сервис-Ориентированная Архитектура
- **Core**: Бизнес-логика и модели данных
- **Services**: Внешние сервисы (компрессия, валидация)
- **UI**: Презентационный слой
- **Utils**: Вспомогательные функции

### 📦 Модульная структура

```
src/
├── core/                    # Бизнес-логика
│   ├── constants/          # Константы и enum
│   ├── models/             # Модели данных
│   └── services/           # Сервисы
├── components/             # UI компоненты
│   └── editor/             # Редактор программатора
├── utils/                  # Утилиты
│   ├── formatters/         # Форматирование данных
│   ├── helpers/            # Вспомогательные функции
│   └── validators/         # Валидация
└── assets/                 # Статические ресурсы
```

## 🔄 Поток данных

### 🎮 Пользователь → Программа

1. **Выбор действия** → `ProgrammatorUI.selectedAction`
2. **Клик по ячейке** → `onCellClick(x, y)`
3. **Создание инструкции** → `new Instruction(action, label, value)`
4. **Сохранение** → `program.setInstructionAt(x, y, instruction)`

### 💾 Программа → Хранение

1. **Экспорт** → `program.toBase64Format()`
2. **Сериализация** → `ProgramSerializer.encode()`
3. **Компрессия** → `LZMACompressor.compress()`
4. **Base64 кодирование** → `base64Encode()`

## 🎭 Ключевые компоненты

### 🧠 Program (Модель)
```javascript
class Program {
  constructor() {
    this.instructions = [];  // Массив Instruction
    this.pageWidth = 16;     // Ширина страницы
    this.pageHeight = 12;    // Высота страницы
  }

  // Методы работы с инструкциями
  getInstructionAt(x, y, page)
  setInstructionAt(x, y, action, label, value, page)
  getPageInstructions(page)
}
```

### 📋 Instruction (Инструкция)
```javascript
class Instruction {
  constructor(action, label = null, value = null) {
    this.action = action;    // ProgAction код
    this.label = label;      // Текстовая метка (опционально)
    this.value = value;      // Числовое значение (опционально)
  }
}
```

### 🎨 ProgrammatorUI (Интерфейс)
```javascript
class ProgrammatorUI {
  constructor() {
    this.program = new Program();
    this.selectedAction = null;
    this.currentPage = 0;
  }

  // Основные методы
  createActionPalette()      // Создание палитры действий
  createProgramGrid()        // Создание сетки программы
  createControls()           // Панель управления
  updateGridDisplay()        // Обновление отображения
}
```

### 🔧 ProgramSerializer (Сериализация)
```javascript
class ProgramSerializer {
  static async decode(source, format)  // Декодирование
  static async encode(instructions, format)  // Кодирование

  // Форматы: Version1, Base64, Version3, Packed
  static decodeV1(source)     // V1: простой текст
  static async decodeV2(source) // V2: LZMA + Base64
  static decodeV3(source)     // V3: читаемый текст
}
```

## 🔄 Жизненный цикл инструкции

### Создание
```
Пользователь выбирает действие
↓
Кликает по ячейке
↓
onCellClick(x, y) определяет тип действия
↓
Показывается диалог (если нужен label/value)
↓
Создается Instruction(action, label, value)
↓
setInstructionAt(x, y, instruction)
```

### Отображение
```
getInstructionAt(x, y, page)
↓
formatInstruction(instruction)
↓
{ shortCode: "V=S", description: "VarEqualsState: S" }
↓
cell.textContent = shortCode
cell.title = description
```

### Сериализация
```
toBase64Format()
↓
ProgramSerializer.encode(instructions)
↓
LZMACompressor.compress(data)
↓
base64Encode(compressed)
↓
Base64 строка для сохранения
```

## 📊 Производительность

### 🎯 Оптимизации
- **Lazy loading**: Компоненты загружаются по требованию
- **Virtual scrolling**: Для больших программ (будущая функция)
- **LZMA компрессия**: Эффективное сжатие данных
- **WebAssembly**: LZMA на WASM для скорости

### 📈 Метрики
- **Загрузка**: < 2MB (сжато)
- **Время запуска**: < 500ms
- **Отклик UI**: < 16ms (60 FPS)
- **Память**: < 50MB для больших программ

## 🔧 Расширение системы

### Добавление нового действия
1. Добавить в `ProgAction` enum
2. Добавить иконку в `getActionShortCode()`
3. Добавить в палитру действий
4. Обновить логику размещения (если нужны параметры)

### Добавление нового формата
1. Добавить в `ProgramFormatVersion` enum
2. Реализовать `decodeV*()` и `encodeV*()` методы
3. Добавить в UI выбор формата

### Добавление UI компонента
1. Создать класс компонента в `src/components/`
2. Экспортировать в `src/components/index.js`
3. Импортировать в `ProgrammatorUI`
4. Добавить в `initializeUI()`

## 🚨 Обработка ошибок

### Уровни ошибок
- **ValidationError**: Ошибки валидации программы
- **SerializationError**: Ошибки сериализации
- **UIError**: Ошибки интерфейса
- **NetworkError**: Ошибки загрузки ресурсов

### Graceful degradation
- Fallback на браузерную LZMA если WASM недоступен
- Progressive enhancement для старых браузеров
- Error boundaries для UI компонентов

## 🔍 Мониторинг и отладка

### Логирование
```javascript
console.log(`🎯 Selected action: ${action} (code: ${code})`);
console.log(`📝 Placing ${action} at [${x}, ${y}]`);
console.log(`📊 Exported ${instructions.length} instructions`);
```

### Отладочные функции
- `validateProgram()`: Проверка корректности
- `formatInstruction()`: Форматирование для отображения
- `getActionDisplayName()`: Человеко-читаемые имена

## 📋 Следующие шаги

### Краткосрочные
- [ ] Добавить сниппеты программ
- [ ] Реализовать отладчик
- [ ] Улучшить UX с drag & drop

### Долгосрочные
- [ ] WebAssembly для тяжелых вычислений
- [ ] PWA поддержка
- [ ] Интеграция с игрой через API
- [ ] Мультиязычная поддержка
