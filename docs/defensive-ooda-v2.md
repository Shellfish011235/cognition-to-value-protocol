# Defensive OODA v2

Defensive OODA v2 extends the Cognition-to-Value Protocol from guarded cognition-to-execution into a zero-trust agent control plane.

## Security invariants

1. **No anonymous authority.** Every acting agent must have an identity with an owner, role, public key, scopes, capabilities, and expiry.
2. **No broad authority by default.** Agents request bounded capabilities for a specific target, action, impact, lifetime, and tool set.
3. **No untraceable evidence.** Observations, evidence, hypotheses, decisions, policies, actions, and results are linked in a provenance graph.
4. **No single-loop certainty.** A Shadow OODA loop may independently predict outcomes and challenge the primary loop without execution rights.
5. **No probabilistic authorization.** LLM/model output can propose; deterministic policy and CAR remain responsible for enforcement.
6. **No irreversible action without rollback planning.** Capability envelopes require an explicit rollback procedure and can require human approvals.
7. **No stale authority.** Agent identities and capability intents expire.
8. **No unsigned authority.** Capability requests are cryptographically signed and verified against the acting agent identity.
9. **No silent trust recovery.** Revoked sources and their downstream dependent nodes remain revoked until explicitly re-established through a new trusted path.

## Current control flow

```text
OBSERVE
  ↓
VERIFY / PROVENANCE
  ↓
ORIENT
  ↓
PRIMARY OODA ───────┐
                    ├─ compare / challenge
SHADOW OODA ────────┘
  ↓
FEYNMAN
  ↓
SIGNED CAPABILITY ENVELOPE (PIE)
  ↓
DETERMINISTIC POLICY ENGINE
  ├─ ALLOW
  ├─ DENY
  ├─ REQUIRE_HUMAN
  └─ SIMULATE_FIRST
  ↓
CAR
  ↓
AUTHORIZATION
  ↓
ACTION
  ↓
RESULT ATTESTATION
  ↓
PROVENANCE / TRUST GRAPH
  ↺
```

## Implemented modules

- `src/identity/agentIdentity.ts` — explicit agent identity, role, scopes, tools, capabilities, expiry.
- `src/pie/capabilityEnvelope.ts` — bounded action request with evidence, confidence, blast-radius limits, approvals, expiry, and rollback.
- `src/security/signatures.ts` — Ed25519 signing and verification for capability requests using canonicalized payloads.
- `src/policy/policyEngine.ts` — deterministic fail-closed authorization returning only `ALLOW`, `DENY`, `REQUIRE_HUMAN`, or `SIMULATE_FIRST`.
- `src/trust/provenanceGraph.ts` — dependency graph for evidence-to-action traceability, downstream impact analysis, and revocation propagation.
- `src/ooda/shadow.ts` — independent, non-executing comparison of hypotheses and expected effects.

## Policy gate checks

The deterministic policy engine currently checks:

- agent identity active/not expired
- agent/requester/signer identity match
- agent and intent revocation state
- capability envelope expiry
- Ed25519 signature validity
- requested action within agent capability profile
- requested tools within agent tool allowlist
- explicit prohibited-action conflicts
- Shadow OODA divergence
- high-impact action patterns requiring human review
- broader blast-radius patterns requiring simulation first
- additional approval requirements

Any hard authorization failure returns `DENY`.

## Trust revocation behavior

If a source, agent, tool, evidence item, or other trust node is later determined compromised, the graph can revoke that node and propagate revocation through all downstream dependents. For example:

```text
SOURCE REVOKED
  ↓
EVIDENCE REVOKED
  ↓
HYPOTHESIS REVOKED
  ↓
DECISION REVOKED
  ↓
PENDING ACTION REVOKED
```

Unrelated branches of the graph remain unaffected.

## Test posture

The scoped Defensive OODA CI validates the v2 modules independently of known pre-existing repository-wide TypeScript debt. Tests include normal behavior plus fail-closed cases for signature tampering, revoked authority, expired authority, tool overreach, Shadow OODA disagreement, simulation-required blast radius, and poisoned-source revocation propagation.

## Next build targets

1. Replay protection using nonce/sequence and one-time intent consumption.
2. Split-action / cumulative-impact limits so agents cannot evade caps by dividing one prohibited action into many smaller requests.
3. Provenance source attestations and trust decay beyond binary revocation.
4. Independent Shadow-OODA runtime orchestration with model/provider separation.
5. Digital-twin simulation before high-impact CAR execution.
6. Result attestation, rollback hooks, and capability revocation after execution.
7. Deception controls: canary credentials, honey resources, decoy providers/endpoints, and instrumented synthetic assets.
8. Multi-agent collusion and compromised-tool adversarial tests.

## Standards direction

This architecture is intentionally compatible with emerging agent-security work around identity, authorization, least privilege, structured action schemas, signed inter-agent communication, observability, and human approval for high-impact actions. It does not claim compliance with a particular standard until those controls are implemented and tested.
