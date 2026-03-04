## Backend messaging service (NestJS)

### Требования

- Node.js 18+
- Docker и Docker Compose

### Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. Поднять инфраструктуру (Postgres + Redis):

```bash
docker-compose up -d
```

Ожидается, что в `.env` заданы переменные:

```bash
# App
NODE_ENV=
PORT=

# PostgreSQL
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URL=

# Redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
REDIS_DB=
REDIS_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=
```

3. Запустить backend в dev-режиме:

```bash
npm run start:dev
```

По умолчанию сервер слушает порт `3000`.

### Swagger (REST API документация)

- UI: `http://localhost:3000/api/docs`

Основные группы:

- `auth` – регистрация, логин, logout, refresh токенов.
- `users` – профиль и управление пользователями (создание только для admin).
- `messages` – отправка сообщений.
- `conversations` – список диалогов и история сообщений.
