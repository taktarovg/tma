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

## Структура проекта


```
tma
├─ tsconfig.json
├─ prisma
│  ├─ schema.prisma
│  └─ migrations
│     ├─ migration_lock.toml
│     ├─ 20250211042623_tib_1102
│     │  └─ migration.sql
│     ├─ 20250211091551_update_user_model
│     │  └─ migration.sql
│     ├─ 20250212061716_update_schema_with_relations
│     │  └─ migration.sql
│     ├─ 20250213064524_update_categories_schema
│     │  └─ migration.sql
│     └─ 20250213073543_add_master_profile_fields
│        └─ migration.sql
├─ src
│  ├─ middleware.ts
│  ├─ app
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ (protected)
│  │  │  ├─ layout.tsx
│  │  │  ├─ bookings
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ favorites
│  │  │  │  └─ page.tsx
│  │  │  ├─ master
│  │  │  │  ├─ bookings
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ schedule
│  │  │  │     └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ edit
│  │  │  │     └─ page.tsx
│  │  │  └─ services
│  │  │     ├─ [id]
│  │  │     │  ├─ page.tsx
│  │  │     │  └─ book
│  │  │     │     └─ page.tsx
│  │  │     └─ create
│  │  │        └─ page.tsx
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ logout
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ telegram
│  │  │  │     ├─ route.ts
│  │  │  │     ├─ check
│  │  │  │     │  └─ route.ts
│  │  │  │     └─ telegram.ts
│  │  │  ├─ bookings
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ categories
│  │  │  │  └─ route.ts
│  │  │  ├─ favorites
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ locations
│  │  │  │  └─ route.ts
│  │  │  ├─ master
│  │  │  │  ├─ bookings
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ schedule
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [date]
│  │  │  │  │     ├─ post.ts
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ settings
│  │  │  │     └─ route.ts
│  │  │  ├─ profile
│  │  │  │  └─ route.ts
│  │  │  ├─ services
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     ├─ available-dates
│  │  │  │     │  └─ route.ts
│  │  │  │     └─ time-slots
│  │  │  │        └─ route.ts
│  │  │  └─ upload
│  │  │     └─ route.ts
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ error.tsx
│  ├─ components
│  │  ├─ bookings
│  │  │  ├─ BookingCard.tsx
│  │  │  ├─ BookingFilters.tsx
│  │  │  ├─ BookingForm.tsx
│  │  │  ├─ BookingList.tsx
│  │  │  ├─ BookingSkeleton.tsx
│  │  │  ├─ BookingStatusBadge.tsx
│  │  │  ├─ Calendar.tsx
│  │  │  ├─ ClientBookingsList.tsx
│  │  │  ├─ CreateBookingForm.tsx
│  │  │  ├─ MasterBookingsManager.tsx
│  │  │  └─ TimeSlots.tsx
│  │  ├─ favorites
│  │  │  └─ FavoriteFilters.tsx
│  │  ├─ layout
│  │  │  ├─ Header.tsx
│  │  │  ├─ Navigation.tsx
│  │  │  └─ SideMenu.tsx
│  │  ├─ profile
│  │  │  ├─ ImageUpload.tsx
│  │  │  └─ UserProfileCard.tsx
│  │  ├─ schedule
│  │  │  ├─ MasterWorkspace.tsx
│  │  │  ├─ ScheduleManager.tsx
│  │  │  └─ ScheduleSettingsDialog.tsx
│  │  ├─ services
│  │  │  ├─ CategorySelect.tsx
│  │  │  ├─ CreateServiceForm.tsx
│  │  │  ├─ FilterBar.tsx
│  │  │  ├─ ImageUpload.tsx
│  │  │  ├─ MasterInfo.tsx
│  │  │  ├─ ServiceCard.tsx
│  │  │  ├─ ServiceDetail.tsx
│  │  │  ├─ ServiceFilters.tsx
│  │  │  ├─ ServiceForm.tsx
│  │  │  ├─ ServiceList.tsx
│  │  │  └─ ServicePriceDisplay.tsx
│  │  ├─ telegram
│  │  │  ├─ TelegramAutoAuth.tsx
│  │  │  ├─ TelegramHeader.tsx
│  │  │  ├─ TelegramActionButton.tsx
│  │  │  ├─ TelegramLayout.tsx
│  │  │  └─ TelegramPopup.tsx
│  │  ├─ ui
│  │  │  ├─ Avatar.tsx
│  │  │  ├─ CityDistrictSelect.tsx
│  │  │  ├─ FilterSelect.tsx
│  │  │  ├─ Tooltip.tsx
│  │  │  ├─ alert-dialog.tsx
│  │  │  ├─ alert.tsx
│  │  │  ├─ badge.tsx
│  │  │  ├─ button.tsx
│  │  │  ├─ calendar.tsx
│  │  │  ├─ card.tsx
│  │  │  ├─ dialog.tsx
│  │  │  ├─ heading.tsx
│  │  │  ├─ input.tsx
│  │  │  ├─ label.tsx
│  │  │  ├─ scroll-area.tsx
│  │  │  ├─ select.tsx
│  │  │  ├─ separator.tsx
│  │  │  ├─ skeleton.tsx
│  │  │  ├─ switch.tsx
│  │  │  ├─ textarea.tsx
│  │  │  ├─ theme.ts
│  │  │  ├─ toast.tsx
│  │  │  ├─ toaster.tsx
│  │  │  └─ use-toast.ts
│  │  ├─ auth
│  │  │  └─ TelegramLoginButton.tsx
│  │  └─ TelegramClientProvider.tsx
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
│  │  ├─ telegram-client.ts
│  │  ├─ telegram-sdk.ts
│  │  ├─ telegram.ts
│  │  ├─ token.ts
│  │  ├─ utils.ts
│  │  ├─ client-token.ts
│  │  ├─ edge-jwt.ts
│  │  ├─ redirects.ts
│  │  └─ profile-redirect.ts
│  ├─ providers
│  │  ├─ AuthProvider.tsx
│  │  └─ QueryProvider.tsx
│  ├─ store
│  │  └─ auth.ts
│  └─ types
│     ├─ booking.ts
│     ├─ errors.ts
│     ├─ favorite.ts
│     ├─ index.ts
│     ├─ profile.ts
│     ├─ schedule.ts
│     ├─ telegram-sdk.d.ts
│     └─ telegram.ts
├─ eslint.config.mjs
├─ next.config.js
├─ package.json
├─ package-lock.json
├─ postcss.config.js
├─ README.md
└─ tailwind.config.js

```