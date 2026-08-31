# KIFAA-SC — RESEARCH_LOG

Purpose: chronological research entries, experiment notes, and links to artifacts for P0.3 research campaign. Each experiment entry MUST follow the standard template. External-AI reports must include model/runtime name, date, assignment ID, sources, exact claims, and a provenance/confidence note.

Format guidance for each entry:
- entry-id
- date
- author/researcher (human or AI agent)
- assignment-id (P0.3-...)
- objective
- engineering question
- current assumption(s)
- what must be measured / researched
- acceptance criteria (pass/fail conditions)
- required hardware / data / instruments
- assigned AI / researcher
- status: PROPOSED | OPEN | IN-PROGRESS | BLOCKED | COMPLETED | VERIFIED | SUPERSEDED | REJECTED
- evidence / artifact location (repo path, external URL, checksum)
- result (leave blank until experiment completes)
- decision (leave blank until reviewed by CHATGPT lead)
- follow-up actions

---

Initial seed entry:
- RL-001
  - date: 2026-08-31
  - author: memory gate
  - assignment-id: project-init
  - objective: Initialize persistent memory and P0.3 research gate.
  - engineering question: N/A
  - current assumption(s): Baseline architecture and provenance rules present.
  - what must be measured: N/A
  - acceptance criteria: Directory and files exist and follow provenance rules.
  - required hardware/data: N/A
  - assigned AI/researcher: COPILOT
  - status: COMPLETED
  - evidence: KIFAA-SC/PROJECT_MEMORY.md, KIFAA-SC/DECISIONS.md
  - result: Repository seeded for P0.3 campaign
  - decision: Proceed to P0.3 experiments
  - follow-up: Create P0.3 experiment entries and tracker.

---

P0.3 experiment entries (seeded)

- P0.3-HW-001
  - date: 2026-08-31
  - author: GROK (primary hardware researcher)
  - assignment-id: P0.3-HW-001
  - objective: Select RK3576 development board(s) suitable for prototyping, debugging, and running candidate local AI workloads.
  - engineering question: Which RK3576 dev kit(s) provide the necessary interfaces (MIPI CSI, eMMC, NVMe optional, USB, GPIO), thermal headroom, and toolchain support for P0.3 validation?
  - current assumption(s): RK3576-class SOM is preferred; dev kits are available with 8 GB RAM variants.
  - what must be measured/researched: dev kit specs, available IO (MIPI CSI lanes, USB, SDIO), power consumption under idle and load, thermal throttling, vendor support, bootloader/tooling, price and lead time.
  - acceptance criteria: At least one dev kit selected with documented interfaces and procurement path; bench tests show it can boot Linux and expose required interfaces.
  - required hardware/data: candidate RK3576 dev kits, serial console, power supply, SD card, USB cables.
  - assigned AI/researcher: GROK + PERPLEXITY
  - status: OPEN
  - evidence: KIFAA-SC/research/P0.3-HW-001/
  - result:
  - decision:
  - follow-up actions: Procure selected dev kit(s); run boot + peripheral tests; log outputs.

- P0.3-AI-001
  - date: 2026-08-31
  - author: PERPLEXITY (research) / GROK (integration)
  - assignment-id: P0.3-AI-001
  - objective: Validate feasibility of running Ollama (or alternate local AI runtimes) on RK3576-class hardware.
  - engineering question: Can Ollama or an alternative local LLM runtime run within the memory/CPU constraints of RK3576 dev kit(s) with acceptable latency and without requiring cloud APIs?
  - current assumption(s): Ollama is proposed but UNVERIFIED for RK3576; quantized models may be required.
  - what must be measured/researched: runtime build success, disk and memory usage, swap behavior, inference latency for representative prompts, model size, quantization options, CPU/GPU/NPU utilization if available.
  - acceptance criteria: Successful local runtime of a representative model (small quantized LLM) producing responses with measured latency ≤ interactive threshold (TBD), without crashing under memory constraints. Record exact model and runtime versions.
  - required hardware/data: RK3576 dev kit, representative quantized models (do NOT store binaries in repo; record source URLs and checksums), build logs.
  - assigned AI/researcher: GROK (integration), PERPLEXITY (runtime/method research), DEEPSEEK (adversarial evaluation)
  - status: OPEN
  - evidence: KIFAA-SC/research/P0.3-AI-001/
  - result:
  - decision:
  - follow-up actions: Attempt lightweight model runs, benchmark, and document.

- P0.3-PWR-001
  - date: 2026-08-31
  - author: GROK
  - assignment-id: P0.3-PWR-001
  - objective: System power characterization under idle, calculator-only, and AI workloads.
  - engineering question: What is the system power envelope (mW/W) under representative use cases and what battery capacity is required for target battery life?
  - current assumption(s): Target battery estimate 25–35 Wh (ESTIMATE) but requires validation.
  - what must be measured/researched: idle power, display-on calculator-only, display+AI inference, peak CPU, average over session; power draw of rear modules; charging characteristics.
  - acceptance criteria: Measured power profile for defined scenarios with instrumentation and reproducible methodology; update battery estimate with measured data.
  - required hardware/data: power meter (USB/inline), shunt meter, RK3576 dev kit, load scripts, display simulator.
  - assigned AI/researcher: GROK, COPILOT (recording)
  - status: OPEN
  - evidence: KIFAA-SC/research/P0.3-PWR-001/
  - result:
  - decision:
  - follow-up actions: Define battery sizing based on measured consumption.

- P0.3-SOL-001
  - date: 2026-08-31
  - author: PERPLEXITY + GROK
  - assignment-id: P0.3-SOL-001
  - objective: Evaluate tiled small-cell solar architecture feasibility and expected energy contribution for typical usage patterns.
  - engineering question: How much usable energy can tiled small solar cells provide given Kenyan sunlight profiles and the device form-factor constraints?
  - current assumption(s): Solar is supplemental and not expected to power device fully; proposed tiled layout may provide modest supplemental energy.
  - what must be measured/researched: candidate cell specs, tiling density, open-circuit voltage/short-circuit current per cell, controller options (MPPT vs simple charger), daily energy estimate under realistic conditions.
  - acceptance criteria: A quantified expected daily energy contribution (Wh) for tiled configuration under standard test insolation conditions; feasibility recommendation.
  - required hardware/data: sample small solar cells, solar irradiance data, multimeter, small solar charge controller for testing.
  - assigned AI/researcher: PERPLEXITY (supplier/cell research), GROK (integration test)
  - status: OPEN
  - evidence: KIFAA-SC/research/P0.3-SOL-001/
  - result:
  - decision:
  - follow-up actions: Procure sample cells and run daylight tests.

- P0.3-BAT-001
  - date: 2026-08-31
  - author: GROK
  - assignment-id: P0.3-BAT-001
  - objective: Define removable battery architecture, connector, protection, and hot-plug safety.
  - engineering question: What connector and power-path management are required to safely support removable and potentially stackable battery modules at the target current/voltage?
  - current assumption(s): Magnetic mechanical attachment preferred for UX; stacking is exploratory and unverified.
  - what must be measured/researched: connector ratings, hot-plug protection circuit designs, battery management ICs, thermal behavior, mechanical retention forces.
  - acceptance criteria: A recommended connector and protection topology with reference designs and measured hot-plug safety tests on mockups.
  - required hardware/data: sample connectors, protection IC eval boards, battery modules or mock loads, thermal camera or sensors.
  - assigned AI/researcher: GROK, DEEPSEEK (safety review)
  - status: OPEN
  - evidence: KIFAA-SC/research/P0.3-BAT-001/
  - result:
  - decision:
  - follow-up actions: Build mockup and run hot-plug and thermal tests.

- P0.3-MOD-001
  - date: 2026-08-31
  - author: GROK
  - assignment-id: P0.3-MOD-001
  - objective: Validate magnetic/mechanical attachment mechanisms for rear modules.
  - engineering question: What magnetic retention, alignment, and electrical contact approaches provide reliable mechanical retention and electrical connectivity without causing unsafe conditions?
  - current assumption(s): Magnetic attachment preferred UX, but electrical safety must be engineered.
  - what must be measured/researched: retention force, alignment repeatability, contact resistance over cycles, EMI, risk of shorting, ingress protection.
  - acceptance criteria: Prototype attachment mechanism retains module under drop/use tests and maintains safe electrical contact; documented failure modes.
  - required hardware/data: magnets, test fixtures, force gauge, contact probes, cycle tester.
  - assigned AI/researcher: GROK, DEEPSEEK
  - status: OPEN
  - evidence: KIFAA-SC/research/P0.3-MOD-001/
  - result:
  - decision:
  - follow-up actions: Build mechanical mockups and run drop/cycle testing.

- P0.3-CAM-001
  - date: 2026-08-31
  - author: GROK
  - assignment-id: P0.3-CAM-001
  - objective: Define modular camera/scanner architecture and evaluate interfaces for detachable modules.
  - engineering question: Is exposing MIPI CSI through a detachable connector feasible, or does USB offer a safer tradeoff for durability and compatibility?
  - current assumption(s): MIPI CSI preferred for imaging performance but may be fragile for detachable use.
  - what must be measured/researched: signal integrity for detachable connectors, connector durability, driver/support on RK3576, OCR image quality vs camera module.
  - acceptance criteria: Recommendation for camera interface and prototype demonstrating reliable data transfer and acceptable image quality for OCR.
  - required hardware/data: candidate camera modules, connectors, RK3576 dev kit, test images, OCR pipeline.
  - assigned AI/researcher: GROK, PERPLEXITY
  - status: OPEN
  - evidence: KIFAA-SC/research/P0.3-CAM-001/
  - result:
  - decision:
  - follow-up actions: Prototype camera connector and run OCR tests.

- P0.3-THERM-001
  - date: 2026-08-31
  - author: GROK
  - assignment-id: P0.3-THERM-001
  - objective: Thermal characterization of the device with and without rear modules under representative workloads.
  - engineering question: How do rear modules (battery, camera) affect thermal dissipation and SoC performance? Will passive cooling suffice?
  - current assumption(s): Passive thermal design preferred; must be validated when running local AI workloads.
  - what must be measured/researched: surface and SoC temperatures under idle, calculator-only, and AI workloads; throttling points; thermal coupling to battery modules.
  - acceptance criteria: Thermal model and measured temps within safe operating limits under defined workloads; mitigation plan if not.
  - required hardware/data: thermal camera, thermistors, RK3576 dev kit, workload scripts.
  - assigned AI/researcher: GROK
  - status: OPEN
  - evidence: KIFAA-SC/research/P0.3-THERM-001/
  - result:
  - decision:
  - follow-up actions: Run thermal tests and update enclosure design.

- P0.3-RF-001
  - date: 2026-08-31
  - author: GROK
  - assignment-id: P0.3-RF-001
  - objective: Evaluate RF/LTE interactions with tiled solar cells and rear modules.
  - engineering question: How do rear modules and tiled solar cells affect antenna placements and RF performance? Are isolation/grounding measures needed?
  - current assumption(s): LTE optional; antennas must be placed to minimize interference.
  - what must be measured/researched: antenna S11, radiation patterns, throughput tests with and without modules/cells, shielding/grounding strategies.
  - acceptance criteria: RF plan with recommended antenna placements and mitigation for degraded performance.
  - required hardware/data: RF test equipment (VNA), antennas, RK3576 dev kit with LTE module (if used), anechoic or open-area test site.
  - assigned AI/researcher: GROK, PERPLEXITY
  - status: OPEN
  - evidence: KIFAA-SC/research/P0.3-RF-001/
  - result:
  - decision:
  - follow-up actions: Procure test antennas and run RF tests.

- P0.3-MECH-001
  - date: 2026-08-31
  - author: GROK
  - assignment-id: P0.3-MECH-001
  - objective: Enclosure and mechanical architecture for modular rear attachments and tiled solar cells.
  - engineering question: Can the enclosure be serviceable, drop-resistant, and support modular mounts while integrating tiled solar cells and preserving camera/service access?
  - current assumption(s): 3D-printed prototypes acceptable; production may move to injection molding.
  - what must be measured/researched: drop tests, serviceability studies, CAD tolerance for module fit, material choices, attachment hardware.
  - acceptance criteria: Prototype enclosure passes drop and fit tests; assembly/disassembly documented.
  - required hardware/data: 3D-printed prototypes, CAD files, drop-test rig or procedure.
  - assigned AI/researcher: GROK, DEEPSEEK
  - status: OPEN
  - evidence: KIFAA-SC/research/P0.3-MECH-001/
  - result:
  - decision:
  - follow-up actions: Produce prototypes and run mechanical tests.

---

Guidance: As experiments progress, record raw logs, commands, output, and precise timestamps in the evidence folder. For AI-generated reports, include model name/version, prompt, date, and exact claims. Do not store model binaries or secrets in the repository.
