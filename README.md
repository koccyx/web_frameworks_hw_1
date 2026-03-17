# Resume Platform Microservices

Монорепозиторий с frontend + двумя backend-микросервисами на `Express.js + TypeScript + Prisma + PostgreSQL`:

- `users-service` — регистрация, логин, JWT авторизация, профиль пользователя
- `core-service` — CRUD резюме, вакансий и сравнение `resume vs vacancy`
- `frontend` — UI

## Структура проекта

```text
.
├── core-service
│   ├── prisma
│   │   ├── migrations
│   │   │   └── 20260301000000_init
│   │   │       └── migration.sql
│   │   └── schema.prisma
│   ├── src
│   │   ├── config
│   │   │   └── env.ts
│   │   ├── docs
│   │   │   └── swagger.ts
│   │   ├── lib
│   │   │   └── prisma.ts
│   │   ├── middlewares
│   │   │   ├── auth.ts
│   │   │   ├── error-handler.ts
│   │   │   └── validate.ts
│   │   ├── modules
│   │   │   ├── health
│   │   │   │   └── health.routes.ts
│   │   │   ├── match
│   │   │   │   ├── match.routes.ts
│   │   │   │   ├── match.schemas.ts
│   │   │   │   └── match.service.ts
│   │   │   ├── resumes
│   │   │   │   ├── resumes.controller.ts
│   │   │   │   ├── resumes.routes.ts
│   │   │   │   └── resumes.schemas.ts
│   │   │   └── vacancies
│   │   │       ├── vacancies.controller.ts
│   │   │       ├── vacancies.routes.ts
│   │   │       └── vacancies.schemas.ts
│   │   ├── types
│   │   │   └── express.d.ts
│   │   ├── utils
│   │   │   ├── app-error.ts
│   │   │   ├── async-handler.ts
│   │   │   └── jwt.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend
│   ├── src
│   ├── public
│   ├── .env
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── postgres
│   └── init-multiple-dbs.sql
├── users-service
│   ├── prisma
│   │   ├── migrations
│   │   │   └── 20260301000000_init
│   │   │       └── migration.sql
│   │   └── schema.prisma
│   ├── src
│   │   ├── config
│   │   │   └── env.ts
│   │   ├── docs
│   │   │   └── swagger.ts
│   │   ├── lib
│   │   │   └── prisma.ts
│   │   ├── middlewares
│   │   │   ├── auth.ts
│   │   │   ├── error-handler.ts
│   │   │   └── validate.ts
│   │   ├── modules
│   │   │   ├── auth
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.schemas.ts
│   │   │   ├── health
│   │   │   │   └── health.routes.ts
│   │   │   └── users
│   │   │       ├── users.controller.ts
│   │   │       └── users.routes.ts
│   │   ├── types
│   │   │   └── express.d.ts
│   │   ├── utils
│   │   │   ├── app-error.ts
│   │   │   ├── async-handler.ts
│   │   │   └── jwt.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
└── docker-compose.yml
```

## Запуск через Docker Compose

1. Скопируйте env-файлы:

```bash
cp users-service/.env.example users-service/.env
cp core-service/.env.example core-service/.env
cp frontend/.env.example frontend/.env
```

2. Поднимите проект:

```bash
docker compose up --build
```

3. Сервисы будут доступны по адресам:

- `frontend` (nginx): `http://localhost:5173`
- `users-service`: `http://localhost:3001`
- `core-service`: `http://localhost:3002`
- Swagger users-service: `http://localhost:3001/docs`
- Swagger core-service: `http://localhost:3002/docs`

## Основные endpoints

### users-service

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /users/me`
- `GET /health`

### core-service

- `GET /resumes`
- `POST /resumes`
- `GET /resumes/:id`
- `PATCH /resumes/:id`
- `DELETE /resumes/:id`
- `GET /vacancies`
- `POST /vacancies`
- `GET /vacancies/:id`
- `PATCH /vacancies/:id`
- `DELETE /vacancies/:id`
- `POST /match`
- `GET /health`

## Auth (JWT access + refresh)

- `accessToken` используется в `Authorization: Bearer <token>` для запросов к `users-service` и `core-service`.
- `refreshToken` хранится в `httpOnly` cookie и используется эндпоинтом `POST /auth/refresh` для обновления access токена.

## Prisma

В каждом сервисе используется собственная Prisma schema и собственная база данных:

- `users-service` -> `users_db`
- `core-service` -> `core_db`

При старте контейнера сервиса выполняются:

- `prisma generate`
- `prisma migrate deploy`
- запуск `node dist/index.js`

## Match endpoint

`POST /match` принимает:

- `resumeId` + `vacancyId`

Сервис сам загружает `rawText` резюме и вакансии из БД по этим id.
Для анализа используется OpenRouter (LLM). Если ключ не задан или провайдер недоступен, используется локальный fallback-алгоритм.

Переменные окружения для `core-service`:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (по умолчанию `openai/gpt-4o-mini`)
- `OPENROUTER_BASE_URL` (по умолчанию `https://openrouter.ai/api/v1`)
- `OPENROUTER_APP_URL` (по умолчанию `http://localhost:3002`)

Ответ:

```json
{
  "score": 0.54,
  "missingKeywords": ["docker", "kafka"],
  "overlapKeywords": ["node", "typescript", "postgresql"],
  "suggestions": [
    "Add missing keywords to your resume when they reflect real experience.",
    "Emphasize overlapping skills with concrete achievements."
  ],
  "resumeImprovements": [
    "Add a bullet with hands-on Docker usage in production.",
    "Mention Kafka-related experience with measurable impact."
  ]
}
```
