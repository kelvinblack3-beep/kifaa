# Architecture (summary)

Principles
- One backend and one financial transaction engine. All interfaces call the same backend (PWA, USSD, Merchant web, Public API, Internal/admin).
- Money movement is routed: Identity -> Risk -> Transaction Engine -> Router -> Provider Adapter -> Callback -> Ledger
- Modular monolith architecture (pnpm workspaces); provider adapters isolated.
- Ledger is double-entry and uses integer minor units only.

Layers
1. Identity / Auth
2. Risk
3. Transaction Engine
4. Payment Router
5. Provider Adapters
6. Ledger
7. Notifications
8. Reconciliation & audit

Design notes
- Provider-specific code lives in adapters. Router selects adapter by rail/capability.
- Implement SANDBOX/PRODUCTION gating for adapters and provider credentials.
