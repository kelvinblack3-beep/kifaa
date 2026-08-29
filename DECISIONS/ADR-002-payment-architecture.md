# ADR-002: Payment architecture

Decision ID: ADR-002
Date: 2026-08-29
Status: provisional

Decision
- Adopt provider-adapter architecture: Transaction Engine -> Router -> Provider Adapter -> Provider
- Provider adapters are the only place for provider-specific money-moving logic.

Reason
- Keeps core platform provider-neutral and reduces regulatory footprint.

Consequences
- Implement sandbox/production gating at adapter level.
- Use ADRs for changes that affect provider responsibilities or custody boundaries.
