# Ledger

## Rules

1. **Double-entry only.** Every journal has ≥2 lines; `SUM(debits) = SUM(credits)`.
2. **Integer minor units.** No floating-point.
3. **Posted journals are immutable.** Corrections use reversing journals.
4. **Balances are projections** derived from `ledger_lines`. They can be rebuilt.
5. **Never** `balance += amount` as source of truth.

## Tables

- `ledger_accounts` — chart of accounts (customer, merchant, provider_clearing, fee, …)
- `journal_entries` — header; status `posted` | `reversed`
- `ledger_lines` — debit/credit lines (amount always positive; direction matters)
- `ledger_balances` — projection cache, not authority

## Tests (must pass)

- Unbalanced journal rejected
- Posted journal cannot be edited
- Duplicate transaction cannot create second journal
- Reversal creates a new journal; net effect zero
- `rebuildBalances()` matches projection

See `@kifaa/ledger` package tests.
