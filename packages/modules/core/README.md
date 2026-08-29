# @kifaa/core — V0.1 SANDBOX platform

Working vertical slice for KIFAA internal accounts (**development only**).

## Capabilities
- User registration / login (phone + PIN, scrypt)
- Unique KIFAA ID
- Double-entry ledger balances (projections)
- KIFAA → KIFAA transfer (idempotent)
- Add test money (SANDBOX)
- Merchant pay (till / QR)
- Agent cash-in / cash-out (QR, status machine)
- Reversal
- Transaction history + receipts
- Provider interfaces + SandboxProvider

## Labels
Every balance and transaction is marked `sandbox: true`.
This is **not** a licensed e-money product. Production rails require CBK/partner clearance.

## Test
```bash
pnpm --filter @kifaa/core test
```
