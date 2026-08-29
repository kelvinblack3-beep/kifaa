

---

## Session: KIFAA-ENG-GATE-2026-08-29-COPILOT

Controller AI: GitHub Copilot
Date: 2026-08-29
Role: Project Memory & Engineering Workflow Controller

(Prior gate entry preserved — ENGINEERING PROCEEDING UNDER REGULATORY CONSTRAINTS. See commit history for full text.)

---

## Session: KIFAA-ARCH-REG-ALTERNATIVES-2026-08-29

**Type:** Alternative regulatory architecture research  
**Status:** RESEARCH GATE COMPLETE — NO PRODUCTION IMPLEMENTATION  
**Date:** 2026-08-29  
**Commit:** docs: research alternative KIFAA regulatory architectures

### Research performed
Models A–F (full PSP; agent Reg 14–18; outsourcing Reg 23; multi-PSP SaaS; single-PSP dependent; infrastructure-to-PSP). Primary NPS Act/Regulations; CBK PSP directory 17 Jun 2026; KENEX entry; function matrix; red lines.

### Sources
- NPS Act 2011 s.2, s.12
- NPS Regulations 2014 Reg 14–18, Reg 23, First Schedule
- CBK Directory of Authorized PSPs as at 17 June 2026
- CBK PSP authorisation checklist
- Prior: KIFAA-REG-VERIFY-2026-02-GROK; KIFAA-REG-FINAL-REGULATORY-RECON-2026-08-GROK

### Findings
- Agent may process/store payments/data **on behalf of** a PSP — not a general tech exemption.
- Outsourcing operational functions permitted with ≥30-day CBK notice; PSP retains responsibility.
- Lowest practical consultation architecture: **Single licensed PSP principal + KIFAA technology layer**.
- KENEX (entry 43; licensed 16 Mar 2023): platform for SWIFT **on behalf of banks** — precedent of subordinate platform, not KIFAA permission.

### Previous conclusions preserved
NPS definition broad; no software safe harbour; no automatic partnership harbour; custody/settlement/live blocked; sandbox OK; CBK primary blocker; AI ≠ CBK approval.

### Recommended architecture
Single licensed PSP as payment principal + KIFAA technology layer (Reg 23 / white-label capable).

### Engineering impact
- MAY PROCEED: Milestone 1 non-custodial scaffold, ledger projections, sandbox adapters, state machine, UI shells.
- CONDITIONAL: partner-shaped integrations; non-fund-moving callbacks.
- BLOCKED: custody, stored value, KIFAA settlement, live money, independent multi-PSP principal production, PSP claims.

### Decision
**PROCEED CONDITIONALLY**

### Anti-loop
**DO NOT REPEAT WITHOUT NEW EVIDENCE:** NPS breadth; no software harbour; no partnership harbour; custody/settlement/live blocked; sandbox OK; capital table; CTR 15k; ODPC financial services; Airtel PSP; PesaLink programme; STR clock unresolved; Reg 14 ≠ tech exemption; Reg 23 30-day notice; KENEX ≠ KIFAA permission; preferred model = single-PSP principal + KIFAA tech.

**Full research:** `docs/regulatory/KIFAA-ARCH-REG-ALTERNATIVES-2026-08-29.md`

---

End of KIFAA-ARCH-REG-ALTERNATIVES-2026-08-29
