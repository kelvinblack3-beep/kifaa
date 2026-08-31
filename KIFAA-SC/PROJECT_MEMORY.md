# KIFAA-SC — PROJECT_MEMORY

This file is the persistent engineering memory for PROJECT KIFAA-SC (Kenya-first smart scientific calculator / educational computer). KIFAA-SC is a separate product and project within the repository and MUST be kept isolated from the existing payment-oriented KIFAA project. Do NOT modify, delete, or overwrite the original payment KIFAA project. This directory is the canonical memory for KIFAA-SC and will store decisions, research, logs, failures, baselines, AI reports and open questions.

---

## 1) Why KIFAA-SC is isolated from the existing payment KIFAA project

- Separation of concerns: the existing `kifaa` project is a financial orchestration platform (payments, ledger, adapters). KIFAA-SC is a distinct hardware+software product (educational scientific calculator) with different regulatory, security, and IP concerns.
- Risk containment: changes, experiments, or prototypes for KIFAA-SC must not interfere with or introduce risk to the payment platform codebase or CI/CD for the payment product.
- Persistent memory clarity: storing KIFAA-SC engineering memory in a clearly named subdirectory (`KIFAA-SC/`) prevents accidental mixing of decisions, artifacts, and historical records.

Status: LOCKED

---

## 2) Current product concept

- Product: KIFAA-SC — a physical scientific calculator designed for Kenyan secondary-school education, extended to provide offline educational computing features, local AI assistance, OCR/scanning, graphing, curriculum content and optional online research/connectivity.
- Form-factor: remains recognizably a scientific calculator; physical calculator buttons remain the primary input.
- Modularity: smartphone-inspired modular rear architecture under investigation (modular camera/scanner, battery packs, optional magnetic power-bank attachment).
- Power: integrated solar cells on the rear surface are being investigated; solar is supplemental, not assumed to provide perpetual operation.
- Prototyping: 3D-printed enclosure acceptable for prototype; production may move to injection molding later.

Status: PROPOSED

---

## 3) Current hardware direction

- Preferred compute: RK3576-class SOM for prototype/production direction.
- Memory target: 8 GB RAM (CRITICAL — do NOT replace with prior 4 GB assumption; preserve 4 GB analysis as historical/adversarial input only).
- Storage target: 128 GB eMMC plus optional microSD.
- Display: 5.5-inch high-brightness IPS preferred.
- Camera: modular camera module, target ~5–8 MP MIPI CSI.
- Connectivity: LTE optional; not required for core operation. Offline-first is the baseline.
- Battery: target ~25–35 Wh (estimate — requires validation).
- Thermal: passive thermal design preferred.
- Low-power MCU: dedicated low-power calculator MCU is preferred to handle core deterministic calculations and low-power standby.
- Security: hardware security and secure update architecture require further verification. Exam mode security requires significantly more investigation before being called secure.

Status: PROPOSED

---

## 4) Current offline-local-AI direction

- Primary AI model operation is LOCAL/OFFLINE.
- Local AI must not require an internet connection or paid cloud APIs for core functionality.
- Ollama is the currently proposed local AI runtime; its compatibility and performance on target embedded hardware MUST be experimentally verified before it is considered LOCKED.
- Online connectivity is OPTIONAL. Explicit ONLINE/RESEARCH mode may be invoked only when the user explicitly requests information outside the local knowledge/content capability and connectivity exists.
- Offline mode must remain fully functional without SIM or Wi‑Fi.
- The deterministic calculator/math engine is the single authority for numerical computation. AI provides interpretation, explanation, and pedagogical assistance but must never be the sole authority for numerical answers.

Status: PROPOSED

---

## 5) Recording research and AI reports

- All future research, experiments, and external-AI reports related to KIFAA-SC MUST be recorded in this directory and referenced from PROJECT_MEMORY.md.
- Every engineering decision recorded in KIFAA-SC must have a status: PROPOSED, VERIFIED, LOCKED, SUPERSEDED, or REJECTED.
- Every external-AI report must identify the source AI (model/runtime/service) and the date the report was produced. Example: "Ollama vX.Y on-device run, 2026-08-31".
- Distinguish VERIFIED facts from ESTIMATES, ASSUMPTIONS, and UNVERIFIED claims explicitly in entries.
- Do not delete previous findings. When a decision is changed, mark the older decision as SUPERSEDED and reference the new decision.

Status: LOCKED

---

### Historical/adversarial inputs
- A prior analysis assumed 4 GB RAM for the device; DO NOT copy that 4 GB assumption into the current baseline. Preserve the 4 GB analysis only as a historical/adversarial input and explicitly mark it as such in relevant documents.

Status: SUPERSEDED

---

Last updated: 2026-08-31 (author: memory gate)
