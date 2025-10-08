# Nuraly - Система работы со штрафами

Веб-приложение для работы с штрафами через PSAP API с аутентификацией через ЭЦП (NCALayer).

## Технологии

- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **Shadcn/ui** - компоненты UI
- **Iron Session** - управление сессиями
- **NCALayer** - интеграция с ЭЦП
- **Axios** - HTTP клиент с retry механизмом

## Основные функции

### 1. Аутентификация
- **Вход по логину/паролю** - для доступа к дашборду
- **ЭЦП через NCALayer** - для доступа к PSAP API

### 2. Получение штрафов
- Загрузка списка штрафов из PSAP
- Фильтрация по датам
- Настройка лимита записей

### 3. Отображение данных
- **Карточки статистики**: всего, оплачено, не оплачено
- **Детальная таблица** с информацией:
  - Статус оплаты
  - Дата нарушения
  - ФИО нарушителя
  - Госномер и СРТС
  - Код статьи и описание
  - Суммы (полная и льготная)
- **Экспорт данных** в JSON и CSV

## Установка

```bash
# Установка зависимостей
pnpm install

# Настройка переменных окружения
cp .env.example .env.local

# Запуск dev сервера
pnpm dev
```

## Переменные окружения

```env
# App Auth
APP_LOGIN=admin
APP_PASSWORD=your_password

# Session
SESSION_SECRET=your_session_secret_at_least_32_characters_long

# PSAP API
PSAP_API_BASE_URL=https://erap-public.kgp.kz

# SSL (опционально)
NODE_EXTRA_CA_CERTS=/path/to/ca-cert.pem
```

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── login/        # Аутентификация в приложении
│   │   └── psap/         # Прокси для PSAP API
│   ├── dashboard/        # Главная страница после входа
│   └── login/            # Страница входа
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты (shadcn)
│   ├── EcpCard.tsx       # Компонент подключения ЭЦП
│   ├── FinesForm.tsx     # Форма запроса штрафов
│   ├── FinesTable.tsx    # Таблица штрафов
│   ├── Header.tsx        # Шапка приложения
│   └── LoginForm.tsx     # Форма входа
├── lib/                   # Утилиты и хелперы
│   ├── axios.ts          # Настроенный Axios клиент
│   ├── cookies.ts        # Управление PSAP cookies
│   ├── ncalayer.ts       # Интеграция с NCALayer
│   ├── session.ts        # Управление сессиями
│   └── types.ts          # TypeScript типы
└── middleware.ts          # Next.js middleware для защиты роутов
```

## Workflow

1. Пользователь входит в систему через логин/пароль
2. На дашборде подключает ЭЦП через NCALayer
3. После успешной аутентификации с PSAP может запрашивать штрафы
4. Данные отображаются в таблице с возможностью экспорта

## NCALayer

Для работы с ЭЦП необходимо:
1. Установить NCALayer на локальный компьютер
2. Запустить сервис (по умолчанию порт 13579)
3. Иметь файл сертификата *.p12 и пароль от него

## API Endpoints

### Внутренние API
- `POST /api/login` - вход в приложение
- `DELETE /api/login` - выход из приложения

### PSAP Proxy API
- `GET /api/psap/access-uuid` - получение UUID для аутентификации
- `POST /api/psap/auth-by-uuid` - аутентификация через подписанный XML
- `GET /api/psap/cases` - получение списка штрафов

Подробная документация по структуре данных в [API_STRUCTURE.md](./API_STRUCTURE.md)

## Разработка

```bash
# Запуск dev сервера
pnpm dev

# Проверка типов
pnpm type-check

# Линтинг
pnpm lint

# Форматирование
pnpm format

# Сборка для продакшена
pnpm build

# Запуск продакшен сборки
pnpm start
```

## Безопасность

- Все чувствительные данные хранятся в encrypted cookies (iron-session)
- PSAP токены хранятся в httpOnly cookies
- SSL сертификаты настраиваются через NODE_EXTRA_CA_CERTS
- Middleware защищает приватные роуты
- В dev режиме можно отключить проверку SSL (не рекомендуется для продакшена)

## Лицензия

MIT

