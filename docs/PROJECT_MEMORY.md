# KIFAA — Project Memory (Initialisation)

This file is an append-only project memory and workflow control document. It records decisions, AI reports, and session history. Do not erase previous entries.

## Current direction
KIFAA is being built as a modular payment/merchant technology platform. The system is designed to integrate with authorised payment providers and to avoid becoming a holder of customer funds unless explicitly authorised.

## Current engineering strategy
Build the application and infrastructure first using simulation/sandbox integrations. Design provider adapters and routing in a provider-neutral way and encode SANDBOX/PRODUCTION gating.

## Regulatory strategy
Regulatory questions are maintained separately and must not be confused with engineering assumptions. All regulatory findings are AI_REPORTED until primary-source confirmation is attached.

## Known unresolved questions (from 2026-08-29 audit)
- Whether a Regulation 23 outsourced technology provider requires its own PSP authorisation when processing/storing payment data
- Whether multi-PSP orchestration requires KIFAA's own authorisation
- Treatment of transaction ledgers and whether they constitute stored-value instruments
- Treatment of payment instruction generation and whether it constitutes payment initiation under the NPS Act
- Treatment of STK Push initiation and whether orchestration requires provider-level approvals
- Merchant contracting structure and the responsibilities for settlement
- CBK requirements for production onboarding

---

(Existing project memory entries preserved below)

