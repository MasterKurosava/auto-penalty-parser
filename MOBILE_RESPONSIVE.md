# Мобильная адаптивность

## Обзор

Приложение полностью адаптировано для всех устройств с использованием мобильно-ориентированного подхода (mobile-first).

## Breakpoints

Используются стандартные Tailwind CSS breakpoints:

- **Mobile**: < 640px (`default`)
- **Small**: ≥ 640px (`sm:`)
- **Medium**: ≥ 768px (`md:`)
- **Large**: ≥ 1024px (`lg:`)
- **Extra Large**: ≥ 1280px (`xl:`)

## Компоненты

### 1. Header (Шапка)
**Mobile**:
- Компактный header с только переключателем темы
- Минимальный padding

**Desktop**: Без изменений

---

### 2. EcpCard (Карточка ЭЦП)

**Mobile** (< 640px):
- Вертикальная компоновка блоков
- Иконка 40x40px
- Название: 14px
- Badge и данные в колонку
- UUID обрезается до 140px
- Кнопка на всю ширину
- Padding: 16px

**Desktop** (≥ 640px):
- Горизонтальная компоновка
- Иконка 48x48px
- Название: 16px
- Данные в строку
- UUID до 200px
- Кнопка auto-width
- Padding: 24px

---

### 3. FinesForm (Форма фильтров)

**Mobile** (< 640px):
- 1 колонка для всех полей
- Кнопка "Загрузить" на всю ширину
- Счетчик по центру
- Gap: 12px

**Tablet** (≥ 640px):
- 2 колонки для полей
- Кнопка auto-width
- Счетчик слева
- Gap: 16px

**Desktop** (≥ 1024px):
- 4 колонки для полей

---

### 4. FinesCharts (Графики)

**Mobile** (< 640px):
- 1 колонка
- Высота графиков: 180px (вместо 200px)
- Высота линейного: 220px (вместо 250px)
- Заголовки: 14px
- Описания: 12px
- Компактный padding

**Tablet** (≥ 768px):
- 2 колонки
- Линейный график на всю ширину (span-2)

**Desktop** (≥ 1024px):
- 3 колонки
- Линейный график на всю ширину (span-3)

---

### 5. FinesTable (Таблица)

**Mobile** (< 640px):
- Горизонтальный scroll для таблицы
- `overflow-x-auto` на контейнере
- Padding: 0 (для полной ширины scroll)
- Кнопки экспорта: только иконки
- Кнопки на всю ширину в 2 ряда
- Заголовки: 18px

**Desktop** (≥ 640px):
- Кнопки с текстом
- Горизонтальная компоновка кнопок
- Стандартный padding
- Заголовки: 20px

#### Кнопки экспорта:
```tsx
// Mobile: только иконки
<FileSpreadsheet /> // без текста

// Desktop: иконка + текст
<FileSpreadsheet /> Excel
```

---

## Анимации

### Collapsible (Сворачивание/Разворачивание)

**Библиотека**: `@radix-ui/react-collapsible`

**Длительность**: 300ms

**Easing**: ease-out

**Анимация открытия** (`slideDown`):
```css
from {
  height: 0;
  opacity: 0;
}
to {
  height: var(--radix-collapsible-content-height);
  opacity: 1;
}
```

**Анимация закрытия** (`slideUp`):
```css
from {
  height: var(--radix-collapsible-content-height);
  opacity: 1;
}
to {
  height: 0;
  opacity: 0;
}
```

**Особенности**:
- Плавное изменение высоты
- Плавное изменение прозрачности
- Автоматический расчет высоты контента
- `overflow: hidden` для предотвращения выхода контента

---

## Spacing (Отступы)

### Mobile
- Container padding: `12px` (px-3)
- Vertical spacing: `16px` (space-y-4)
- Card padding: `16px` (p-4)
- Gap между элементами: `8-12px`

### Desktop
- Container padding: `16px` (px-4)
- Vertical spacing: `24px` (space-y-6)
- Card padding: `24px` (p-6)
- Gap между элементами: `16px`

---

## Typography (Типографика)

### Заголовки

| Элемент | Mobile | Desktop |
|---------|--------|---------|
| Page Title | 24px | 32px |
| Card Title | 18px (text-lg) | 20px (text-xl) |
| Chart Title | 14px (text-sm) | 16px (text-base) |
| Description | 12px (text-xs) | 14px (text-sm) |

### Кнопки

| Размер | Mobile | Desktop |
|--------|--------|---------|
| Small | 32px height | 36px height |
| Default | 36px height | 40px height |
| Large | 40px height | 44px height |

---

## Touch Targets

**Минимальный размер**: 44x44px (по гайдлайнам Apple/Google)

Все интерактивные элементы:
- Кнопки
- Ссылки
- Checkboxes
- Radio buttons
- Toggle switches

имеют минимальный размер 44x44px для удобства нажатия на мобильных устройствах.

---

## Scroll (Прокрутка)

### Horizontal Scroll (Таблица)
```tsx
<div className="overflow-x-auto">
  <Table />
</div>
```

**Особенности**:
- Smooth scrolling на iOS
- Momentum scrolling
- Скрыт scrollbar на desktop (но доступен)
- Виден scrollbar на mobile для индикации

---

## Best Practices

### 1. Flexbox для компоновки
```tsx
// Mobile: колонка
flex flex-col

// Desktop: строка
sm:flex-row
```

### 2. Grid для сеток
```tsx
// Mobile: 1 колонка
grid grid-cols-1

// Tablet: 2 колонки
sm:grid-cols-2

// Desktop: 4 колонки
lg:grid-cols-4
```

### 3. Адаптивный текст
```tsx
// Скрыть на mobile
<span className="hidden sm:inline">Text</span>

// Показать только на mobile
<span className="sm:hidden">Text</span>
```

### 4. Адаптивные размеры
```tsx
// Full width на mobile, auto на desktop
className="w-full sm:w-auto"

// Flex-grow на mobile, fixed на desktop
className="flex-1 sm:flex-none"
```

---

## Тестирование

### Устройства для тестирования:

**Mobile**:
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S20 (360px)

**Tablet**:
- iPad Mini (768px)
- iPad Air (820px)
- iPad Pro (1024px)

**Desktop**:
- Laptop (1280px)
- Desktop (1920px)
- Ultra-wide (2560px)

### Инструменты:
- Chrome DevTools (Device Mode)
- Firefox Responsive Design Mode
- Реальные устройства
- BrowserStack / Sauce Labs

---

## Performance (Производительность)

### Мобильная оптимизация:
- ✅ Минимизированные изображения
- ✅ Lazy loading для графиков
- ✅ Условный рендеринг (Collapsible)
- ✅ CSS-анимации (не JS)
- ✅ Оптимизированные шрифты
- ✅ Responsive images (где применимо)

### Метрики:
- Lighthouse Score: > 90
- First Contentful Paint: < 2s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

---

## Accessibility (Доступность)

### Mobile a11y:
- ✅ Минимальный размер touch targets (44x44px)
- ✅ Контрастные цвета (WCAG AA)
- ✅ Читаемые шрифты (минимум 14px)
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ ARIA labels

---

## Future Improvements

Возможные улучшения:
- PWA поддержка
- Offline mode
- Pull-to-refresh
- Swipe gestures
- Haptic feedback
- Dark mode per-component
- Landscape orientation optimization

