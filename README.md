# Cognition-to-Value Protocol (C2V)

An experimental architecture for turning observations, evidence and human goals into explainable, bounded actions and traceable outcomes.

**Concept update: October 8, 2026.** This repository contains the protocol specification and a TypeScript reference scaffold. Related implementation work lives in separate projects and branches. Capabilities in those projects are not automatically capabilities of this template.

## The concept

C2V connects cognition to useful outcomes through explicit evidence, permission and verification boundaries. A useful outcome may be a sourced explanation, an inspected repository, a candidate patch, a verified artifact, a route quote or a user-reviewed payment intent. Financial settlement is one possible downstream use, not the prerequisite for creating value.

The central question is: **What can this system justify, what is it permitted to do, and what evidence shows what actually happened?**

An agent's confidence, a persuasive explanation, a majority vote or an attractive route cannot answer the permission question. Permission must come from a separate authority boundary and be checked again at execution time.

> Intelligence proposes. Evidence supports. Policy bounds. Authorization permits. Execution obeys. Verification records the outcome.

## Where the work stands

| Area | Current evidence | Boundary |
|---|---|---|
| C2V protocol template | OODA, LEAR, FEYNMAN, PIE and CAR modules; schemas and reference documentation | Scaffold, not a complete or audited enforcement system |
| Evidence and agent assurance | Related Shellfish prototype, reviewed separately in the local development work, separates retrieval, grounded reasoning, citation/claim checks and a final policy gate | Local prototype evidence; separate implementation; model output is not authority |
| Wave Router | Public assurance branch documents provider filtering/scoring, receipt integrity, HMAC-signed bounded execution grants, expiry/binding checks and replay rejection | Routing quality does not grant execution or payment permission |
| Accounting and settlement preparation | Wave branch contains simulated accounting, a quote-only Open Payments sandbox, read-only XRPL inspection and local Testnet/Devnet unsigned drafts | Simulated balances are not funds; drafts are not signed or submitted transactions |
| Control Room | Research/simulation UI and C2V-oriented modules; current integration candidates connect operator views to backend health, quotes, receipts and queues | UI availability is not proof of safe execution; browser acceptance remains incomplete |
| Integration Spine | Local candidate work connects Shellfish, Wave and Control Room. October 8 health-parser regression repair passed 30 focused and 66 project tests and peer review | Local, isolated, unmerged evidence; not a fresh test result for this repository or public release |
| Team coordination | Bounded builder/reviewer session workflow, result packets and an Obsidian whiteboard | Documentation is not a verified durable scheduler, ownership lease or autonomous background team |
| Advanced verification | ZK proofs, broader independent verifiers, adaptive governance and cross-ledger extensions remain research directions | Placeholder proof payloads and simulated verification are not cryptographic proof |

The public Wave implementation is documented on [assurance-router-boundary-v1](https://github.com/Shellfish011235/xrpl-wave-router/tree/assurance-router-boundary-v1). Its default branch retains an earlier MVP. The [Control Room evolution roadmap](https://github.com/Shellfish011235/xrpl-control-room-gamer-ui/blob/main/docs/C2V-EVOLUTION-ROADMAP.md) describes aspirations; its targets and dates are not evidence that those capabilities shipped.

## Protocol layers

| Layer | Responsibility | Required separation |
|---|---|---|
| **OODA — Observe / Orient / Decide / Act** | Observe conditions, establish context and propose the next action | In this protocol, Act emits a proposal; it does not directly mutate financial state |
| **LEAR — Learn / Evaluate / Adapt / Reinforce** | Improve proposal and retrieval strategies using measured outcomes | Adaptation cannot rewrite policy, permissions or execution bounds |
| **FEYNMAN — Explain / Simplify / Test / Reject** | Make claims understandable, connect them to sources, test them and reject unsupported assertions | Clarity is necessary but does not prove truth; independent checks remain necessary |
| **PIE — Payment Intent Envelope** | Express a payment proposal with explicit destination, asset, amount, limits, expiry and required evidence | Structured intent is not a spend grant; the current payment schema must not be silently reused as a universal task schema |
| **CAR — Compute / Validate / Attest / Route** | Compute candidate routes and apply deterministic checks before a permitted adapter action | Attestation, authorization, routing and settlement remain distinct |
| **Outcome verification and feedback** | Reconcile observed results with the exact intent and preserve provenance | Execution success, a local receipt and validated ledger settlement are different claims |

For nonpayment work, a future versioned task-intent contract can express capability, target and resource limits. This conceptual extension does not change the existing PIE API or grant new authority.

## The wider operating architecture

C2V's five named layers sit inside a larger operating loop:

1. **Observe and retrieve:** collect data with source identity, timestamp, scope and uncertainty. Freeze the evidence used for a decision when reproducibility matters.
2. **Explain and verify:** ground proposals in that evidence; distinguish supported facts, inference and unresolved questions. Treat external text and model output as untrusted input.
3. **Bound the intent:** state the exact action, target, amount or cost, time window, network and permitted capabilities. Reject ambiguous or malformed requests.
4. **Select a route:** rank eligible providers or paths inside hard constraints. Record the selection and its provenance without granting permission.
5. **Authorize separately:** the policy/authority boundary issues or denies a scoped grant tied to the exact intent and route. A payment or trusted-memory write requires its own authority.
6. **Enforce at execution:** recheck identity, integrity, expiry, scope, cost and replay state. Perform only the permitted operation; deny missing or mismatched authority.
7. **Verify and reconcile:** distinguish proposed, quoted, authorized, executed, simulated and settled outcomes. Preserve receipts and failures, then feed measured results back into LEAR.

Routing may happen more than once while preparing a proposal. Every eventual side effect must pass the relevant enforcement boundary; passive observation and rejected proposals need not invoke a settlement adapter.

## Different records prove different things

| Record | What it can support | What it cannot establish alone |
|---|---|---|
| Source/citation record | Where a claim came from | That the source or interpretation is correct |
| Intent envelope | What action and bounds were requested | Permission to act |
| Route receipt | Which provider/path was selected and what data was bound | Permission, provider reliability or settlement |
| Attestation | Which signer asserted which bound statement | Truth of that statement, independent audit or wallet authority |
| Execution grant | The scoped operation the issuer permits | Broader payment, custody, publication or memory permissions |
| Execution/result receipt | What the executor reports occurred | Independent verification or ledger finality |
| Validated ledger evidence | Observed transaction outcome on an identified network | That the transaction was appropriate, legally permitted or economically beneficial |

This distinction is essential to both cognitive security and financial safety. Manipulative text or a convincing rationale must not turn into an authorization artifact.

## Agent coordination and human control

The development workflow uses bounded assignments: inspect, propose, build, check, produce a result packet, peer review, repair if needed, and accept or reject. Each packet identifies the worker, task, scope, revisions, actual checks, limitations and next action.

An Obsidian whiteboard makes the work understandable to the human and team. A durable bus, if deployed, must separately establish authoritative ownership, leases, message handling and recovery. Notes and session-agent messages must not be represented as verified durable orchestration.

Human review should show the action, destination/provider, network, limits, evidence, uncertainty and current permission state. Approval binds to the exact intent and evidence revision; changed evidence or scope requires revalidation and, when material, renewed approval. Review or approval of one artifact must not silently approve later payment, signing, publication or production promotion. A stop control must be enforced by the runtime; a button or recorded halt flag alone is insufficient.

## Repository limitations that matter

The current TypeScript scaffold has important unfinished enforcement paths:

- [Cryptographic utilities](./src/utils/crypto.ts) use placeholder hashing/signing/key generation; signature verification returns false.
- [CAR routing](./src/car/route.ts) has unimplemented XRPL/ILP submission and a simulated test path. Its test transaction IDs are not ledger hashes.
- The route function checks attestation age but does not invoke the full attestation verifier. The exported routing-halt flag is not consulted by that function.
- [PIE validation](./src/pie/validateEnvelope.ts) uses floating-point amount comparisons and treats some limit conditions as warnings; this is not a production monetary enforcement contract.
- Declaring an invariant or mitigation does not show it is enforced across every entry point. This documentation update does not repair these code gaps.

Accordingly, the template is for development and simulation. This repository does not establish that experimenting with personal or third-party funds is safe. Related projects' stronger assurance mechanisms must be integrated and tested explicitly before they can protect a template deployment.

## Next milestones

1. Finish the Integration Spine's loopback-only launcher, controlled environment, owned readiness and reliable child-process cleanup; verify failure and interruption paths.
2. Verify operator flows in a browser, including pending/error states and late receipt responses; preserve exact branch/revision evidence.
3. Map each protocol invariant to its actual enforcement point and meaningful negative tests. Replace placeholder crypto, enforce halt/revocation and correct monetary comparisons before enabling execution.
4. Define versioned contracts for evidence, task intents, grants and receipts, including schema differences between the template and related implementations.
5. Expand independent verification and provider provenance only when measurable failure cases justify it. Treat model consensus, benchmark targets and ZK research as separate evidence questions.
6. Introduce any new ledger action behind separately reviewed authority, network, reconciliation and operational boundaries. Quote-only/read-only modes remain useful standalone outcomes.

Hackathon preparation remains focused on reusable Integration Spine infrastructure. The proposed Vault Exit Drill feature remains a separate event-time candidate; updating this concept does not implement that feature or establish event eligibility.

## Documentation and implementation references

- [Expanded protocol overview](./docs/protocol-overview.md)
- [Required invariants](./docs/invariants.md)
- [Threat model and current gaps](./docs/threat-model.md)
- [Glossary](./docs/glossary.md)
- [Wave Router assurance branch](https://github.com/Shellfish011235/xrpl-wave-router/tree/assurance-router-boundary-v1)
- [XRPL Control Room](https://github.com/Shellfish011235/xrpl-control-room-gamer-ui)

This concept revision is a documentation checkpoint, not a new implementation version, security audit, legal determination, financial service or claim of production readiness.

## License

MIT. See [LICENSE](./LICENSE). Dependency licenses and deployment responsibilities remain separate from this repository's license.
