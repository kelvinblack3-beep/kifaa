# KIFAA-SC — HARDWARE_BASELINE

Purpose: record current hardware baselines, measured results, and the provenance of each claim (measured vs estimate).

Known baseline (2026-08-31):

- Compute: RK3576-class System-on-Module (preferred prototype/production direction)
  - status: PROPOSED
  - provenance: project baseline

- RAM: 8 GB target
  - status: PROPOSED
  - provenance: project baseline
  - note: A prior adversarial/historical analysis assumed 4 GB; that analysis is preserved only as historical input and is not used as baseline.

- Storage: 128 GB eMMC + optional microSD
  - status: PROPOSED
  - provenance: project baseline

- Display: 5.5-inch high-brightness IPS preferred
  - status: PROPOSED
  - provenance: project baseline

- Camera: modular 5–8 MP MIPI CSI target
  - status: PROPOSED
  - provenance: project baseline

- Battery: target 25–35 Wh (estimate)
  - status: ESTIMATE
  - provenance: project baseline — requires validation via battery-life testing

- Thermal: passive thermal design preferred
  - status: PROPOSED

- Low-power calculator MCU: dedicated MCU preferred for deterministic calculator functions
  - status: PROPOSED

- Connectivity: LTE optional; offline-first baseline
  - status: PROPOSED

- Security: hardware security and secure update architecture require further verification
  - status: OPEN

- Exam mode security: requires substantial further investigation before any claim of security
  - status: OPEN

---

Record measured values and test results here. Label each claim with provenance: VERIFIED (measured), ESTIMATE, ASSUMPTION, or UNVERIFIED.
