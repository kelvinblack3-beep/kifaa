# KIFAA — Concurrency & Atomicity Design (GROK-M006)

**Status:** DESIGN GATE — no PostgreSQL implementation in this document  
**Scope:** Core + Ledger invariants required before persistence  
**Sandbox / regulatory boundary:** unchanged

## 1. Distinction: current vs production

| Layer | Guarantee source |
|-------|------------------|
| **CURRENT IN-MEMORY** | Single-threaded Node.js event loop + synchronous Map/Set mutations. Concurrent *logical* requests are serialized; true parallel mutation of shared state does not occur inside one process. |
| **REQUIRED POSTGRES PRODUCTION** | Multiple API workers, concurrent connections, and crash mid-transaction. Safety must come from **DB constraints + explicit transaction boundaries**, not from the JS event loop. |

**Do not claim production concurrency safety from single-threaded in-memory behavior.**

## 2. Idempotency

### Current in-memory sequence

1. `idempotentLookup(key, body)` — Map read  
2. On miss: `beginTxn` → write `txns` + `byIdempotency`  
3. Balance checks (where applicable)  
4. `postJournal` with `transactionId = txn.id`  
5. Core sets `COMPLETED` + `journalId`

### Simultaneous same key + same body

**CURRENT:** Second request sees first binding after first `beginTxn` completes under single-threaded order. Ledger also rejects duplicate `transactionId`.

**PRODUCTION MUST:**

- Unique constraint on idempotency `(scope, key)`.
- Claim key in the **same DB transaction** as txn insert, or `INSERT … ON CONFLICT` with request-hash check.
- Journal uniqueness on `transaction_id` as second line of defence.
- Same key + **different body** → conflict (409), including after FAILED without journal.

### FAILED retry (no journalId)

Allowed only when status is FAILED and journalId is null. Production must use conditional update so two concurrent retries cannot both succeed.

## 3. Balance / double-spend

### Scenario

Balance 100; concurrent T1=80 and T2=80.

**CURRENT:** Sequential checks; only one succeeds.

**PRODUCTION RISK:** Both read 100, both post → overdraft if only application-level checks.

### Required invariant

> A customer’s available balance must never go negative as a result of concurrent spending operations.

### Recommended minimum mechanism

**Serializable isolation *or* row-level lock on the payer account row for check + journal post**, inside one DB transaction.

| Approach | Tradeoff |
|----------|----------|
| `SELECT … FOR UPDATE` on account | Simple; serializes hot accounts |
| Serializable transactions | Correct; more retries under contention |
| Optimistic version column | Low contention; needs retry loop |

**Recommendation:** single DB transaction with **account row lock (FOR UPDATE)** or **serializable** isolation.

## 4. Ledger atomicity

`postJournal` must be **one database transaction** containing:

1. Balanced-lines validation
2. Insert journal header
3. Insert all lines
4. Reject duplicate `journal_id`
5. Reject duplicate `transaction_id` (when present)
6. Update reversal linkage on original (if reversing)
7. Optional projection update

Must **never** commit header without lines, lines without header, unbalanced journal, or partial reversal.

## 5. Core txn state vs ledger state

Crash between journal commit and Core COMPLETED:

- Journal may exist (`transaction_id = core_txn.id`)
- Core may still be PENDING/PROCESSING without `journal_id`

**Recovery invariant:** A financial journal must never be treated as lost solely because the application crashed after the journal committed.

**Simplest model:** Ledger is authoritative. On recovery, lookup journal by `transaction_id`; if found, mark Core COMPLETED; if not and FAILED without journal, allow retry. No distributed 2PC required.

## 6. Reversal atomicity

One DB transaction must include:

- Insert reversing journal
- Mark original `reversed` + `reversed_by_journal_id`
- Mark Core original REVERSED
- Insert Core REVERSAL record

## 7. Account registry concurrency

One `account_id` → exactly one immutable `(type, currency)`. Postgres: PRIMARY KEY + CHECKs; no UPDATE of type/currency.

## 8. Proposed PostgreSQL constraints (DESIGN ONLY)

### accounts
- PRIMARY KEY (account_id)
- type NOT NULL, currency NOT NULL, CHECKs

### journals
- PRIMARY KEY (journal_id)
- UNIQUE (transaction_id) WHERE NOT NULL
- reverses_journal_id FK; UNIQUE where not null for single reverse

### journal_lines
- FK journal_id; amount_minor > 0; direction debit|credit; currency NOT NULL

### idempotency_keys
- UNIQUE (scope, key); request_hash; txn_id

## 9. Provider independence

Core `txn.id` is ledger `transaction_id`. No M-PESA/Airtel/Daraja IDs as primary keys.

## 10. Sandbox boundary

Unchanged: no live money, production credentials, real rails, or custody.
