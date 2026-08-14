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

## Initial control flow

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
CAPABILITY ENVELOPE (PIE)
  ↓
CAR / deterministic policy
  ↓
AUTHORIZATION
  ↓
ACTION
  ↓
RESULT ATTESTATION
  ↓
PROVENANCE GRAPH
  ↺
```

## Phase 1 modules

- `src/identity/agentIdentity.ts` — explicit agent identity, role, scopes, tools, capabilities, expiry.
- `src/pie/capabilityEnvelope.ts` — bounded action request with evidence, confidence, blast-radius limits, approvals, expiry, and rollback.
- `src/trust/provenanceGraph.ts` — dependency graph for evidence-to-action traceability and downstream impact analysis.
- `src/ooda/shadow.ts` — independent, non-executing comparison of hypotheses and expected effects.

## Next build targets

1. Cryptographic signing and verification for AgentIdentity and CapabilityEnvelope.
2. Deterministic policy evaluator between CapabilityEnvelope and CAR.
3. Provenance source attestations and trust decay/revocation.
4. Shadow-OODA runtime orchestration with independent model/provider separation.
5. Digital-twin simulation before high-impact CAR execution.
6. Result attestation, rollback hooks, and capability revocation.
7. Adversarial tests for prompt injection, poisoned memory, compromised tools, and colluding agents.

## Standards direction

This architecture is intentionally compatible with emerging agent-security work around identity, authorization, least privilege, structured action schemas, signed inter-agent communication, observability, and human approval for high-impact actions. It does not claim compliance with a particular standard until those controls are implemented and tested.
