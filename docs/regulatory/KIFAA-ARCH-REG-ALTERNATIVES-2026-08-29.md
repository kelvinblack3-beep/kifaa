# KIFAA-ARCH-REG-ALTERNATIVES-2026-08-29

**Session:** KIFAA-ARCH-REG-ALTERNATIVES-2026-08-29  
**Role:** Independent Regulatory Architecture Research  
**Status:** RESEARCH GATE — NO PRODUCTION IMPLEMENTATION  
**Date:** 2026-08-29  

## 1. Executive conclusion

Lowest-regulatory-burden path for KIFAA’s **non-custodial** orchestration product is **not** independent full PSP licensing first.

**Recommended consultation architecture:**  
**Single licensed PSP as payment principal + KIFAA technology layer** (Model E + elements of Model C outsourcing / Model F white-label).

- Licensed PSP: funds, execution, settlement, regulated principal relationship.  
- KIFAA: UI/API/USSD, transaction state, adapters behind partner, webhooks, internal accounting projections, reconciliation views, risk rules, notifications, merchant dashboards.  
- KIFAA does **not** hold funds, issue e-money, operate redeemable wallets, or settle merchants.

**Not a statutory safe harbour.** NPS Act s.2 is broad; s.12 prohibits conducting PSP **business** without authorisation. Reg 14 agents and Reg 23 outsourcing keep the **PSP responsible**.

Milestone 1 may continue under existing gates. Live commercial payment features remain blocked pending CBK/counsel confirmation.

## 2. Primary-source evidence

| Source | Proves | Does not prove |
|--------|--------|----------------|
| NPS Act s.2 | Broad PSP definition | Every data processor needs own PSP licence |
| NPS Act s.12 | Must not conduct PSP **business** unauthorised | Exact tech-vendor boundary |
| NPS Reg 14 | PSP may appoint agent; agent may process/store payments/data **on behalf of** PSP | Agent = general tech exemption; multi-PSP free agency |
| NPS Reg 15–18 | Cash merchants; enlisting; appointment | Unlimited orchestration agency |
| NPS Reg 23 | Outsource operational functions; notify CBK ≥30 days; material-function limits; no senior-mgmt delegation; CBK oversight of third party | Outsourcee free of all residual risk |
| First Schedule | Capital 5M / 20M / 1M / 50M | Only path for KIFAA |
| CBK Directory 17 Jun 2026 | Official list; **KENEX = entry 43** | Similarity = KIFAA permission |
| KENEX entry | Licensed 16 Mar 2023; platform for SWIFT **on behalf of banks** | KIFAA may do multi-rail merchant orchestration without authorisation |

## 3. Models A–F (summary)

**A Full PSP** — possible; capital/governance/AML full load; **not necessary first**.  
**B Agent (Reg 14)** — real structure **on behalf of a PSP**; not multi-PSP tech exemption.  
**C Outsourcing (Reg 23)** — operational tech outsourceable with notification; PSP remains responsible.  
**D Multi-PSP SaaS** — highest risk when KIFAA is principal, auto-routes, unified checkout as provider.  
**E Single-PSP dependent** — **lowest practical burden** for consultation; same merchant tech possible.  
**F Infrastructure to PSPs** — strongest tech-provider posture; less direct merchant brand.

## 4. Function risk (abbrev)

CRITICAL blocked: custody, settlement, wallet/stored value.  
HIGH: payment initiation as principal, merchant aggregation as principal, multi-PSP principal routing, STK with own principal shortcode.  
MEDIUM: intent creation, instruction routing, checkout UX, provider selection.  
LOW–MEDIUM: API gateway, webhooks, history, internal ledger projections, reconciliation views, risk rules engines, dashboards (non-principal).

## 5. KENEX

- Entity: Kenya Commerce Exchange Service Bureau (KENEX)  
- First licensed: 16 March 2023  
- Approved: platform facilitating processing of SWIFT payments **on behalf of banks**  
- **Proves:** CBK authorises platform models subordinate to regulated principals.  
- **Does not prove:** KIFAA permission by analogy.

## 6. Lowest-risk architecture

```
Customer/Merchant → KIFAA tech (UI/API/state) → ONE licensed PSP principal
  → rails (M-PESA/Airtel/PesaLink as offered by PSP)
  → callbacks (metadata) → KIFAA projections/reconciliation views
```

PSP notifies CBK of material outsourcing (≥30 days). Contracts: no delegation of PSP senior management responsibility; customer obligations unchanged; CBK third-party oversight clause.

## 7. Red lines (without authorisation)

Customer funds; redeemable balances; KIFAA wallet; KIFAA settlement; KIFAA as payment principal; independent aggregation; live production money; claiming PSP status or legal exemption.

## 8. Prior conclusions

**PRESERVED:** broad definition; no software harbour; no automatic partnership harbour; custody/settlement/live blocked; sandbox OK; CBK is primary blocker; AI ≠ CBK approval.

**NEW/REFINED:** Reg 14/23 detail; KENEX precedent; single-PSP+tech as preferred **consultation** model; directory entry 43 = KENEX.

## 9. CBK questions

1. Is non-custodial instruction UX to one PSP “conducting PSP business”?  
2. Accept KIFAA as Reg 23 outsourcee for API/state/webhooks/dashboards?  
3. Multi-PSP auto-routing by non-authorised entity?  
4. White-label Model F notification requirements?

## 10. Engineering impact

**MAY PROCEED:** Milestone 1 scaffold, non-custodial ledger projections, sandbox adapters, state machine, UI shells, audit.  
**CONDITIONAL:** Partner-shaped integrations; non-fund-moving callbacks.  
**BLOCKED:** custody, stored value, KIFAA settlement, live money, independent multi-PSP principal production, PSP claims.

**Decision: PROCEED CONDITIONALLY**

## 11. Anti-loop

DO NOT REPEAT WITHOUT NEW EVIDENCE: NPS breadth; no software harbour; no partnership harbour; custody/settlement/live blocked; sandbox OK; capital table; CTR 15k; ODPC financial services; Airtel PSP; PesaLink programme; STR clock unresolved; Reg 14 ≠ tech exemption; Reg 23 30-day notice; KENEX ≠ KIFAA permission; preferred model = single-PSP principal + KIFAA tech.
