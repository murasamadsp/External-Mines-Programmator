# External Mines Programmator (EMP) 🚀

> Візуальний редактор програм для гри Mines - сучасний інструмент для створення ботів через drag-and-drop інтерфейс

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Modern CSS](https://img.shields.io/badge/CSS-Modern-blueviolet)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![ES2022](https://img.shields.io/badge/JavaScript-ES2022-yellow)](https://tc39.es/ecma262/)

## ✨ Особливості

- **🎯 Візуальне програмування** - створюйте програми через інтуїтивний drag-and-drop інтерфейс
- **🎨 Сучасний дизайн** - glassmorphism ефекти, плавні анімації та адаптивний темний дизайн
- **⚡ Висока продуктивність** - оптимізований збірник з lazy loading та code splitting
- **🔒 Desktop-only** - оптимізовано для стаціонарних пристроїв з блокуванням мобільних
- **🗜️ LZMA стиснення** - ефективне стиснення програм з використанням LZMA алгоритму
- **🎪 Інтерактивні ефекти** - hover ефекти, анімації та візуальні зворотні зв'язки

## 🏗️ Архітектура

```
src/
├── css/                    # Стилі
│   ├── base.css           # Дизайн-система та змінні
│   ├── components/        # Компонентні стилі
│   └── utils/             # Утилітарні стилі
├── js/                    # JavaScript додаток
│   ├── app.js            # Точка входу
│   ├── core/             # Ядро додатка
│   ├── features/         # Функціональні модулі
│   └── utils/            # Утилітарні функції
└── assets/               # Статичні ресурси
```

## 🚀 Початок роботи

### Передумови

- Node.js 18+
- npm або yarn

### Встановлення

```bash
# Клонування репозиторію
git clone https://github.com/murasamadsp/External-Mines-Programmator.git
cd External-Mines-Programmator

# Встановлення залежностей
npm install

# Запуск в режимі розробки
npm run dev

# Збірка для продакшну
npm run build

# Очищення та збірка
npm run build:clean

# Попередній перегляд збірки
npm run preview

# Перевірка якості коду
npm run quality
```

## 📋 Доступні команди

```bash
# Розробка
npm run dev              # Запуск dev сервера
npm run build           # Збірка для продакшну
npm run serve           # Попередній перегляд збірки

# Якість коду
npm run lint            # Перевірка ESLint та Stylelint
npm run lint:js         # Тільки ESLint
npm run lint:css        # Тільки Stylelint
npm run format          # Форматування Prettier

# Тестування
npm run test            # Запуск тестів
```

## 🎨 Дизайн-система

### Кольорова палітра

```css
--color-background: rgb(8 14 27); /* Темний фон */
--color-primary: rgb(59 130 246); /* Блакитний акцент */
--color-success: rgb(34 197 94); /* Зелений успіх */
--color-warning: rgb(245 158 11); /* Помаранчевий попередження */
--color-danger: rgb(239 68 68); /* Червоний помилка */
```

### Типографіка

- **Шрифт**: Google Sans Code (моноширинний)
- **Ієрархія**: Від XS (12px) до 4XL (36px)
- **Ваги**: Normal (400), Medium (500), Semibold (600), Bold (700)

### Простір

- **Масштаб**: Від 2px до 128px
- **Система**: Послідовна шкала для відступів та розмірів

## 🛠️ Технології

- **Frontend**: Vanilla JavaScript (ES2022)
- **Збірник**: Vite 7.2.2
- **Стилізація**: Modern CSS з CSS Custom Properties
- **Стилізація**: LZMA стиснення через lzma-js та lzma-web
- **Літинг**: ESLint + Stylelint + Prettier
- **Форматування**: EditorConfig

## 📱 Підтримка пристроїв

- ✅ **Desktop**: Повна підтримка (рекомендовано)
- ✅ **Laptop**: Повна підтримка
- ❌ **Tablet**: Заблоковано (desktop-only)
- ❌ **Mobile**: Заблоковано (desktop-only)

> Додаток оптимізований для роботи на стаціонарних пристроях з великими екранами для найкращого досвіду візуального програмування.

## 🔧 Конфігурація

### ESLint

Розширена конфігурація з підтримкою:

- ES2022 модулів
- JSDoc документації
- Promise обробки
- Імпорт/експорт правил

### Stylelint

Конфігурація з:

- Code Guide сумісністю
- CSS Order для організації властивостей
- Доступність правил
- Продуктивність оптимізацій

### Prettier

Конфігурація Code Guide:

- Подвійні лапки
- Крапки з комою
- Unix line endings
- 2 пробіли відступ

## 🧪 Тестування

```bash
npm run test  # Запуск всіх тестів
```

Тести включають:

- LZMA стиснення/розтиснення
- Валідація програм
- Сервіси та утиліти

## 📈 Продуктивність

### Оптимізації збірки

- **Code Splitting**: Розділення на чанки (vendor, ui, main)
- **Lazy Loading**: Динамічні імпорти
- **CSS Code Split**: Розділення CSS файлів
- **Terser**: Мініфікація з видаленням console.log в продакшні
- **Asset Optimization**: Оптимізація зображень та шрифтів

### CSS оптимізації

- CSS Custom Properties для теми
- Hardware acceleration для анімацій
- Efficient selectors та specificity
- Backdrop-filter для glassmorphism

## 🤝 Як зробити внесок

1. Fork проект
2. Створіть feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit зміни (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Відкрийте Pull Request

## 📝 Ліцензія

Цей проект під ліцензією ISC License - дивіться файл [LICENSE](LICENSE) для деталей.

## 🙏 Подяки

- **Murasama** - оригінальний розробник
- **Google Fonts** - шрифт Google Sans Code
- **LZMA** - алгоритм стиснення
- **Vite** - сучасний збірник

## 🔗 Посилання

- [GitHub Repository](https://github.com/murasamadsp/External-Mines-Programmator)
- [Issues](https://github.com/murasamadsp/External-Mines-Programmator/issues)
- [Pull Requests](https://github.com/murasamadsp/External-Mines-Programmator/pulls)

---

**Створено з ❤️ Murasama**
