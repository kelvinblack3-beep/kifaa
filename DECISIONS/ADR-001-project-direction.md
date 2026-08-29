# ADR-001: Project direction

Decision ID: ADR-001
Date: 2026-08-29
Status: accepted (project initialization)

Decision
- Project is initiated as KIFAA: a modular Kenyan payment/merchant technology platform.
- The project will avoid custody of customer funds unless explicitly authorised by regulator and contractual agreements.

Reason
- Regulatory complexity and risk associated with custody, settlement, and e-money issuance.

Consequences
- Design must keep provider integrations modular and sandbox-first.
- Any change to custody/settlement model requires a formal ADR and regulatory evidence.
