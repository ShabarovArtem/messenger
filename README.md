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
POSTGRES_DB=proj
POSTGRES_USER=proj
POSTGRES_PASSWORD=proj
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

JWT_SECRET=
JWT_REFRESH_SECRET=

REDIS_PASSWORD=redis_password
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
