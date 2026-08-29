-- KIFAA durable ledger foundation (brand-new schema)
-- Journal history is the financial source of truth.
-- Balance projections are derived and rebuildable.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_accounts (
  account_id   TEXT PRIMARY KEY,
  account_type TEXT NOT NULL
    CHECK (account_type IN (
      'asset','liability','equity','revenue','expense',
      'customer','merchant','provider_clearing','fee','suspense'
    )),
  currency     TEXT NOT NULL
    CHECK (currency IN ('KES','USD','EUR','GBP')),
  label        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
  journal_id             TEXT PRIMARY KEY,
  transaction_id         TEXT,
  description            TEXT,
  status                 TEXT NOT NULL DEFAULT 'posted'
    CHECK (status IN ('posted','reversed')),
  reverses_journal_id    TEXT REFERENCES journal_entries(journal_id),
  reversed_by_journal_id TEXT REFERENCES journal_entries(journal_id),
  created_by             TEXT,
  metadata               JSONB,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS journal_entries_transaction_id_uidx
  ON journal_entries (transaction_id)
  WHERE transaction_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS journal_entries_reverses_uidx
  ON journal_entries (reverses_journal_id)
  WHERE reverses_journal_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS ledger_lines (
  line_id      TEXT PRIMARY KEY,
  journal_id   TEXT NOT NULL REFERENCES journal_entries(journal_id) ON DELETE RESTRICT,
  account_id   TEXT NOT NULL REFERENCES ledger_accounts(account_id) ON DELETE RESTRICT,
  direction    TEXT NOT NULL CHECK (direction IN ('debit','credit')),
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency     TEXT NOT NULL CHECK (currency IN ('KES','USD','EUR','GBP')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ledger_lines_journal_idx ON ledger_lines (journal_id);
CREATE INDEX IF NOT EXISTS ledger_lines_account_idx ON ledger_lines (account_id);

CREATE TABLE IF NOT EXISTS ledger_balance_projections (
  account_id    TEXT NOT NULL REFERENCES ledger_accounts(account_id) ON DELETE RESTRICT,
  currency      TEXT NOT NULL CHECK (currency IN ('KES','USD','EUR','GBP')),
  balance_minor BIGINT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (account_id, currency)
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  scope           TEXT NOT NULL,
  key             TEXT NOT NULL,
  request_hash    TEXT NOT NULL,
  transaction_id  TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (scope, key)
);

CREATE INDEX IF NOT EXISTS idempotency_keys_txn_idx ON idempotency_keys (transaction_id);
