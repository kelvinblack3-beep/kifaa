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

- DEC-006: SHARP BOYZ as Kenyan Education Intelligence Platform
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - summary: SHARP BOYZ is a Kenyan Education Intelligence Platform combining Exam Mastery and Knowledge Mastery. Core objective: help a student understand what they are learning, why it matters, where it is used in real life, how well they understand it, and what they should learn next. Not limited to past papers, prediction, notes, or a generic chatbot.

- DEC-007: Legacy KCSE and Current CBE/Senior School Context Separation
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - summary: Architecture must distinguish legacy Form 1–4 / KCSE context from current CBE / Senior School / Grade 10–12 context. Historical and current material retain provenance and must not be mixed blindly.

- DEC-008: Grounded and Versioned Educational Retrieval
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - summary: Educational content is versioned, grounded source material with provenance. Authoritative sources remain distinct from generated explanation. Do not rely on uncontrolled “train AI on curriculum PDFs.”

- DEC-009: Real-Life Application as Core Product Capability
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - summary: Real-life application is core, not decorative. Connect concept → real problem → Kenyan example → career relevance → practical challenge to support Knowledge Mastery.

- DEC-010: KCSE Prediction Is Probabilistic Revision Guidance
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - summary: Prediction is probabilistic revision guidance, never certainty. Historical frequencies must be verified; demo values must never be presented as real KCSE statistics.

- DEC-011: Student Intelligence Requires Accumulated Evidence
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - summary: Mastery and weakness judgements require accumulated evidence over time (topic, attempts, correctness, time, error type, confidence, repeated performance, etc.), not single answers. Schema may evolve; principle is locked.

- DEC-012: AI Explains and Coaches; Deterministic Systems Remain Authoritative
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - summary: AI explains, tutors, contextualises, and coaches. Deterministic systems remain authoritative for scoring, calculations, curriculum mapping, performance, prediction, and revision-priority. AI must not fabricate mastery, statistics, curriculum facts, sources, or evidence.

- DEC-013: Offline-First Core with Online AI Enhancement
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - summary: Core educational experience should remain useful offline where practical. Online connectivity enhances AI tutoring, sync, and remote content. Basic learning must not require constant internet.

---

## Product vision (LOCKED framing)

SHARP BOYZ is built around two connected tracks:

**Exam Mastery**
- KCSE preparation and related assessment contexts
- diagnostics
- past questions
- performance analysis
- probabilistic prediction
- revision priority
- exam technique

**Knowledge Mastery**
- concepts
- real-life applications
- Kenyan examples
- careers
- projects
- critical thinking
- problem solving
- cross-subject connections

**Core learning loop**
```
Student
→ Learn / Diagnostic / Practice
→ Performance Evidence
→ Weakness Detection
→ Historical KCSE Analysis
→ Subject-Specific Prediction / Priority
→ Prediction × Weakness
→ Revision Priority
→ AI Explanation
→ Real-Life Application
→ Targeted Practice
→ New Evidence
→ Updated Student Model
```

This loop is product memory, not an implementation specification.

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
  - AI Orchestrator (explanation, tutoring) — offline-first core with online enhancement (see DEC-013)

Note: DEC-003 Modular Rear Architecture remains PROPOSED. Hardware remains deferred under DEC-004. Do not treat hardware module designs as LOCKED deployment decisions.

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

Governance decisions DEC-006 through DEC-013 were accepted by the project lead on 2026-09-03 after multi-AI research and reconciliation. They are recorded here as LOCKED product principles, not as completed implementation.

---

Last updated: 2026-09-03 (author: project lead / memory gate; SHARP-BOYZ-GOV-001)
