# Glossary

Concept terminology updated October 8, 2026. Definitions describe architectural roles; they do not certify the scaffold's implementation. See [current limitations](../README.md#repository-limitations-that-matter).

## Protocol Components

### CAR (Compute / Validate / Attest / Route)
The deterministic execution gate. Its enforcement decisions are deterministic rather than AI/ML judgments. Responsible for route computation, validation, artifact attestation and permitted adapter routing. Actual settlement requires its own authority and implementation.

### FEYNMAN (Explain / Simplify / Test / Reject)
The evidence and explanation layer responsible for making claims understandable, testing them against sources and rejecting unsupported assertions. Explainability does not guarantee truth or eliminate hallucinations. Named after Richard Feynman's principle that if you can't explain something simply, you don't understand it.

### ILP (Interledger Protocol)
An open protocol for payments across different payment networks.

### LEAR (Learn / Evaluate / Adapt / Reinforce)
The adaptive intelligence layer. Adjusts decision logic over time while respecting enforcement boundaries.

### OODA (Observe / Orient / Decide / Act)
The perception control loop. Observes conditions, orients context, decides on proposals, and suggests actions. Originally developed by military strategist John Boyd.

### PIE (Payment Intent Envelope)
A formal contract between cognition and execution. Contains bounded intent with explicit constraints, risk bounds, and required proofs.

### XRPL (XRP Ledger)
A decentralized public blockchain built for payments.

---

## Technical Terms

### Attestation
A signed statement bound to an artifact. Verification can establish who signed which data, subject to the cryptographic implementation and key trust. It does not independently prove the statement is true, establish wallet authority or replace outcome verification. The current scaffold's cryptography is placeholder code.

### Bounded Intent
A transaction proposal with explicit limits on amount, slippage, fees, and expiry. Contrast with unbounded/open-ended actions.

### Deterministic Execution
Execution that produces the same output given the same input. No randomness or AI inference.

### Envelope
See PIE. A structured container for payment intent.

### Hallucination
In AI context, the generation of false or fabricated information by a language model.

### Invariant
A condition that must always be true. Protocol invariants are non-negotiable safety requirements.

### Layer Integrity
The principle that no layer in the stack may be bypassed. All data must flow through the complete pipeline.

---

## Safety Terms

### Fail Closed
A safety principle where any error or uncertainty results in rejection rather than proceeding.

### Goal Drift
The gradual deviation of an adaptive system from its original objectives.

### Human Override
The ability for a human operator to halt any automated operation immediately.

### Threat Model
A structured analysis of potential attacks and their mitigations.

---

## Implementation Terms

### HSM (Hardware Security Module)
A physical device for managing cryptographic keys securely.

### Schema
A formal definition of data structure. PIE schema defines valid envelope format.

### Stub
A minimal implementation that satisfies an interface without full functionality. Used during development.

---

## Extended Operating Terms

### Execution Grant
A separately issued authorization artifact for an exact operation, scope and time window. A route quote or intent envelope is not a grant. The related Wave implementation uses HMAC-signed grants; that is not a wallet signature or independent public-key attestation.

### Route Receipt
A record binding the selected route/provider and decision inputs. Integrity binding does not grant permission or prove execution.

### Outcome Verification
Comparing observed results against the exact authorized intent. Simulated accounting, an executor receipt and validated ledger settlement support different claims.

### Provenance
Source, revision, time, actor and artifact relationships that allow a decision and its outcome to be traced. Provenance does not by itself establish truth.

### Integration Spine
The current reusable integration work connecting the Shellfish gateway, Wave Router and Control Room operator surface. Local candidates and their verification remain separate from public default-branch release readiness.

### Coordination Whiteboard
A human-readable view of assignments, evidence packets and reviews. It is not an authoritative ownership lease, durable scheduler or proof of a persistent running agent.

## Acronyms Reference

| Acronym | Full Name |
|---------|-----------|
| CAR | Compute / Validate / Attest / Route |
| FEYNMAN | Explain / Simplify / Test / Reject |
| ILP | Interledger Protocol |
| LEAR | Learn / Evaluate / Adapt / Reinforce |
| LLM | Large Language Model |
| OODA | Observe / Orient / Decide / Act |
| PIE | Payment Intent Envelope |
| XRPL | XRP Ledger |
| ZK | Zero Knowledge (proofs) |
