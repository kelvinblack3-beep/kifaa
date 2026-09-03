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
