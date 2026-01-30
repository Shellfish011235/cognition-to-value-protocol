# PQC Readiness (Judgment Stack / C2V-OS)

## What We Mean by "Post-Quantum Ready"

We treat PQC as a **cryptographic suite upgrade**, not a redesign.

- Protocol safety is enforced by invariants (OODA/LEAR/FEYNMAN/PIE/CAR)
- Cryptography is an enforcement mechanism inside **CAR.Attest** and related proofs
- The ledger may remain classical while we add **off-ledger PQC attestations** now

---

## Where PQC Lives in the Protocol

### PIE (Intent Layer)

Add crypto requirements as constraints, not as "maybe":

```typescript
{
  requiredProofs: ["pqc_attestation:v1"],
  cryptoPolicy: "HYBRID_SIG_ECDSA_PLUS_DILITHIUM",
  keyEpoch: 1,
  expiry: 1735689600,
  rotationClass: "CRITICAL"
}
```

### CAR (Enforcement Layer)

PQC lives here in **Attest** (signing) and optionally key establishment:

| Algorithm Type | Options |
|---------------|---------|
| **Signatures** | Dilithium / Falcon / SPHINCS+ |
| **KEM / Key Exchange** | Kyber |
| **Hybrid Mode** | Classical + PQC together (recommended) |

**The key:** CAR stays non-thinking. PQC is pure deterministic crypto inside CAR.

### Ledger Layer (XRPL Reality)

XRPL mainnet signature schemes are a ledger-level rule. If XRPL doesn't natively accept PQC signatures today, you still can:

1. Use PQC signatures for **off-ledger attestations** (CAR signs PIE + validation proof)
2. **Anchor** the attestation hash on-ledger (existing tx types)
3. Deploy PQC tx auth on a **sidechain / controlled domain / middleware** while waiting for on-ledger support

This gets you "quantum-ready" now without waiting for protocol changes.

---

## What D-Wave Does for PQC

D-Wave helps with **optimization problems around PQC**, not the crypto math itself.

### Use D-Wave For (High Leverage, Real Fit)

| Use Case | Description |
|----------|-------------|
| **Hybrid key rotation scheduling** | Inputs: wallets/validators/services, risk tier, uptime windows, compliance constraints. Output: rotation plan that minimizes downtime + risk exposure |
| **Attestation batching & timing** | Choose when to batch PIE attestations (Merkle batches) to minimize cost/latency and maximize auditability |
| **Trust graph hardening** | Optimize which signers/attestors are required per action (multi-sig style policy) under constraints |
| **Corridor / route constraints** | Not "pathfinding" itself — but optimizing policy constraints: which corridors are allowed under risk and compliance bounds |

All of these are classic **constrained optimization / scheduling problems** — exactly the domain Ocean/hybrid solvers are made for.

---

## Implementation Blueprint (Minimal, Practical)

### Step 1 — Add PQC Policy to PIE

Add fields to Payment Intent Envelope:
- `cryptoPolicy`
- `requiredProofs`
- `attestationSuite`
- `keyEpoch`

### Step 2 — Implement CAR.Attest with Hybrid Signatures

CAR produces:

```
envelope_hash = SHA3-256(PIE)
sig_classical = ECDSA(secp256k1) or Ed25519
sig_pqc = Dilithium(envelope_hash) or Falcon
```

Store both in an attestation object, optionally anchor `hash(attestation)` on XRPL.

**You're now quantum-resistant at the control plane**, even if XRPL tx auth stays classical for now.

### Step 3 — Use D-Wave to Optimize "Crypto Operations"

Formulate as:
- **Binary decision vars:** rotate now vs later, include signer A vs B, batch size choices
- **Constraints:** expiry, uptime, max risk, max batch latency
- **Objective:** min downtime + min exposure + min cost

Ocean/hybrid solvers handle that workflow.

---

## Migration Strategy

```
Phase 1: Start hybrid attestations (classical + PQC) off-ledger
    ↓
Phase 2: Anchor commitments on-ledger (optional)
    ↓
Phase 3: Adopt on-ledger PQC when the settlement layer supports it
```

---

## NIST PQC Algorithms Reference

| Algorithm | Type | Use Case | Status |
|-----------|------|----------|--------|
| **Dilithium** | Signature | Primary recommendation | NIST standardized |
| **Falcon** | Signature | Smaller signatures | NIST standardized |
| **SPHINCS+** | Signature | Hash-based (conservative) | NIST standardized |
| **Kyber** | KEM | Key encapsulation | NIST standardized |

---

## Hard Invariants (Do Not Break)

1. **CAR must never call an LLM**
2. **PIE must require explicit crypto policy + proofs for PQC modes**
3. **D-Wave optimizer must never be on the execution path (CAR)**; it is planning/ops support
4. **Attestations must be deterministic and auditable**

---

## Feynman-Clean Summary

> **PQC** = NIST algorithms (Dilithium/Falcon/Kyber/SPHINCS+), implemented classically.
>
> **D-Wave** ≠ PQC crypto engine.
>
> **D-Wave** = optimizer for the migration + scheduling + batching + trust-policy problems around PQC.
>
> In our stack: **PQC lives in CAR.Attest + PIE constraints**, and can be anchored to XRPL today.

---

## File Structure

```
src/
├── security/
│   └── pqc/
│       ├── policy.ts          # Crypto policy types
│       ├── attestation.ts     # Attestation record types
│       └── hashes.ts          # SHA3-256, commitment hashes
├── pie/
│   └── pie.crypto.ts          # PIE crypto policy fields
├── car/
│   └── attest/
│       ├── index.ts           # Attestor factory
│       ├── types.ts           # Input/output types
│       └── suites/
│           ├── hybrid-ed25519-dilithium.ts
│           └── hybrid-ecdsa-dilithium.ts
├── optimizers/
│   └── dwave/
│       ├── model.ts           # Rotation scheduling model
│       ├── adapter.ts         # Optimizer adapters
│       └── rotation.optimizer.ts
└── utils/
    └── time.ts                # Time utilities
```
