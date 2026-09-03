- DEC-003: Modular Rear Architecture
  - title: Modular Rear Architecture
  - description: Define a smartphone-inspired modular rear architecture for KIFAA-SC that preserves a calculator-first front interface while enabling attachable/removable modules (battery, camera/scanner, solar, etc.).
  - rationale: Modular accessories allow the core calculator to remain compact and power-efficient while enabling optional higher-power, higher-functionality modules for scanning, battery extension, and other capabilities.
  - status: PROPOSED
  - author: memory gate
  - date: 2026-08-31
  - references: KIFAA-SC/HARDWARE_BASELINE.md, KIFAA-SC/PROJECT_MEMORY.md

- DEC-004: Mobile-First Software Platform / Hardware Deferred
  - title: Mobile-First Software Platform / Hardware Deferred
  - description: Record the mobile-first pivot for the KIFAA-SC project and defer dedicated hardware to Phase 2. Phase 1 will be delivered as a smartphone application (SHARP BOYZ MOBILE). Hardware research remains preserved as historical research and future work.
  - decision:
    1. KIFAA-SC Phase 1 is a smartphone application.
    2. The original educational-computing/calculator concept remains the product vision.
    3. The smartphone replaces the custom calculator hardware as the initial execution platform.
    4. Custom calculator hardware is deferred to Phase 2.
    5. Phase-2 hardware requirements must be derived from measured Phase-1 software workloads.
    6. Previous RK3576 research is retained as historical research and future hardware research, but RK3576 is NOT the current deployment target.
    7. Existing hardware research must NOT be deleted.
    8. Historical findings must retain provenance and status.
    9. The mobile application should be architected so that important KIFAA functionality can later be ported to dedicated hardware.
  - status: LOCKED
  - author: memory gate
  - date: 2026-09-03
  - references: KIFAA-SC/PROJECT_MEMORY.md, KIFAA-SC/SOFTWARE_BASELINE.md, KIFAA-SC/RESEARCH_LOG.md

- DEC-005: Project/Product Name Change to SHARP BOYZ
  - title: Project/Product Name Change to SHARP BOYZ
  - description: Change the public project/product name from KIFAA-SC to SHARP BOYZ for all new mobile-first development. Preserve the KIFAA-SC directory and historical research; perform any directory rename as a controlled migration later.
  - decision:
    - The active product name is now: SHARP BOYZ
    - Historical/internal name: KIFAA-SC (preserved)
    - New naming conventions:
      * SHARP BOYZ MOBILE — mobile application Phase 1
      * SHARP BOYZ HARDWARE — future dedicated hardware program (Phase 2)
      * SHARP BOYZ CORE — portable shared software/core layer
    - Preserve all historical KIFAA-SC research and provenance; do NOT delete KIFAA-SC artifacts.
    - Update current-facing documentation to identify the active product as SHARP BOYZ; leave the KIFAA-SC/ directory in place until a controlled migration.
  - status: LOCKED
  - author: memory gate
  - date: 2026-09-03
  - references: KIFAA-SC/PROJECT_MEMORY.md, KIFAA-SC/RESEARCH_LOG.md

- DEC-006: SHARP BOYZ as Kenyan Education Intelligence Platform
  - title: SHARP BOYZ as Kenyan Education Intelligence Platform
  - description: Define SHARP BOYZ as a Kenyan Education Intelligence Platform rather than a narrow KCSE past-paper, prediction, notes, or chatbot application.
  - decision:
    - SHARP BOYZ combines Exam Mastery and Knowledge Mastery.
    - Exam Mastery includes diagnostics, past questions, performance analysis, probabilistic prediction, revision prioritisation, and exam technique.
    - Knowledge Mastery includes concepts, real-life applications, Kenyan examples, careers, projects, critical thinking, problem solving, and cross-subject connections.
    - Core product objective: help a student understand what they are learning, why it matters, where it is used in real life, how well they understand it, and what they should learn next.
    - The platform is not limited to past papers, prediction, notes libraries, or a generic AI chatbot.
  - rationale: A platform framing prevents reduction of the product to a single feature and anchors product decisions around student understanding and next-step guidance.
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - references: KIFAA-SC/PROJECT_MEMORY.md; multi-AI research and reconciliation workflow accepted by project lead

- DEC-007: Legacy KCSE and Current CBE/Senior School Context Separation
  - title: Legacy KCSE and Current CBE/Senior School Context Separation
  - description: Require explicit separation of educational contexts so historical and current curriculum data are not mixed blindly.
  - decision:
    - Architecture must distinguish at minimum:
      * legacy Form 1–4 / KCSE context
      * current Competency-Based Education / Senior School / Grade 10–12 context
    - Historical KCSE material must retain its educational context and provenance.
    - Current curriculum material must be versioned and context-aware.
    - Datasets, question banks, and retrieval paths must not treat legacy and current contexts as interchangeable without explicit mapping.
  - rationale: Kenya’s education system is transitioning; mixing legacy KCSE and current CBE/Senior School data without context would produce incorrect guidance and corrupt evidence models.
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - references: KIFAA-SC/PROJECT_MEMORY.md; multi-AI research and reconciliation workflow accepted by project lead

- DEC-008: Grounded and Versioned Educational Retrieval
  - title: Grounded and Versioned Educational Retrieval
  - description: Treat educational content as versioned, grounded source material rather than as undifferentiated training fuel for generative models.
  - decision:
    - Curriculum and educational source material should carry source provenance, version/context, and retrieval/grounding metadata where applicable.
    - Authoritative source material must remain distinct from generated explanation.
    - SHARP BOYZ must not rely on an uncontrolled concept of “training an AI on curriculum PDFs.”
    - Generated explanations may paraphrase or teach, but must not silently replace authoritative curriculum facts.
  - rationale: Grounding and versioning protect students from fabricated curriculum claims and support auditability of educational guidance.
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - references: KIFAA-SC/PROJECT_MEMORY.md; multi-AI research and reconciliation workflow accepted by project lead

- DEC-009: Real-Life Application as Core Product Capability
  - title: Real-Life Application as Core Product Capability
  - description: Establish real-life application as a core SHARP BOYZ capability, not a decorative feature.
  - decision:
    - The platform should connect concept → real problem → Kenyan example → career relevance → practical challenge.
    - Real-life application supports Knowledge Mastery and answers “Why does this matter?”
    - Kenyan examples and practical relevance are first-class product concerns, not optional extras.
  - rationale: Students need to see relevance beyond examinations; real-life linkage strengthens understanding and motivation without replacing rigorous assessment.
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - references: KIFAA-SC/PROJECT_MEMORY.md; multi-AI research and reconciliation workflow accepted by project lead

- DEC-010: KCSE Prediction Is Probabilistic Revision Guidance
  - title: KCSE Prediction Is Probabilistic Revision Guidance
  - description: Define prediction as transparent, probabilistic revision guidance rather than certainty about future examination content.
  - decision:
    - Prediction must never be represented as certainty.
    - Prediction helps determine likely areas to prioritise, revision importance, historical patterns, and study allocation.
    - Uncertainty must be communicated appropriately.
    - Historical frequencies/probabilities must come from verified data.
    - Demo values must never be presented as real KCSE statistics.
  - rationale: Students under exam pressure are vulnerable to false certainty; honest probabilistic framing protects trust and supports better revision decisions.
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - references: KIFAA-SC/PROJECT_MEMORY.md; multi-AI research and reconciliation workflow accepted by project lead

- DEC-011: Student Intelligence Requires Accumulated Evidence
  - title: Student Intelligence Requires Accumulated Evidence
  - description: Require student mastery and weakness judgements to be based on accumulated evidence over time, not single answers.
  - decision:
    - A student’s ability must not be defined from one mistake or isolated response.
    - The student model should eventually accumulate evidence such as subject, topic, subtopic, question type, attempts, correctness, time, hint usage, error type, confidence, timestamps, and repeated performance.
    - Exact schema and algorithms may evolve; the accumulated-evidence principle is locked.
  - rationale: Single-item judgements are noisy and can demoralise or mislead; evidence over time supports fairer diagnosis and better prioritisation.
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - references: KIFAA-SC/PROJECT_MEMORY.md; multi-AI research and reconciliation workflow accepted by project lead

- DEC-012: AI Explains and Coaches; Deterministic Systems Remain Authoritative
  - title: AI Explains and Coaches; Deterministic Systems Remain Authoritative
  - description: Separate AI coaching responsibilities from authoritative deterministic calculations.
  - decision:
    - AI may explain, tutor, contextualise, supply real-life examples, coach, and personalise guidance.
    - Deterministic systems remain authoritative for scoring, calculations, curriculum mapping, performance calculations, prediction calculations, and revision-priority calculations.
    - AI must not fabricate mastery scores, curriculum facts, historical statistics, prediction probabilities, sources, or student performance evidence.
  - rationale: Deterministic authority preserves auditability and prevents fabricated educational metrics; AI remains valuable for explanation and coaching without becoming the source of truth for scores or statistics.
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - references: KIFAA-SC/PROJECT_MEMORY.md; multi-AI research and reconciliation workflow accepted by project lead

- DEC-013: Offline-First Core with Online AI Enhancement
  - title: Offline-First Core with Online AI Enhancement
  - description: Keep core educational functionality useful offline where practical, while allowing online connectivity to enhance AI and sync capabilities.
  - decision:
    - Core educational experience should remain useful offline where technically practical.
    - Online connectivity should enhance AI tutoring, synchronisation, remote content, and cloud services.
    - Architecture should avoid making basic learning functionality unnecessarily dependent on constant internet connectivity.
  - rationale: Kenyan secondary students often face intermittent or expensive connectivity; offline-useful core learning protects educational value under real device and network constraints.
  - status: LOCKED
  - author: project lead / memory gate
  - date: 2026-09-03
  - references: KIFAA-SC/PROJECT_MEMORY.md; multi-AI research and reconciliation workflow accepted by project lead
