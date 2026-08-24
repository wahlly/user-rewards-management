# User Rewards Management

An event driven reward management system which achievements are claimed, badges are unlocked followed by a ₦300 cashback for every badge earned.

---

## Dependencies

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | MySQL 8 |
| ORM | TypeORM 0.3 |
| Events | `@nestjs/event-emitter` (EventEmitter2) |
| Payments | Paystack |
| API Docs | Swagger (`@nestjs/swagger`) |
| Testing | Jest |
| Container | Docker + Docker Compose |

---

## Architecture & Design Choices

### Modular Monolith
This is built as a single NestJS application split into four feature modules: `users`, `purchases`, `rewards`, and `payments`. This keeps deployment simple while maintaining separation of concerns. This structure/approach also makes it easily extendable to a microservice, if scale ever demands in the future.

### Event-Driven Architecture
Inter-module communication happens through in-process events via `@nestjs/event-emitter`. Modules are loosely coupled, making the system easy to extend. Out-of-the-box support for event processing, with a support for later scaling to bullmq + redis is one of several inspirations behind attempting this project with Nestjs framework.

```
POST /purchases
  → PurchasesService emits purchase.created
    → AchievementsListener evaluates thresholds → emits achievement.unlocked
      → BadgesListener evaluates badge thresholds → emits badge.unlocked
        → BadgeUnlockedListener triggers ₦300 cashback via PaymentsService
```

### Storage of System Set Achievements & Badges
Achievement and badge thresholds are declared as typed constant list in `src/common/constants/`. New achievements or badges can be easily appended to this list. Storing these presets in the db would require actions on it from an admin-like platform, to insert, and update the achievements and badges config, which the current scenario could do without.

### Choice of Storage
MySQL db is used as the primary storage for this project. User claimed achievements and badges are stored on mysql. Selecting a SQL db gives room for future scalability, as JOINs are expected on the users table across the achievements and badges table.

```ts
// src/common/constants/achievements.constant.ts
{ name: '100 purchases', threshold: 100 } // ← adding a new achievement
```

### Strategy Pattern for Payments
`PaymentsService` depends on the `IPaymentProvider` interface, a payment provider interface. The active provider is bound in `PaymentsModule` via a DI(Dependency Injection) token. This makes it easy to switch payment providers, without any hassle.


## Prerequisites

- Node.js >= 20
- MySQL 8 (or Docker)
- A [Paystack](https://paystack.com) account

---

## Setup

**1. Clone and install dependencies**
```bash
git clone <repo-url>
cd cloned-project
npm install
```

**2. Configure environment**
```bash
cp .env.example .env
```

**3. Create the database**
```sql
CREATE DATABASE user_rewards;
```

**4. Run migrations**
```bash
npm run migration:run
```

**5. Start the server**
```bash
npm run start:dev
```

Swagger docs available at: `http://localhost:7070/api/docs`

---

## Docker Setup

```bash
docker compose up --build
```

The compose file starts services in the correct order:
1. **db** — MySQL
2. **db_migration** — runs migrations against the DB, exits
3. **app** — starts after migrations complete successfully

---

## API Endpoints

### Users

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/users` | Create a new user |
| `GET` | `/users/:email/achievements` | Get achievements and badge progress |

### Purchases

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/purchases` | Record a purchase for a user |

Kindly refer to the swagger docs for full documentation, including request/response examples `http://localhost:7070/api/docs`.

---

## Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# All tests
npm run test
```

### Test Strategy

**Unit tests** (`test/unit/`) — isolated service logic with mocked repositories:
- `AchievementsService` — threshold evaluation, next available achievements, idempotency
- `BadgesService` — badge progression, highest badge resolution, remaining count
- `UsersService` — user creation, duplicate detection, achievements endpoint response
- `PurchasesService` — purchase recording, event emission, purchase count accuracy

**Integration tests** (`test/integration/`) — services wired with real EventEmitter2, repositories mocked:
- `achievement-unlock.integration.spec.ts` — full event chain from purchase to achievement unlock
- `badge-unlock.integration.spec.ts` — badge progression, cashback trigger, idempotency


### Note
Kindly note that for transfers to go through successfully, paystack key provided must support transfers for the business.