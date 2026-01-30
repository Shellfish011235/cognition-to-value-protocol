# Protocol Invariants

## Core Invariants

These invariants MUST be maintained at all times. Violation of any invariant is a critical failure.

---

## OODA Invariants

### INV-OODA-001: Proposal Only
```
OODA.act() → ProposedAction | null
OODA.act() ↛ ExecutedAction
```
OODA may propose actions. It may **never** execute them directly.

### INV-OODA-002: No State Mutation
OODA operations must not mutate financial state. Read-only observation only.

---

## LEAR Invariants

### INV-LEAR-001: Meta-Learning Only
```
LEAR.adapt() → DecisionParameters
LEAR.adapt() ↛ EnforcementRules
```
LEAR may adjust *how* decisions are made. It may **never** change *what* is enforced.

### INV-LEAR-002: Bounded Adaptation
All LEAR adaptations must remain within predefined bounds. No unbounded drift.

---

## FEYNMAN Invariants

### INV-FEYN-001: Explainability Gate
```
if (!FEYNMAN.canExplain(action)) {
  return REJECT;
}
```
Any action that cannot be clearly explained MUST be rejected.

### INV-FEYN-002: Hallucination Defense
All claims must be verifiable against source data. No fabricated justifications.

### INV-FEYN-003: Compression Requirement
Explanations must be human-readable and concise (Feynman standard).

---

## PIE Invariants

### INV-PIE-001: Bounded Intent
```
interface PIE {
  constraints: Required<Constraints>;
  riskBounds: Required<RiskBounds>;
  expiry: number; // REQUIRED
}
```
All payment intents MUST have explicit bounds. No open-ended actions.

### INV-PIE-002: Immutability
Once created, a PIE envelope may not be modified. Create new envelope instead.

### INV-PIE-003: Audit Trail
All PIE envelopes must be logged with full provenance.

---

## CAR Invariants

### INV-CAR-001: No Intelligence
```
CAR.compute() // pathfinding only
CAR.validate() // rule checks only
CAR.attest() // crypto only
CAR.route() // submission only
```
CAR contains **zero** AI/ML/LLM components. Pure deterministic execution.

### INV-CAR-002: Fail Closed
On any validation failure, CAR MUST reject. Never proceed on uncertainty.

### INV-CAR-003: Attestation Required
No envelope may be routed without cryptographic attestation.

### INV-CAR-004: Human Override
Human override signal MUST be able to halt any CAR operation immediately.

---

## Cross-Cutting Invariants

### INV-GLOBAL-001: Layer Integrity
No layer may be bypassed. All data flows through the full stack.

### INV-GLOBAL-002: Audit Everything
Every state transition must be logged with timestamp, actor, and rationale.

### INV-GLOBAL-003: Fail Safe
On any unhandled error, the system MUST halt, not proceed.

---

## Verification

Each invariant should have:
1. Unit tests
2. Integration tests
3. Runtime assertions
4. Audit logging
