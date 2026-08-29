# KIFAA

**Kenya-first financial interface & orchestration platform**

KIFAA is engineering infrastructure that connects user interfaces (PWA, USSD, merchant web, APIs) to licensed payment providers through a single transaction engine and a true double-entry ledger.

> **Regulatory boundary:** This repository is **not** a licensed Payment Service Provider (PSP), e-money issuer, or deposit-taking institution. Live money movement requires appropriate licensed partners and authorizations. See `docs/REGULATORY_BOUNDARIES.md`.

## Architecture (modular monolith)

```
PWA / USSD / Merchant / Public API
            |
            v
     Identity -> Risk -> Transaction Engine -> Router -> Provider Adapter
                                                              |
                                                              v
                                                           Callback
                                                              |
                                                              v
                                                           Ledger (double-entry)
```

- **One backend**, one financial transaction engine.
- Interfaces never contain money-moving business logic.
- Provider-specific code lives only inside adapters.
- Money is integer minor units only (KES 1,500.00 = `150000`).
- Posted journal entries are immutable; balances are projections.

## Stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript |
| API | Fastify |
| Frontend | React + Vite (PWA) |
| Database | PostgreSQL 16 + Drizzle ORM |
| Cache | Redis 7 |
| PIN hashing | Argon2id |
| Local env | Docker Compose |

**Why Fastify?** Lightweight plugin modularity fits a modular monolith without NestJS ceremony.

## Milestone 1

Foundation is implemented in the working tree (see commit history as files land). Core deliverables:

- pnpm monorepo: `apps/api`, `apps/web`, `packages/*`, `adapters/mpesa`
- Double-entry ledger engine + invariant tests (`@kifaa/ledger`)
- Transaction state machine + idempotency tests (`@kifaa/transactions`)
- PostgreSQL schema for all required entities
- Fastify `/v1` API scaffold (auth, transactions, payments, health)
- React PWA shell (landing, login, register, dashboard, send, pay, history, profile)
- Docker Compose (Postgres 16 + Redis 7)
- Provider adapter interfaces (M-PESA / Airtel / PesaLink sandbox skeletons)
- Docs: ARCHITECTURE, SECURITY, LEDGER, TRANSACTIONS, PAYMENT_ADAPTERS, USSD, DEVELOPMENT, REGULATORY_BOUNDARIES
- GitHub Actions CI skeleton

## Local run (once full tree is pushed)

```bash
git clone https://github.com/kelvinblack3-beep/kifaa.git
cd kifaa
cp .env.example .env
docker compose up -d
pnpm install
pnpm --filter @kifaa/ledger test
pnpm --filter @kifaa/transactions test
pnpm dev:api   # :4000
pnpm dev:web   # :3000
```

## License

Proprietary — all rights reserved.
