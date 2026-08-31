# KIFAA-SC — DECISIONS

This file lists engineering decisions for KIFAA-SC. Each decision entry MUST include:
- decision-id: a short unique id (e.g., DEC-001)
- title
- decision description
- rationale
- status: PROPOSED | VERIFIED | LOCKED | SUPERSEDED | REJECTED
- author
- date
- references (files, experiments, links)

---

Initial decision templates

- DEC-001: Product isolation
  - description: KIFAA-SC stored under `KIFAA-SC/` to keep memory separate from payment KIFAA.
  - status: LOCKED
  - author: memory gate
  - date: 2026-08-31

- DEC-002: Hardware baseline (RK3576-class SOM, 8 GB RAM target)
  - description: Prototype/production compute baseline.
  - status: PROPOSED
  - author: memory gate
  - date: 2026-08-31

(Use this file to add, update, and supersede decisions. When superseding, reference the previous decision by id.)
