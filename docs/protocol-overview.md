# Protocol Overview

## Cognition-to-Value: concept checkpoint, October 8, 2026

C2V is an experimental architecture for transforming observations and evidence into explainable proposals, bounded actions and traceable outcomes. Financial value movement is a possible downstream use. Research, verified artifacts, route quotes and human-reviewed intents are also useful outcomes.

This document describes the wider concept and how related work fits it. It does not assert that every capability is implemented in this TypeScript template, change its APIs, or authorize financial execution.

## Three implementation scopes

| Scope | What belongs here | How to interpret it |
|---|---|---|
| Protocol specification | Responsibilities, contracts and required invariants | Requirements to implement and verify, not proof of enforcement |
| Reference scaffold | The TypeScript modules in this repository | Inspect actual behavior; crypto and settlement paths remain incomplete |
| Related implementations | Shellfish evidence/assurance work, Wave routing, Control Room and local Integration Spine candidates | Separate repositories/branches with separate checks and authority boundaries |

The concept is broader than a payment pipeline, while the current PIE schema remains specifically a **Payment Intent Envelope**. A nonpayment task envelope would require a separate versioned contract and migration design. The existing schema is not renamed or silently generalized here.

## Layer responsibilities

### OODA — Observe / Orient / Decide / Act

Observe external conditions, orient them against the user's goal and propose candidate actions. In this architecture, Act produces a proposal rather than directly executing a side effect. Source, time, network and uncertainty should remain visible as observations move downstream.

### LEAR — Learn / Evaluate / Adapt / Reinforce

Use outcomes to improve retrieval, proposal strategies and bounded decision parameters. Measure failure cases and regressions rather than treating repeated output as learning. Adaptation must not change authorization rules, permitted capabilities or financial bounds. New policy or trusted-memory promotion requires its own review boundary.

### FEYNMAN — Explain / Simplify / Test / Reject

Make a proposal understandable; identify its claims and supporting evidence; test those claims; reject unsupported assertions. A short explanation is not a truth certificate. Citation checks, deterministic comparisons, source validation and independent review provide different forms of evidence. Model agreement may help review but cannot issue execution authority.

The related Shellfish evidence pipeline connects retrieval, grounded prompts, citations, claim verification and a final policy gate. This maps to C2V's evidence responsibilities; it is not a drop-in implementation of every FEYNMAN invariant in this repository.

### PIE — Payment Intent Envelope

Capture the requested payment and its destination, asset, amount, route constraints, fees, slippage, expiry, risk bounds and evidence references. The envelope states intent; it does not itself authorize spending. Monetary arithmetic, asset identity, units, canonical serialization and versioning must be explicit in any implementation used for real value.

### CAR — Compute / Validate / Attest / Route

Compute candidate paths, apply deterministic validation, bind attested statements to the exact artifact and route only to a permitted adapter. Cryptographic attestation proves a signer made a statement about bound data; it does not independently prove the statement is true or provide wallet permission.

Authorization remains separate from optimization. In the related Wave assurance branch, grants bind task, provider, capability, route receipt and cost ceiling, and execution checks include integrity, time validity and replay rejection. Those grants do not enable payment or trusted-memory writes. These mechanisms must not be assumed present in the template's CAR module.

## Operating loop

1. Record the goal and allowed operating mode.
2. Retrieve evidence; preserve the decision's source set and uncertainty.
3. Propose and explain an action; test important claims.
4. Express a bounded intent; prepare an eligible route and receipt.
5. Request separate authority for that exact operation.
6. Revalidate artifacts and permission at the side-effect boundary.
7. Execute only the permitted capability, or stop with an explicit rejection.
8. Verify results, reconcile expected and observed outcomes, preserve failures and feed measurements into bounded adaptation.

These are responsibilities rather than one universal synchronous call chain. Route preparation can precede authorization; observation or a rejected proposal can end without financial execution. Any eventual side effect must pass all applicable gates.

## Related projects and integration

| Component | Contribution to the concept | Current limit |
|---|---|---|
| Shellfish agent-control prototype | Evidence grounding, assurance and bounded capabilities | Separate implementation and operating authority |
| Wave Router assurance branch | Eligible-provider filtering, scoring, route receipts and scoped grant enforcement | Quote/route quality is not spend authority |
| Wave accounting/ledger adapters | Simulated reservation journal, quote-only sandbox, read-only XRPL inspection and unsigned Testnet/Devnet draft metadata | No inference of real balances, outgoing payments or submitted transactions |
| Control Room | Human-facing research, intent/status presentation and review surface | UI components and conceptual modules do not prove backend enforcement |
| Integration Spine candidates | Connect the operator surface, gateway and router through bounded local workflows | Candidates are separate from public default-branch release readiness |
| Development-agent workflow | Builder/reviewer roles, result packets, review/repair loops and shared notes | Session coordination is not a verified persistent runtime |

Public references: [Wave assurance branch](https://github.com/Shellfish011235/xrpl-wave-router/tree/assurance-router-boundary-v1), [Control Room](https://github.com/Shellfish011235/xrpl-control-room-gamer-ui), and its [C2V roadmap](https://github.com/Shellfish011235/xrpl-control-room-gamer-ui/blob/main/docs/C2V-EVOLUTION-ROADMAP.md). The roadmap's benchmark goals, ZK aspirations and calendar dates are plans, not measured implementation evidence.

## Cognitive security and operator review

Prompt injection, narrative manipulation and poisoned evidence can influence a proposal even when its explanation sounds sensible. Keep untrusted content separate from policy and permission. Preserve provenance, test claims, enforce target/capability limits and require independent evidence at consequential boundaries. These reduce risk; they do not establish immunity from manipulation or hallucination.

An operator should be able to see what is proposed, which evidence supports it, the provider/destination and network, the resource limits, the permission state and what remains uncertain. A late response must not overwrite the current task's status. Pending, rejected, simulated, executed and settled states must remain distinguishable.

Approval must bind to an exact artifact and scope. Approval to inspect, prepare a candidate or verify it is distinct from approval to publish, promote, pay, sign or submit. Stop/revocation controls require actual enforcement at the runtime boundary and must be tested under failure and interruption.

## Coordination and evidence packets

The current development process uses a bounded loop: assignment, inspection, candidate work, checks, result packet, independent review, targeted repair and coordinator acceptance. Packets should record task/worker identity, scope, revisions, changed artifacts, command exits, review result and NOT RUN limitations.

Obsidian supplies a readable shared whiteboard. A durable coordination bus must independently provide ownership, leases, message handling and recovery if introduced. Neither a note nor an agent's self-report proves a worker is running, a task is owned or a change is safe.

## What remains to be implemented or verified

- Real canonical cryptography and signature verification in this scaffold.
- Enforced halt/revocation, exact artifact binding and comprehensive negative tests across entry points.
- Exact monetary comparisons and consistent reject/warn semantics.
- Versioned interoperability contracts between payment envelopes, task intents, grants and receipts.
- Controlled local startup and cleanup, owned service readiness and browser concurrency checks in Integration Spine.
- Independent provider/result verification and explicit reconciliation before any ledger-producing extension.
- Real ZK verification, multi-ledger execution and adaptive governance only through separately scoped research and implementation.

The current template's simulated test transaction IDs are not validated ledger evidence. No runtime test suite or production audit was performed as part of this documentation revision. See [README](../README.md) for concrete source limitations, [invariants](./invariants.md) for requirements and [threat model](./threat-model.md) for current gaps.

## Build order and acceptance

Start with contracts and enforcement. Add meaningful negative tests for missing, stale, malformed, tampered, over-budget and replayed artifacts. Then add evidence-grounded cognition and human-facing explanations without weakening the boundary. Enable an external side effect only after its own authority and outcome-verification path has been reviewed.

Reusable preparation infrastructure and an event-time application feature have separate scopes. The current hackathon preparation remains Integration Spine; the proposed Vault Exit Drill is a separate event-time candidate. This concept update does not implement that feature or certify event eligibility.
