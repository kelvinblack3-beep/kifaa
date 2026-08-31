# KIFAA-SC — HARDWARE_BASELINE

Purpose: record current hardware baselines, measured results, and the provenance of each claim (measured vs estimate). Use explicit provenance tags: LOCKED, PROPOSED, VERIFIED, ESTIMATE, UNVERIFIED, SUPERSEDED.

Known baseline (2026-08-31)

LOCKED
- Product isolation (KIFAA-SC directory & memory separation from the payment KIFAA project)
  - status: LOCKED
  - provenance: repository decision DEC-001

PROPOSED
- Compute: RK3576-class System-on-Module (preferred prototype/production direction)
  - status: PROPOSED
- RAM: 8 GB target
  - status: PROPOSED
  - provenance: project baseline (DO NOT revert to prior 4 GB assumption; that assumption is SUPERSEDED)
- Storage: 128 GB eMMC + optional microSD
  - status: PROPOSED
- Display: 5.5-inch high-brightness IPS preferred
  - status: PROPOSED
- Modular rear architecture (battery modules, camera module, attachment zones)
  - status: PROPOSED
- Solar integration: tiled small-cell solar concept across rear enclosure (conceptual)
  - status: PROPOSED
- Modular battery: removable external battery/power module (magnetic/mechanical UX concept)
  - status: PROPOSED
- Modular camera: rear-mounted detachable camera/scanner
  - status: PROPOSED
- Connectivity: optional LTE; offline-first baseline
  - status: PROPOSED

ESTIMATE / UNVERIFIED
- Battery: previous estimate 25–35 Wh — treat as ESTIMATE, not LOCKED
  - status: ESTIMATE
- Thermal performance under sustained local AI workloads — UNVERIFIED
  - status: UNVERIFIED
- Ollama runtime performance on RK3576-class SOM — UNVERIFIED
  - status: UNVERIFIED
- Magnetic battery electrical architecture and stacking safety — UNVERIFIED
  - status: UNVERIFIED
- Final camera module, lens, and OCR performance — UNVERIFIED
  - status: UNVERIFIED
- Final enclosure dimensions (195 × 98 × 26 mm is a target) — UNVERIFIED
  - status: UNVERIFIED

OPEN items requiring measurement or design work
- Hardware security architecture (secure boot, secure update)
- Exam mode security threat modeling
- Mechanical retention and drop resistance for rear modules

Notes
- Do not convert ESTIMATES or UNVERIFIED items to VERIFIED without experimental evidence or authoritative supplier/manufacturer documentation. Record all test artifacts and measurements in KIFAA-SC/RESEARCH_LOG.md and reference them here when available.

Last updated: 2026-08-31 (author: memory gate)
