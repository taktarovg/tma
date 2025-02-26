# TopInBeauty TMA (Telegram Mini App)

Мобильное приложение для записи к мастерам красоты через Telegram Mini App.

## Функциональность

- Автоматическая авторизация пользователя через Telegram
- Просмотр и поиск услуг красоты
- Онлайн запись к мастерам
- Управление своими записями
- Добавление услуг и мастеров в избранное
- Создание профиля мастера и добавление своих услуг
- Управление расписанием мастера

## Используемые технологии

- **Next.js 14** с App Router
- **TypeScript** для типизации кода
- **Prisma ORM** для работы с базой данных PostgreSQL
- **TailwindCSS** с компонентами из ShadCN UI
- **Telegram Mini App SDK** (@telegram-apps/sdk v3.4.0)
- **React Query** для клиентского кеширования данных
- **Zod** для валидации данных
- **JWT** для авторизации

## Структура проекта

```
tma-mvp
├─ prisma
│  ├─ schema.prisma
│  └─ migrations
├─ src
│  ├─ middleware.ts
│  ├─ app
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ error.tsx
│  │  ├─ not-found.tsx
│  │  ├─ (protected)
│  │  │  ├─ bookings
│  │  │  ├─ favorites
│  │  │  ├─ master
│  │  │  ├─ profile
│  │  │  ├─ services
│  │  │  └─ layout.tsx
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  ├─ bookings
│  │  │  ├─ categories
│  │  │  ├─ favorites
│  │  │  ├─ locations
│  │  │  ├─ master
│  │  │  ├─ profile
│  │  │  ├─ services
│  │  │  └─ upload
│  ├─ components
│  │  ├─ bookings
│  │  ├─ favorites
│  │  ├─ layout
│  │  ├─ profile
│  │  ├─ schedule
│  │  ├─ services
│  │  ├─ telegram
│  │  ├─ ui
│  │  ├─ TelegramClientProvider.tsx
│  ├─ hooks
│  │  ├─ useBookings.ts
│  │  ├─ useFavorites.ts
│  │  ├─ useFilters.ts
│  │  ├─ useMasterBookings.ts
│  │  ├─ useMasterSchedule.ts
│  │  ├─ useTelegramAuth.ts
│  │  ├─ useWebAppBackButton.ts
│  │  ├─ useWebAppMainButton.ts
│  │  └─ useTelegramUtils.ts
│  ├─ lib
│  │  ├─ date-utils.ts
│  │  ├─ prisma.ts
│  │  ├─ session.ts
│  │  ├─ telegram-sdk.ts
│  │  ├─ telegram.ts
│  │  ├─ token.ts
│  │  └─ utils.ts
│  ├─ providers
│  │  ├─ AuthProvider.tsx
│  │  └─ QueryProvider.tsx
│  ├─ store
│  │  └─ auth.ts
│  └─ types
├─ eslint.config.mjs
├─ next.config.js
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
└─ tsconfig.json
```

## Настройка и запуск

### Предварительные требования

- Node.js v20 или выше
- PostgreSQL 14 или выше
- Созданный бот в Telegram с зарегистрированным веб-приложением

### Настройка окружения

1. Клонировать репозиторий
2. Установить зависимости

```bash
npm install
```

3. Создать файл `.env` на основе примера:

```env
# Database
DATABASE_URL="postgresql://topinbeauty_user:password@localhost:5432/topinbeauty"

# Telegram Bot
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="YOUR_BOT_USERNAME"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# JWT Secret
JWT_SECRET="your-very-secure-jwt-secret"

# Environment
NODE_ENV="development"
```

4. Инициализировать базу данных

```bash
npm run db:migrate
npm run db:generate
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка для production

```bash
npm run build
```

### Запуск в production режиме

```bash
npm run start
```

## Настройка Telegram Bot

1. Создайте бот через [@BotFather](https://t.me/BotFather)
2. Включите режим WebApp и укажите URL вашего приложения
3. Обновите `.env` файл с полученными токеном и именем бота

## Дополнительные возможности Telegram Mini App

В приложении используются следующие возможности Telegram Mini App:

- Автоматическая авторизация пользователя
- Адаптация темы приложения под тему Telegram
- Haptic Feedback для улучшения пользовательского опыта
- Настраиваемые Back и Main кнопки
- Полноэкранный режим
- Нативные всплывающие окна
- Интеграция с геолокацией (для поиска ближайших мастеров)
- Возможность поделиться профилем мастера

## Автоматическая авторизация

При открытии приложения в Telegram Mini App происходит автоматическая авторизация пользователя. Если пользователь открывает приложение впервые, автоматически создается профиль пользователя с данными из Telegram.