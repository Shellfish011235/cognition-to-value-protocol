# Threat Model

**Concept review: October 8, 2026.** This document identifies threats, required controls and observed implementation gaps. A design mitigation is not evidence that a threat has been eliminated. No security audit or runtime test suite was performed for this documentation update.

## Scope and trust boundaries

C2V connects untrusted observations and model proposals to bounded intent, separate authorization, deterministic enforcement and outcome verification. Sources, models, providers, operators, authority issuers, executors and ledger adapters have different trust roles. Neither a model explanation nor a route score may become execution permission.

This repository is a reference scaffold. Related Shellfish, Wave and Control Room implementations have independent scopes and branches. Their controls must not be assumed present here. See [current limitations](../README.md#repository-limitations-that-matter).

## Threats and control requirements

| Threat | Required controls | Current evidence or gap |
|---|---|---|
| Hallucination or fabricated rationale | Source provenance, claim checks, deterministic comparisons and independent verification where consequential | FEYNMAN defines an evidence role; no universal hallucination prevention established |
| Prompt injection, narrative manipulation or poisoned evidence | Separate external content from policy; constrain capabilities/targets; verify claims and consequential outcomes | Layered design reduces risk; no immunity or comprehensive adversarial coverage claimed |
| Goal drift or poisoned learning | Bound adaptation; version policy; separately review trusted-memory promotion | LEAR must not rewrite permissions; runtime coverage must be demonstrated |
| Unauthorized execution or gate bypass | Recheck exact intent, identity, authority, scope, expiry and artifact integrity at every side-effect entry point | Template route checks age but does not call the full attestation verifier |
| Attestation forgery or key compromise | Real canonical hashing/signing/verification; protected keys, rotation and enforced revocation | Template crypto uses placeholders; signature verification returns false; not a production cryptographic boundary |
| Tampering, stale approval or replay | Bind grants to intent/receipt/evidence revision; reject expired/mismatched artifacts; consume nonces durably | Public Wave assurance branch documents binding/replay checks; equivalent template protection not established |
| Monetary precision or unit confusion | Exact amount representation, explicit units/asset identity and consistent fail-closed limit rules | Template PIE validator uses parseFloat and some warning-only conditions |
| Misleading simulation or settlement claims | Label synthetic results; verify network, validated ledger status and actual transaction outcome separately | Template test route returns simulated success and synthetic transaction IDs; XRPL/ILP submission is unimplemented |
| Stop-control failure | Enforce halt/revocation at execution and during long-running work; test interruption paths | Exported halt flag is not consulted by template route function |
| Provider misconduct or result fabrication | Authenticate manifests as needed; bind requests; independently check results and reconcile failures | Selection scores and executor receipts alone are insufficient |
| Human habituation or UI task races | Clear permission states, exact-artifact review and task-bound responses; sustainable review limits | Operator/browser acceptance, including late responses, remains a separate verification task |
| Coordination races or false worker status | Authoritative ownership/leases, bounded handoffs and recovery evidence | Obsidian/session packets are useful visibility, not verified durable orchestration |
| Denial of service or resource exhaustion | Input limits, budgets, timeouts, bounded queues and owned-process cleanup | Deployment-specific controls and startup/failure/interrupt evidence still required |
| Privacy leakage | Data minimization, access controls, retention limits and redacted evidence/logs | Auditability must not become indiscriminate logging of private input or secrets |

## Required acceptance evidence

Each relevant invariant needs a mapped enforcement point, positive and meaningful negative tests, and runtime evidence appropriate to its deployment. Include missing, malformed, expired, tampered, mismatched, over-budget and replayed inputs. Test revocation and interruption after work has begun, not just before startup.

Identify repository, branch, commit, operating mode, actual checks and NOT RUN limits. A successful test in an integration candidate does not certify this scaffold, all related branches or a production deployment. Model voting, documentation labels and planned benchmark targets are not substitutes for enforcement evidence.

## Incident handling

A deployed implementation must provide a working halt mechanism. If an incident occurs: stop affected capabilities through an enforced control, preserve relevant evidence with sensitive data minimized, determine scope and root cause, apply a bounded repair, verify the regression and require the relevant authority before resuming. The scaffold's current exported halt helper is not sufficient evidence of that capability.

## Residual risk and operating boundary

Unknown attacks, implementation bugs, bad source data, compromised authority and operational errors remain possible. Do not use this template to assert safe handling of personal or third-party funds. ZK payload placeholders, simulated settlement and declared invariants do not establish cryptographic security, legal permission or production readiness.
