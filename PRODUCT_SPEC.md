# Product specification — KIFAA

Summary
- KIFAA provides a modular orchestration platform allowing merchants and applications to route payment instructions to licensed payment providers. The platform is provider-agnostic and designed for Kenya-first deployment.

Primary goals
- Provide a reliable transaction orchestration layer.
- Maintain auditable internal accounting records (double-entry ledger) for reconciliation and audit.
- Support multiple provider adapters (M-PESA, Airtel Money, PesaLink, banks) through a pluggable adapter architecture.
- Operate in sandbox mode by default to enable development and testing without moving real money.

Key non-functional requirements
- Security-first: secrets never committed, strong authentication, encrypted data-at-rest where required.
- Auditability: immutable logs, event history, and rebuildable ledger projections.
- Extensibility: adapter-based provider integration, clear contracts for new providers.

Scope for Milestone 1
- Repository and project memory initialization
- Shared types and interfaces
- Ledger module verification (in repo)
- Sandbox adapter interfaces and sample mock adapters
- Transaction state model and database schema placeholders

Out of scope (Milestone 1)
- Production provider onboarding
- Live payment processing
- Custodial wallets or e-money services
