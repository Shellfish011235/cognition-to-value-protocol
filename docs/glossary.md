# Glossary

## Protocol Components

### CAR (Compute / Validate / Attest / Route)
The deterministic execution gate. Contains no AI/ML components. Responsible for pathfinding, validation, cryptographic attestation, and ledger submission.

### FEYNMAN (Explain / Simplify / Test / Reject)
The epistemic layer responsible for truth compression and hallucination defense. Named after Richard Feynman's principle that if you can't explain something simply, you don't understand it.

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
Cryptographic proof that a validation has occurred. In CAR, attestation confirms that an envelope has passed all checks.

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
