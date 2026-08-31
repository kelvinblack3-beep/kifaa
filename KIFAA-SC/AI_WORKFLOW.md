# KIFAA-SC — AI_WORKFLOW

Purpose: describe AI usage, workflows, and guardrails for KIFAA-SC.

Principles:
- Local-first: AI must work offline for primary educational features.
- Explicit online mode: when an online search or cloud API is required, enter a clearly-labeled ONLINE/RESEARCH mode that the user explicitly authorizes.
- Transparency: every AI-provided claim must be labeled with its provenance (local model name/version, or remote service and timestamp).
- Non-authoritative: AI may provide interpretations and explanations but must not be the sole authority for deterministic numeric answers.
- Auditability: store AI prompts, model version, seed data, and output for future auditing in `KIFAA-SC/prompts/` and research logs.

Proposed workflow (high-level):
1. User requests explanation/assistance for a math problem.
2. Deterministic math engine computes the solution and a verified numeric result.
3. Local AI model provides step-by-step explanation, pedagogical feedback, or alternate solution methods, referencing the deterministic result.
4. If the user requests outside-local knowledge, prompt user to opt into ONLINE/RESEARCH mode; if accepted and connectivity exists, run controlled online queries and record them.

AI report metadata requirements:
- model/runtime name (e.g., Ollama vX.Y)
- model size and type (if known)
- device/hardware/runtime used (RK3576-class SOM, emulator, desktop, etc.)
- date and time
- prompt(s) used (store in KIFAA-SC/prompts/)
- raw output and summary
- performance metrics (latency, memory, swap usage)

Status: PROPOSED
