# KIFAA PostgreSQL Durable Ledger (GROK-M007)

## Source of truth

**Journal history (`journal_entries` + `ledger_lines`) is authoritative.**

`ledger_balance_projections` is **derived state**. It is updated in the same
database transaction as each journal post. `rebuildBalances()` can always
reconstruct projections from journal history.

Never treat a mutable balance column as the ultimate financial source of truth.

## Packages

- `@kifaa/database` — connection pool, migrations, `withTransaction`
- `@kifaa/ledger` — `InMemoryLedger` + `PostgresLedger` (both implement `LedgerStore`)

## Concurrency

`postJournal` runs in one PostgreSQL transaction and takes `SELECT … FOR UPDATE`
on involved `ledger_accounts` rows (ordered by id) to serialize posts touching
the same accounts.

Optional `preventNegativeAvailableFor` guards customer-style available balance
(`available = -raw`) after applying deltas under those locks.

## Crash recovery

`getJournalByTransactionId(transactionId)` discovers a committed journal when
Core status was not updated. Reconcile Core from the ledger; do not re-post.

## Sandbox

No production payment rails. Schema is provider-neutral.

## Migration

```bash
export DATABASE_URL=postgres://kifaa:kifaa@127.0.0.1:5432/kifaa
pnpm --filter @kifaa/database migrate
```

Brand-new schema (`001_ledger_foundation.sql`).

## Status

**LOCAL INTEGRATION VERIFIED** — production hardening still required.
