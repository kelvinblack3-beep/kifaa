# KIFAA-SC — SOFTWARE_BASELINE

Purpose: record software baselines, trusted runtimes, and deterministic engines.

Known baseline (2026-08-31):

- Deterministic math engine: a dedicated deterministic computation layer (not AI-driven) for all scientific calculations; this is the authority for numerical results.
  - status: PROPOSED

- Local AI runtime: Ollama is the proposed runtime for local AI model hosting; compatibility/performance on RK3576-class hardware must be validated.
  - status: PROPOSED

- OS / runtime: embedded Linux on RK3576-class SOM for prototype; specifics TBD via experiments.
  - status: PROPOSED

- Persistence: local content (curriculum, examples) must be bundle-able for offline use; update mechanisms must support secure updates (TBD).
  - status: OPEN

- Security and secure update tooling: OPEN — requires design and verification.

---

Record software experiments, exact versions, kernel/runtime configs, and benchmark outputs in RESEARCH_LOG.md and reference them here.
