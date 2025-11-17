# 📚 Система документации External Mines Programmator

## 🎯 Миссия

**Документация как система спецификаций** для AI-ассистированной разработки. Пользователь описывает требования в промптах, AI реализует на основе документации.

## 🏗️ Архитектурные принципы

### 🎨 Модульность
- **Core**: Бизнес-логика (Program, Instruction, Serializer)
- **UI**: Презентационный слой (ProgrammatorUI, компоненты)
- **Services**: Внешние сервисы (LZMA, Storage)
- **Utils**: Вспомогательные функции (formatters, validators)

### 📋 Спецификации-драйв
- Все функции документированы до реализации
- API контракты фиксированы
- Тесты основаны на спецификациях
- Код соответствует документации

### 🔄 Жизненный цикл функции
```
Промпт → Спецификация → Реализация → Тестирование → Документация → Деплой
```

## 📁 Структура документации

### 🎯 Основные разделы

#### `docs/README.md`
Главный файл с обзором системы и навигацией

#### `docs/architecture/`
Архитектурные решения и паттерны
- `overview.md` - Общая архитектура
- `components.md` - Компоненты системы
- `data-flow.md` - Поток данных

#### `docs/api/`
Техническая документация API
- `core-api.md` - Program, Instruction, Serializer
- `ui-api.md` - UI компоненты и события
- `services-api.md` - Сервисы и их интерфейсы

#### `docs/features/`
Функциональные требования
- `programmator-core.md` - Ядро программатора
- `ui-components.md` - UI компоненты
- `export-import.md` - Экспорт/импорт программ

#### `docs/specs/`
Технические спецификации
- `ProgAction-enum.md` - 255 действий бота
- `Program-format.md` - Форматы сериализации
- `lzma-compression.md` - LZMA компрессия

#### `docs/guides/`
Руководства для разработчиков
- `adding-features.md` - Добавление новых функций
- `prompt-templates.md` - Шаблоны промптов
- `quick-start.md` - Быстрый старт
- `testing.md` - Тестирование

## 🎮 Ключевые компоненты

### 🧠 Program (Модель данных)
```javascript
class Program {
  constructor() {
    this.instructions = [];  // Array<Instruction>
    this.pageWidth = 16;     // Константы сетки
    this.pageHeight = 12;
    this.maxPages = 16;
  }

  // Методы работы с инструкциями
  getInstructionAt(x, y, page)
  setInstructionAt(x, y, action, label, value, page)
  toBase64Format()  // Экспорт
  fromString(source) // Импорт
}
```

### 📄 Instruction (Инструкция)
```javascript
class Instruction {
  constructor(action, label = null, value = null) {
    this.action = action;    // ProgAction код
    this.label = label;      // Метка для переходов
    this.value = value;      // Числовое значение
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
  createActionPalette()  // Палитра действий
  createProgramGrid()    // Сетка 16x12x16
  createControls()       // Панель управления
  updateGridDisplay()    // Обновление отображения
}
```

### 🔧 ProgramSerializer (Сериализация)
```javascript
class ProgramSerializer {
  static probeFormatVersion(source)  // Определение формата
  static async decode(source, format) // Декодирование
  static encode(instructions, format) // Кодирование

  // Форматы: V1, Base64(LZMA), V3, Packed
}
```

## 🎯 ProgAction Enum (255 действий)

### Категории действий:
- **Basic** (0-9): Forward, Right, Left, Mine, Build, etc.
- **Logic** (10-49): Goto, Call, If/Else, Loops
- **Variables** (70-119): Var operations, comparisons
- **Sensors** (140-169): IsBlocked, HasItem, etc.
- **Special** (170-254): Teleport, Scan, etc.

### Типы параметров:
- `label: string` - для переходов (Goto, Call, etc.)
- `value: number` - для значений (SetNumberToVar, etc.)
- `coords: {x,y}` - для координат (Teleport)
- `none` - без параметров (Forward, Mine, etc.)

## 📊 Форматы программ

| Формат | Описание | Компрессия | Использование |
|--------|----------|------------|---------------|
| **V1** | Простой текст | Нет | Старый формат |
| **Base64** | LZMA + Base64 | LZMA | Основной экспорт |
| **V3** | Читаемый текст | Нет | Человеко-читаемый |
| **Packed** | Бинарный | LZMA | Компактный |

## 🔄 Процесс разработки новой функции

### 1. Промпт пользователя
```
Добавь действие "Teleport" для бота.

Требования:
- Принимает координаты X,Y
- Валидация границ карты
- Диалог ввода "X,Y"

Смотри docs/specs/ProgAction-enum.md
```

### 2. Анализ и планирование
- Определить код действия (230-254 свободны)
- Проверить интеграцию с существующими компонентами
- Оценить влияние на производительность

### 3. Реализация по шагам
```javascript
// 1. Добавить в ProgAction enum
const ProgAction = {
  // ... существующие
  TeleportToXY: 230,
}

// 2. Добавить иконку
function getActionShortCode(action) {
  case ProgAction.TeleportToXY: return "📍";
}

// 3. Добавить логику размещения
if (actionCode === ProgAction.TeleportToXY) {
  const coords = await promptForCoordinates();
  instruction.value = coords;
}

// 4. Обновить валидацию
// 5. Добавить в UI палитру
```

### 4. Тестирование
- Unit тесты для нового действия
- Integration тесты с UI
- Проверка обратной совместимости
- Performance тесты

### 5. Документация
- Обновить ProgAction-enum.md
- Добавить в core-api.md
- Обновить guides

## ✅ Готовые функции

### ✅ Базовый программатор
- Сетка 16x12x16 (страницы)
- Палитра 255 действий
- Экспорт/импорт Base64, Text, Codes

### ✅ UI компоненты
- Адаптивный дизайн
- Drag & drop (заготовка)
- Темная тема (заготовка)
- Интернационализация (заготовка)

### ✅ Сервисы
- LZMA компрессия (WebAssembly + fallback)
- Local storage
- Validation engine
- Error handling

## 🔄 План развития

### Краткосрочные (1-2 недели)
- [ ] Сниппеты программ
- [ ] Отладчик пошагового выполнения
- [ ] Улучшенная валидация

### Среднесрочные (1-3 месяца)
- [ ] Облачное хранение
- [ ] Совместная разработка
- [ ] Импорт из игры

### Долгосрочные (3-6 месяцев)
- [ ] WebAssembly оптимизации
- [ ] PWA поддержка
- [ ] Мобильная версия

## 📋 Использование документации

### Для добавления функции:
1. **Выберите шаблон** из `docs/guides/prompt-templates.md`
2. **Заполните требования** конкретными деталями
3. **Укажите ссылки** на релевантные спецификации
4. **Опишите сценарии** использования

### Для понимания кода:
1. **Начните** с `docs/architecture/overview.md`
2. **Изучите API** в `docs/api/`
3. **Посмотрите спецификации** в `docs/specs/`
4. **Следуйте гайдам** в `docs/guides/`

### Для тестирования:
1. **Используйте чек-листы** из guides
2. **Проверяйте спецификации** на соответствие
3. **Тестируйте интеграцию** с существующими функциями
4. **Документируйте edge cases**

## 🎉 Результат

Эта система позволяет:
- ✅ **Быструю разработку** новых функций
- ✅ **Согласованность** архитектуры
- ✅ **Качество кода** через спецификации
- ✅ **Легкость сопровождения** благодаря документации
- ✅ **Тестируемость** всех компонентов

**Используйте промпты с шаблонами, и AI реализует функции идеально!** 🚀

---

## 📞 Контакты

- **Документация**: `docs/README.md`
- **Архитектура**: `docs/architecture/`
- **API**: `docs/api/`
- **Спецификации**: `docs/specs/`
- **Гайды**: `docs/guides/`

*Версия документации: 1.0.0*
*Дата создания: Ноябрь 2025*
