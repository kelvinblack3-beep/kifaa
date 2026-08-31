# KIFAA-SC — OPEN_QUESTIONS

Open questions and research items to prioritize. All entries here are status: OPEN until resolved via experiment, supplier data, or authoritative analysis.

- What exact commercial small solar cells (dimensions, voltage/current, wattage) can physically fit into the rear enclosure and how many can be tiled?
- What electrical topology (series/parallel mixing, MPPT or simple controller, bypass diodes) gives the best solar harvesting for the tiled layout on a small-area rear surface?
- Can magnetic attachment coexist safely with high-current battery transfer? What isolation and design patterns are required to make this safe?
- What connector should be used for removable battery modules (mechanical durability, current rating, hot-plug safety, keyed alignment)?
- Can battery modules be safely stacked (electrical/thermal/mechanical implications)? If stacking is allowed, what protections and sequencing are required?
- Should the device include an internal battery plus external reserve battery modules, or should it be external-only for energy extension?
- What magnetic/mechanical attachment force and retention mechanisms are required to keep modules secure under drop and use conditions?
- How should the camera module communicate with the main SoC? Is exposing MIPI CSI through a detachable connector feasible and safe, or is USB a better pragmatic tradeoff?
- Can MIPI CSI be exposed safely through a detachable module without risking signal integrity or connector fragility? What mechanical routing/connector solutions exist?
- What is the maximum practical rear solar area given enclosure constraints, camera placement, and module zones?
- How does the tiled-solar architecture affect LTE and other RF antenna performance? Where should antennas be located relative to modules and cells?
- What happens thermally when the rear is covered by a battery module (heat trapping)? How does that affect SoC throttling and user comfort?
- Can the enclosure remain serviceable (access to screws, modular replacement) and drop-resistant while supporting modular rear attachments and tiled solar cells?
- What is the safest architecture for battery hot-plugging (fuse, pre-charge resistor, hot-swap controller, power-path management)?
- What are the supplier availability, cost, and MOQ for candidate RK3576 SOMs and camera modules suitable for prototypes and small runs?
- What are the preferred test/dev kits for RK3576 we should acquire for P0.3 validation?
- What is the best instrumentation method to measure per-module power draw, temperature, and RF impact during integration tests?

Status: OPEN

(Each question should be tracked in RESEARCH_LOG.md with a plan and acceptance criteria. When experiments or supplier data resolve a question, mark the question as CLOSED or SUPERSEDED and record the provenance.)
