# KIFAA-SC — PROJECT_MEMORY

This file is the persistent engineering memory for PROJECT KIFAA-SC (Kenya-first smart scientific calculator / educational computer). KIFAA-SC is a separate product and project within the repository and MUST remain isolated from the existing payment-oriented KIFAA project. This file records the canonical product concept, architecture directions, provenance rules, and research gates.

---

## LOCKED decisions

- Product isolation: KIFAA-SC stored under `KIFAA-SC/` to keep memory and artifacts separate from the payment KIFAA project.
  - status: LOCKED
  - author: memory gate
  - date: 2026-08-31

- Recording/provenance rules: engineering decisions must carry status values (PROPOSED, VERIFIED, LOCKED, SUPERSEDED, REJECTED). External-AI reports must include source model/runtime and date. Do not delete historical findings.
  - status: LOCKED
  - author: memory gate
  - date: 2026-08-31

---

## PROPOSED architecture (2026-08-31)

These items are design directions and NOT VERIFIED. Mark them PROPOSED until measured or otherwise validated.

PRODUCT ARCHITECTURE (PROPOSED)
- Calculator-first physical front interface (must remain recognizable as a scientific calculator).
  - Front face requirements:
    - Physical scientific calculator buttons as the primary input.
    - Numeric keypad.
    - Scientific function keys.
    - Directional / navigation controls.
    - Dedicated system / function buttons.
    - Display positioned above the keypad.
    - Optional capacitive touch may be explored but must never replace the physical calculator interface.
  - Target physical envelope (PROPOSED): 195 × 98 × 26 mm

MODULAR REAR ARCHITECTURE (PROPOSED)
- Rear enclosure designed with standardized mechanical/electrical attachment zones to accept removable modules.
- Initial module concepts (PROPOSED):
  1. Battery module — removable external battery/power module. Magnetic/mechanical attachment preferred as a UX concept; electrical connector must be a safe, standardized interface. Interchangeability, voltage/current/protection, and thermal constraints must be verified before any claim of interchangeability or stacking is accepted.
  2. Camera/scanner module — rear-mounted modular camera/scanner enabling upgradeable imaging/scanning capability. Candidate interfaces: MIPI CSI, USB, or other low-power data interface. Implementation NOT LOCKED until engineering testing.
  3. Future modules — communication modules, additional battery modules, educational/peripheral modules. Exploratory.
- Design goal: keep the core calculator intact while enabling rear modules to provide optional capability.
- Engineering caveat: DO NOT assume magnetic attachment is electrically or mechanically safe without validation.

SOLAR ARCHITECTURE (PROPOSED)
- Investigate tiled small-cell solar layout integrated into recessed areas of the rear enclosure rather than a single large rectangular panel.
  - Example tiled layout (conceptual):
    [cell][cell][cell]
    [cell][cell][cell]
    [cell][cell][cell]
- Solar remains supplemental energy only and must not be presented as providing perpetual operation.
- Engineering objectives to balance: maximize usable solar area while preserving structural integrity, thermal management, battery safety, RF performance, camera access, serviceability, and appearance.
- Electrical topology, controller, cell dimensions, expected wattage and usable daily energy are UNVERIFIED and require measurement.

AI ARCHITECTURE (PROPOSED)
- Local/offline AI assistant is the default AI architecture; the device must be fully usable without SIM, Wi‑Fi, cloud APIs, or paid AI services.
- Ollama remains the current proposed local AI runtime, but its compatibility and performance on RK3576-class hardware is UNVERIFIED and must be experimentally validated before being considered LOCKED.
- Deterministic calculation (math/CAS) remains authoritative for numerical computation. The AI interprets, explains, and pedagogically assists but must never be the sole authority for numeric answers.
- High-level flow (PROPOSED):
  User → AI interpretation → deterministic math/CAS (compute & verify) → verified result → AI explanation

ONLINE / DATA MODE (PROPOSED)
- Default: OFFLINE MODE (device fully functional without connectivity).
- Optional: ONLINE/RESEARCH MODE — activated only when local knowledge is insufficient and the user explicitly authorizes online research. Connectivity is an enhancement, not a dependency.
- When ONLINE/RESEARCH MODE is used, all sources, timestamps, and provenance must be recorded in research logs and prompts.

BATTERY ARCHITECTURE (PROPOSED)
- Internal battery remains an option for the base device.
- External removable battery/power modules are being investigated; magnetic attachment is a preferred UX concept but must be validated for mechanical/electrical safety.
- External battery modules should function as reserve/extension batteries. Stacking is exploratory and NOT LOCKED.
- Do NOT treat previous numeric battery estimates as LOCKED. Use ESTIMATE or UNVERIFIED until measured.

CAMERA (PROPOSED)
- The core camera/scanner capability should be modular where practical. First prototypes may use a conventional fixed module; later prototypes should investigate detachable higher-quality scanning modules with standardized mounts and interfaces.

---

## UNVERIFIED assumptions (2026-08-31)

Label these as UNVERIFIED until tested or measured. Do not promote to VERIFIED without experimental evidence.
- Ollama performance on RK3576-class SOM (memory, CPU, quantization, latency).
- Actual solar output and usable daily energy for the tiled rear solar-cell concept.
- Safety and electrical architecture of magnetic battery attachment and battery stacking.
- Final camera module selection and imaging/OCR performance.
- Final enclosure dimensions (195 × 98 × 26 mm is a target but UNVERIFIED).
- Final thermal performance under sustained local AI workloads or with rear modules attached.
- Safe hot-plug/hot-swap architecture for removable battery modules.

Status: PROPOSED/UNVERIFIED where noted

---

## SUPERSEDED historical assumptions

- Prior analysis that used 4 GB RAM as a baseline is preserved as historical/adversarial input and is marked SUPERSEDED. Do not use 4 GB as the current baseline.

Status: SUPERSEDED

---

## KIFAA-SC P0.3 — Physical Architecture Validation (next research gate)

Purpose: validate the physical architecture and the modular rear subsystem sufficiently to make subsequent LOCKED decisions or to design prototypes.

First experiments (priority list):
- Determine actual small solar-cell sizes and power density achievable within the rear enclosure.
- Define removable battery architecture (connector, voltage/current, protection, thermal behavior).
- Validate magnetic/mechanical attachment concept for battery modules (mechanical retention, electrical contact reliability, isolation during insertion/removal).
- Define safe battery connector and hot-plug topology (fuses, protection ICs, sequencing).
- Validate camera module mounting and data interface (MIPI CSI / USB / alternative) on target development hardware.
- Measure thermal impact of rear modules and their effect on device performance and comfort.
- Characterize LTE antenna interaction with tiled solar area and rear modules.
- Select exact RK3576 development kit(s) and measure power/performance.
- Experimentally evaluate Ollama/runtime feasibility on representative RK3576 hardware.
- Measure system-level power consumption under representative workloads.

Status: PROPOSED (research gate P0.3)

---

Last updated: 2026-08-31 (author: memory gate)
