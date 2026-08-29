# Architecture

## Principle

Build **one backend** and **one financial transaction engine**. All interfaces call the same backend:

- PWA
- USSD
- Merchant web
- Public API
- Internal / admin tools

All money movement goes through:

```
Identity → Risk → Transaction Engine → Router → Provider Adapter → Callback → Ledger
```

Interfaces never contain money-moving business logic. Provider-specific code exists **only** inside provider adapters.

## Modular monolith

MVP uses a modular monolith (pnpm workspaces), not microservices. No Kubernetes, Kafka, or MongoDB ledger.

## Layers

1. **Identity / Auth** — users, devices, credentials (Argon2id), sessions, KYC
2. **Risk** — deterministic rules (velocity, limits, new device/beneficiary)
3. **Transaction engine** — state machine, idempotency, locks, event history
4. **Payment router** — selects adapter by rail / capability
5. **Provider adapters** — M-PESA, Airtel, PesaLink, future PSPs
6. **Ledger** — double-entry journals + lines; balances as projections
7. **Notifications** — SMS / push abstraction
8. **Reconciliation & audit** — immutable logs, break detection

## Money

- Integer minor units only (`bigint`)
- KES 1,500.00 → `150000`
- Currency column prepared for multi-currency later

## Why Fastify

Fastify is plugin-based and low-ceremony. Modules register as plugins or plain services without a heavy DI container. This keeps the modular monolith understandable and fast for Kenyan mobile traffic patterns.

## Queue

BullMQ (Redis) is the planned job runner for async provider callbacks, notification delivery, and reconciliation. Not required for Milestone 1 API boot.
