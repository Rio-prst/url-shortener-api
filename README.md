# URL Shortener API

Backend API for URL shortener with analytics, built with NestJS + Prisma + PostgreSQL + Redis.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | NestJS 11 |
| Database | PostgreSQL 17 (Prisma TypedSQL) |
| Cache | Redis 7 (ioredis) |
| Queue | BullMQ |
| Validation | Zod |
| Auth | JWT (access + refresh tokens) |
| API Docs | Swagger/OpenAPI (@nestjs/swagger) |
| Security | helmet, cors, express-rate-limit |
| Testing | Jest + jest-mock-extended |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |

## Architecture

```
Controller → Service → Repository → Prisma → PostgreSQL
```

| Layer | Responsibility |
|-------|----------------|
| Controller | Parse request, validate, return response |
| Service | Business logic |
| Repository | Database queries (TypedSQL) |
| Prisma | ORM wrapper |

### Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant Ctrl as Controller
    participant Svc as Service
    participant Repo as Repository
    participant DB as PostgreSQL

    C->>Ctrl: HTTP Request
    Ctrl->>Ctrl: Validate (Zod)
    Ctrl->>Svc: Call service method
    Svc->>Repo: Call repository method
    Repo->>DB: SQL Query (TypedSQL)
    DB-->>Repo: Result
    Repo-->>Svc: Domain object
    Svc-->>Ctrl: Business result
    Ctrl-->>C: ApiResponse { message, data, requestId }
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login, get JWT + refresh |
| POST | `/auth/rotate` | No | Refresh token rotation |
| POST | `/auth/logout` | No | Revoke refresh token |
| GET | `/auth/me` | Yes | Get current user |
| POST | `/shorten` | Yes | Create short URL |
| GET | `/:slug` | No | Redirect to original URL |
| GET | `/urls/:id/stats` | Yes | Get click analytics (via AnalyticsService) |
| DELETE | `/urls/:id` | Yes | Delete URL |

## API Specification

### POST /auth/register

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response 201:**
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "requestId": "req_abc123"
}
```

**Response 400:**
```json
{
  "message": "Validation failed",
  "code": "validation.failed",
  "error": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ],
  "requestId": "req_abc123"
}
```

**Response 409:**
```json
{
  "message": "Email already registered",
  "code": "auth.user.exists",
  "requestId": "req_abc123"
}
```

---

### POST /auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "requestId": "req_abc123"
}
```

**Set-Cookie:**
```
refresh_token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800
```

**Response 400:**
```json
{
  "message": "Validation failed",
  "code": "validation.failed",
  "error": [
    { "field": "email", "message": "Invalid email format" }
  ],
  "requestId": "req_abc123"
}
```

**Response 401:**
```json
{
  "message": "Invalid email or password",
  "code": "auth.credentials.invalid",
  "requestId": "req_abc123"
}
```

---

### POST /auth/rotate

**Request:**
- Cookie: `refresh_token=eyJhbGciOiJIUzI1NiIs...`

**Response 200:**
```json
{
  "message": "Token rotated successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "requestId": "req_abc123"
}
```

**Response 401:**
```json
{
  "message": "Invalid refresh token",
  "code": "auth.refresh.invalid",
  "requestId": "req_abc123"
}
```

**Response 401 (revoked):**
```json
{
  "message": "Refresh token has been revoked",
  "code": "auth.refresh.revoked",
  "requestId": "req_abc123"
}
```

**Response 401 (expired):**
```json
{
  "message": "Refresh token has expired",
  "code": "auth.refresh.expired",
  "requestId": "req_abc123"
}
```

---

### POST /auth/logout

**Request:**
- Cookie: `refresh_token=eyJhbGciOiJIUzI1NiIs...`

**Response 200:**
```json
{
  "message": "Logged out successfully",
  "requestId": "req_abc123"
}
```

**Set-Cookie:**
```
refresh_token=; Path=/
```

---

### GET /auth/me

**Request:**
- Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`

**Response 200:**
```json
{
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  },
  "requestId": "req_abc123"
}
```

**Response 401:**
```json
{
  "message": "Unauthorized",
  "code": "auth.unauthorized",
  "requestId": "req_abc123"
}
```

---

### POST /shorten

**Request:**
- Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`
```json
{
  "url": "https://example.com/very/long/path",
  "slug": "custom-slug"
}
```

> `slug` is optional. Auto-generated if not provided.

**Response 201:**
```json
{
  "message": "URL shortened successfully",
  "data": {
    "url": {
      "id": "1",
      "slug": "custom-slug",
      "originalUrl": "https://example.com/very/long/path",
      "userId": "1",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  },
  "requestId": "req_abc123"
}
```

**Response 400:**
```json
{
  "message": "Validation failed",
  "code": "validation.failed",
  "error": [
    { "field": "url", "message": "Invalid URL format" }
  ],
  "requestId": "req_abc123"
}
```

**Response 401:**
```json
{
  "message": "Unauthorized",
  "code": "auth.unauthorized",
  "requestId": "req_abc123"
}
```

**Response 409:**
```json
{
  "message": "Slug already exists",
  "code": "urls.slug.exists",
  "requestId": "req_abc123"
}
```

---

### GET /:slug

**Request:**
- No auth required
- No request body

**Response 302:**
```
Location: https://example.com/very/long/path
```

**Response 404:**
```json
{
  "message": "URL not found",
  "code": "urls.not_found",
  "requestId": "req_abc123"
}
```

---

### GET /urls/:id/stats

**Request:**
- Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`
- Query: `from` (optional, ISO date string)
- Query: `to` (optional, ISO date string)

**Response 200:**
```json
{
  "message": "Analytics retrieved successfully",
  "data": {
    "stats": {
      "totalClicks": 150,
      "clicksByDate": [
        { "date": "2026-01-01", "count": 50 },
        { "date": "2026-01-02", "count": 100 }
      ],
      "clicksByReferrer": [
        { "referrer": "google.com", "count": 80 },
        { "referrer": "direct", "count": 70 }
      ]
    }
  },
  "requestId": "req_abc123"
}
```

**Response 401:**
```json
{
  "message": "Unauthorized",
  "code": "auth.unauthorized",
  "requestId": "req_abc123"
}
```

---

### DELETE /urls/:id

**Request:**
- Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`

**Response 200:**
```json
{
  "message": "URL deleted successfully",
  "requestId": "req_abc123"
}
```

**Response 401:**
```json
{
  "message": "Unauthorized",
  "code": "auth.unauthorized",
  "requestId": "req_abc123"
}
```

**Response 403:**
```json
{
  "message": "You do not own this URL",
  "code": "urls.forbidden",
  "requestId": "req_abc123"
}
```

**Response 404:**
```json
{
  "message": "URL not found",
  "code": "urls.not_found",
  "requestId": "req_abc123"
}
```

---

### Auth Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as AuthController
    participant Svc as AuthService
    participant Repo as AuthRepository
    participant DB as PostgreSQL

    Note over C,DB: Register
    C->>Auth: POST /auth/register
    Auth->>Svc: register(dto)
    Svc->>Repo: findByEmail → null
    Svc->>Svc: bcrypt.hash(password)
    Svc->>Repo: createUser
    Svc->>Svc: jwt.sign(accessToken)
    Svc->>Repo: createRefreshToken
    Svc-->>Auth: {user, tokens}
    Auth-->>C: 201 + tokens

    Note over C,DB: Login
    C->>Auth: POST /auth/login
    Auth->>Svc: login(dto)
    Svc->>Repo: findPasswordByEmail
    Svc->>Svc: bcrypt.compare
    Svc->>Repo: findById
    Svc->>Svc: jwt.sign(accessToken)
    Svc->>Repo: createRefreshToken
    Svc-->>Auth: {user, tokens}
    Auth-->>C: 200 + setCookie(refreshToken)

    Note over C,DB: Rotate
    C->>Auth: POST /auth/rotate (cookie: refreshToken)
    Auth->>Svc: rotate(refreshToken)
    Svc->>Repo: findRefreshToken
    Svc->>Svc: validate (not revoked, not expired)
    Svc->>Repo: revokeRefreshToken
    Svc->>Repo: createRefreshToken
    Svc-->>Auth: {accessToken, refreshToken}
    Auth-->>C: 200 + new tokens
```

### URL Shortening Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant Ctrl as UrlsController
    participant Svc as UrlsService
    participant Repo as UrlsRepository
    participant Cache as CacheService
    participant DB as PostgreSQL

    Note over C,DB: Create Short URL
    C->>Ctrl: POST /shorten (url, slug?)
    Ctrl->>Svc: createUrl(dto, userId)
    Svc->>Svc: generateSlug() if no slug
    Svc->>Repo: slugExists(slug)
    Svc->>Repo: createUrl(data)
    Svc-->>Ctrl: UrlResponse
    Ctrl-->>C: 201 + url

    Note over C,DB: Redirect
    C->>Ctrl: GET /:slug
    Ctrl->>Svc: findBySlug(slug)
    Svc->>Cache: get(url:slug:{slug})
    alt Cache HIT
        Cache-->>Svc: cached url
    else Cache MISS
        Svc->>Repo: findBySlug(slug)
        Repo-->>Svc: url from DB
        Svc->>Cache: set(url:slug:{slug}, url, 3600)
    end
    Svc-->>Ctrl: UrlResponse
    Note over Ctrl: Async: recordClick (BullMQ)
    Ctrl-->>C: 302 redirect to originalUrl
```

## Database Schema

```mermaid
erDiagram
    users {
        bigint id PK
        text email UK
        text password_hash
        text name
        timestamptz created_at
        timestamptz updated_at
    }

    refresh_tokens {
        bigint id PK
        text token UK
        bigint user_id FK
        timestamptz expires_at
        timestamptz created_at
        boolean revoked
    }

    urls {
        bigint id PK
        text slug UK
        text original_url
        bigint user_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    click_events {
        bigint id PK
        bigint url_id FK
        timestamptz created_at
        text referrer
        text user_agent
    }

    users ||--o{ refresh_tokens : "has refresh tokens"
    users ||--o{ urls : "creates urls"
    urls ||--o{ click_events : "tracks clicks"
```

---

## Implementation Checklist

### 1. PrismaService (`src/prisma/prisma.service.ts`)

| Method | TODO |
|--------|------|
| `onModuleInit()` | Connect to database |
| `onModuleDestroy()` | Disconnect from database |

```bash
# After implementing schema
pnpm run db:migrate
pnpm run db:generate
```

### 2. AuthRepository (`src/modules/auth/auth.repository.ts`)

| Method | TODO |
|--------|------|
| `createUser(data)` | INSERT INTO users, return user |
| `findByEmail(email)` | SELECT user by email |
| `findById(id)` | SELECT user by id |
| `findPasswordByEmail(email)` | SELECT id + password_hash by email |
| `createRefreshToken(data)` | INSERT INTO refresh_tokens |
| `findRefreshToken(token)` | SELECT token by value |
| `revokeRefreshToken(token)` | UPDATE revoked = true |
| `revokeAllRefreshTokens(userId)` | UPDATE all user's tokens revoked = true |

### 3. AuthService (`src/modules/auth/auth.service.ts`)

| Method | TODO |
|--------|------|
| `register(dto)` | Hash password (bcrypt), create user, generate tokens |
| `login(dto)` | Validate password (bcrypt), generate tokens |
| `me(userId)` | Find user by id |
| `rotate(refreshToken)` | Validate token, revoke old, create new |
| `logout(refreshToken)` | Revoke refresh token |

### 4. UrlsRepository (`src/modules/urls/urls.repository.ts`)

| Method | TODO |
|--------|------|
| `createUrl(data)` | INSERT INTO urls, return url |
| `findBySlug(slug)` | SELECT url by slug |
| `findById(id)` | SELECT url by id |
| `deleteUrl(id)` | DELETE url by id |
| `slugExists(slug)` | SELECT COUNT by slug |

### 5. UrlsService (`src/modules/urls/urls.service.ts`)

| Method | TODO |
|--------|------|
| `createUrl(dto, userId?)` | Generate/check slug, create url |
| `findBySlug(slug)` | Delegate to repository |
| `findById(id)` | Delegate to repository |
| `deleteUrl(id, userId)` | Check ownership, delete |
| `generateSlug()` | Generate 7-char alphanumeric |

### 6. AnalyticsRepository (`src/modules/analytics/analytics.repository.ts`)

| Method | TODO |
|--------|------|
| `recordClick(data)` | INSERT INTO click_events |
| `getTotalClicks(urlId)` | SELECT COUNT by url_id |
| `getClicksByDate(urlId, from?, to?)` | SELECT GROUP BY date |
| `getClicksByReferrer(urlId)` | SELECT GROUP BY referrer |
| `getStats(urlId, from?, to?)` | Combine 3 queries above |

### 7. CacheService (`src/modules/cache/cache.service.ts`)

| Method | TODO |
|--------|------|
| `get<T>(key)` | Get from Redis |
| `set<T>(key, value, ttlSeconds?)` | Set to Redis with TTL |
| `del(key)` | Delete from Redis |
| `isConnected()` | Check Redis connection |

### 8. Swagger/OpenAPI

Install `@nestjs/swagger` + add decorators to controllers and DTOs.

```bash
pnpm add @nestjs/swagger
```

### 9. AppModule (`src/app.module.ts`)

Import all feature modules + register global filter + interceptor.

### 10. Main.ts (`src/main.ts`)

Add helmet, cors, cookie-parser, rate-limit, swagger setup.

### 11. Docker

Multi-stage Dockerfile + update docker-compose.yml with app service.

### 12. BullMQ Worker (In-App)

Create `src/modules/analytics/analytics.processor.ts` as BullMQ processor. Register in `analytics.module.ts`.

### 13. CI/CD

Create `.github/workflows/ci.yml` — lint + build + test on PR.

---

### 14. Integration Tests

Write integration tests for newly implemented features:

| File | Status | Description |
|------|--------|-------------|
| `src/modules/auth/auth.repository.integration-spec.ts` | EXISTS | Test auth CRUD against real DB |
| `src/modules/urls/urls.repository.integration-spec.ts` | MISSING | Test URL CRUD against real DB |
| `src/modules/analytics/analytics.repository.integration-spec.ts` | MISSING | Test click tracking and analytics queries |
| `src/modules/cache/cache.service.integration-spec.ts` | MISSING | Test Redis get/set/del operations |

```bash
# After implementing + writing tests
docker-compose up -d postgres redis
pnpm run db:migrate
pnpm run test:integration
pnpm run test:e2e
```

### 15. Unit Tests

Review existing unit tests, write missing ones, delete outdated ones:

| File | Action |
|------|--------|
| `auth.service.spec.ts` | Review + update for real implementation |
| `auth.controller.spec.ts` | Review + update |
| `urls.service.spec.ts` | Review + update |
| `analytics.service.spec.ts` | Review + update |
| `cache.service.spec.ts` | Review + update |

```bash
# Verify all unit tests pass
pnpm run test:unit
```

### 16. E2E Tests

Write e2e tests for each endpoint:

| File | Status | Description |
|------|--------|-------------|
| `test/auth.e2e-spec.ts` | EXISTS | Test register, login, rotate, logout, me |
| `test/shorten.e2e-spec.ts` | EXISTS | Test create, redirect |
| `test/app.e2e-spec.ts` | EXISTS | Test health check |
| `test/urls.e2e-spec.ts` | MISSING | Test stats (`GET /urls/:id/stats`) + delete (`DELETE /urls/:id`) |

```bash
# Verify all e2e tests pass
pnpm run test:e2e
```

---

## Commands

```bash
# Build
pnpm run build

# Lint
pnpm run lint

# Unit tests (mock-based, no DB needed)
pnpm run test:unit

# Integration tests (need DB)
pnpm run test:integration

# E2E tests (need DB + Redis)
pnpm run test:e2e

# Database
pnpm run db:migrate
pnpm run db:generate

# Docker (infrastructure only)
docker-compose up -d postgres redis
docker-compose down

# Docker (full app with build)
docker-compose up -d --build
docker-compose down

# Docker (rebuild from scratch)
docker-compose down -v
docker-compose up -d --build

# View logs
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# Check status
docker-compose ps
```

**Expected state:**
- `test:unit` → all PASS (after implementation)
- `test:integration` → all PASS (after implementation)
- `test:e2e` → all PASS (after implementation)

---

## Project Structure

```
url-shortener-api/
├── .github/workflows/ci.yml           ← TODO
├── prisma/
│   ├── schema.prisma                  ← TODO (4 tables)
│   └── sql/
├── src/
│   ├── main.ts                        ← TODO (helmet, cors, rate-limit, swagger)
│   ├── app.module.ts                  ← TODO (import modules)
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts          ← TODO (PrismaClient init)
│   ├── common/
│   │   ├── guards/jwt-auth.guard.ts
│   │   ├── decorators/current-user.decorator.ts
│   │   ├── pipes/zod-validation.pipe.ts
│   │   ├── filters/zod-exception.filter.ts
│   │   ├── interceptors/response.interceptor.ts
│   │   └── types/api-response.ts
│   └── modules/
│       ├── auth/
│       │   ├── interfaces/
│       │   ├── dto/
│       │   ├── strategies/jwt.strategy.ts
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.controller.spec.ts
│       │   ├── auth.service.ts        ← TODO (bcrypt, JWT)
│       │   ├── auth.service.spec.ts
│       │   ├── auth.repository.ts     ← TODO (TypedSQL)
│       │   └── auth.repository.integration-spec.ts
│       ├── urls/
│       │   ├── interfaces/
│       │   ├── dto/
│       │   ├── urls.module.ts
│       │   ├── urls.controller.ts      ← TODO (add stats endpoint, inject AnalyticsService)
│       │   ├── urls.service.ts         ← TODO (slug gen, cache)
│       │   └── urls.repository.ts      ← TODO (TypedSQL)
│       ├── analytics/
│       │   ├── interfaces/
│       │   ├── analytics.module.ts
│       │   ├── analytics.processor.ts  ← TODO (BullMQ in-app worker)
│       │   ├── analytics.service.ts
│       │   └── analytics.repository.ts ← TODO (TypedSQL)
│       └── cache/
│           ├── interfaces/
│           ├── cache.module.ts
│           ├── cache.service.ts       ← TODO (ioredis)
│           └── cache.service.spec.ts
├── test/
│   ├── jest-e2e.json
│   ├── setup.ts
│   ├── auth.e2e-spec.ts
│   ├── app.e2e-spec.ts
│   └── shorten.e2e-spec.ts
├── Dockerfile                         ← TODO (multi-stage)
├── docker-compose.yml
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/urlshortener_dev
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
REDIS_URL=redis://localhost:6379
PORT=3000
```

---

## Checkpoints

### Must Pass Before Done

- [ ] `pnpm run build` — 0 errors
- [ ] `pnpm run lint` — 0 errors
- [ ] `pnpm run test:unit` — all PASS
- [ ] `pnpm run test:integration` — all PASS
- [ ] `pnpm run test:e2e` — all PASS
- [ ] Redirect uses cache-aside pattern
- [ ] Click events logged async (BullMQ)
- [ ] Rate limit works (spam → 429)
- [ ] Swagger UI accessible at `/docs`
- [ ] `docker-compose up` brings up all services
- [ ] CI runs on every PR (lint + test)

### Can Explain

- [ ] Cache-aside vs read-through vs write-through
- [ ] Cache stampede and prevention
- [ ] JWT access + refresh token flow
- [ ] Token rotation security
- [ ] Prisma TypedSQL vs raw queries
- [ ] BullMQ job retry vs dead letter queue
- [ ] Swagger decorators (@ApiProperty, @ApiOperation, @ApiResponse)
- [ ] Docker multi-stage build benefits
- [ ] GitHub Actions workflow structure
