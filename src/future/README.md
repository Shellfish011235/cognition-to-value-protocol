# Future / Roadmap Implementations

> **STATUS: NOT ACTIVE**  
> This code is preserved for future implementation when dependencies are ready.

---

## What's Here

This folder contains **roadmap implementations** that are architecturally designed but **not yet activated** in the main protocol.

| Module | Waiting For | Purpose |
|--------|-------------|---------|
| `security/pqc/` | XRPL PQC signature support | Post-quantum cryptography policy types |
| `attest/` | XRPL PQC signature support | Hybrid attestation suites (classical + Dilithium) |
| `optimizers/dwave/` | D-Wave Ocean access | Key rotation scheduling optimization |
| `pie.crypto.ts` | PQC activation | Crypto policy fields for PIE |
| `time.ts` | General utility | Time helpers (can be activated anytime) |

---

## Why Not Active?

### PQC (Post-Quantum Cryptography)
- **XRPL does not yet support PQC signatures on-ledger**
- When XRPL adds PQC support, move these modules to `src/` and wire them in
- See `docs/pqc-readiness.md` for the full implementation roadmap

### D-Wave Optimizer
- Requires D-Wave Ocean account and hybrid solver access
- Useful for key rotation scheduling at scale
- Can be activated independently when needed

---

## How to Activate

When XRPL announces PQC support:

1. Move `security/pqc/` → `src/security/pqc/`
2. Move `attest/` → `src/car/attest/`
3. Move `pie.crypto.ts` → `src/pie/pie.crypto.ts`
4. Update `src/index.ts` to export new modules
5. Replace placeholder signing functions with real implementations
6. Test against XRPL testnet first

---

## Hard Invariants (Preserved)

Even when activated, these invariants must hold:

1. **CAR must never call an LLM** - PQC is pure deterministic crypto
2. **PIE must require explicit crypto policy** - No implicit defaults
3. **D-Wave optimizer must never be on CAR execution path** - Planning only
4. **Attestations must be deterministic and auditable**

---

## Timeline Triggers

Watch for these announcements:
- [ ] XRPL Amendment: PQC signature scheme support
- [ ] rippled release with Dilithium/Falcon/Kyber
- [ ] XRPL testnet PQC testing phase

When any of these happen, circle back here.
