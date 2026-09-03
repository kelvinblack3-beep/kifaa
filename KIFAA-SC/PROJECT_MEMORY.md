# KIFAA-SC — PROJECT_MEMORY

This file is the persistent engineering memory for PROJECT KIFAA-SC (historical/internal). The active public product is SHARP BOYZ and mobile-first software development is the authoritative Phase 1.

---

## LOCKED decisions

- Product isolation: KIFAA-SC stored under `KIFAA-SC/` to keep memory and artifacts separate from the payment KIFAA project.
  - status: LOCKED
  - author: memory gate
  - date: 2026-08-31

- Recording/provenance rules: engineering decisions must carry status values (PROPOSED, VERIFIED, LOCKED, SUPERSEDED, REJECTED). External-AI reports must include source model/runtime and date.
  - status: LOCKED
  - author: memory gate
  - date: 2026-08-31

- DEC-004: Mobile-First Software Platform / Hardware Deferred
  - status: LOCKED
  - author: memory gate
  - date: 2026-09-03
  - summary: SHARP BOYZ Phase 1 is a smartphone application (SHARP BOYZ MOBILE). Dedicated hardware development is deferred to Phase 2. Historical RK3576 research is preserved for provenance and later measurement.

- DEC-005: Project/Product Name Change to SHARP BOYZ
  - status: LOCKED
  - author: memory gate
  - date: 2026-09-03
  - summary: Active public product name is SHARP BOYZ. Historical/internal name remains KIFAA-SC. New naming conventions: SHARP BOYZ MOBILE, SHARP BOYZ HARDWARE, SHARP BOYZ CORE.

---

## PROPOSED architecture (updated)

These items are design directions and NOT VERIFIED. Mark them PROPOSED until measured or otherwise validated.

PRODUCT ARCHITECTURE (PROPOSED)
- Mobile-first SHARP BOYZ MOBILE application as Phase 1 delivery vehicle.
  - status: PROPOSED
  - rationale: smartphones provide immediate UX/hardware and allow rapid market validation without committing to dedicated hardware.

- Core boundaries (PROPOSED):
  - SHARP BOYZ Mobile (app)
  - SHARP BOYZ Core (portable shared software/core layer)
  - SHARP BOYZ Hardware (deferred Phase 2 program)

- High-level product architecture for SHARP BOYZ MOBILE (PROPOSED):
  - Student-facing mobile PWA/native shell
  - SHARP BOYZ Core services (prediction engine, deterministic math/CAS, curriculum engine)
  - Local persistence + optional cloud sync
  - AI Orchestrator (explanation, tutoring) — OFFLINE-FIRST default

---

## UNVERIFIED assumptions (preserved)

- Ollama performance on RK3576-class SOM (memory, CPU, quantization, latency) — UNVERIFIED (preserved as historical research).
- Final hardware-specific thermal and battery behavior — UNVERIFIED.

---

## PHASE 1 — SHARP BOYZ MOBILE (immediate focus)

Purpose: build a mobile-first MVP to validate demand and gather usage data that will inform any future hardware program.

Key initial experiments and acceptance criteria (PROPOSED -> VERIFIED after evidence):
- P1-MOBILE-001: KCSE curriculum ingestion & canonical mapping
- P1-MOBILE-002: KCSE historical question corpus ingestion (legal compliance required)
- P1-MOBILE-003: Diagnostic & scoring engine (deterministic, auditable)
- P1-MOBILE-004: Prediction prototype for one subject (transparent statistical model)
- P1-MOBILE-005: Student model & mastery tracking
- P1-MOBILE-006: Mobile-first PWA skeleton & UX diagnostic flow

---

## PROVENANCE

All historical hardware research (RK3576, modular hardware ideas, solar experiments) is preserved within `KIFAA-SC/` and must not be deleted. These are retained for Phase-2 hardware validation once Phase-1 produces sufficient evidence.

---

Last updated: 2026-09-03 (author: copilot memory gate)
