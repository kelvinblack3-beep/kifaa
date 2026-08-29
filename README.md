# KIFAA

KIFAA is a Kenya-first financial interface & payment orchestration platform.

Purpose
- Provide merchants and users with a unified technology layer for payment operations while integrating with authorised payment providers.
- Avoid custody of customer funds unless explicitly authorised.

Current development stage
- Milestone 1: Repository and project memory initialization; sandbox-first engineering.

Repository structure (high-level)
- docs/ — project memory, architecture, regulatory and audit artifacts
- apps/ — application packages (API, web, etc.)
- packages/ — shared libraries and modules (ledger, transactions, database, crypto)
- adapters/ — provider adapter implementations and skeletons
- DECISIONS/ — Architecture Decision Records (ADRs)
- AUDITS/ — audit reports and regulatory research

Sandbox policy
- The repo operates in SIMULATED / SANDBOX / PRODUCTION modes. Default development mode is SANDBOX.
- Never commit production credentials to the repository.

How to contribute
- Read docs/PROJECT_MEMORY.md before making changes.
- Follow ADRs in DECISIONS/ for architectural changes.
- Run tests and typechecks before opening pull requests.

Security & regulatory note
- This repository contains engineering documentation and code scaffolding only. It is NOT an authorization to process live payments. All production payment activity requires provider contracts and regulatory confirmations.
