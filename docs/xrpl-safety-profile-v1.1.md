# XRPL Safety Profile v1.1

## Purpose

This profile hardens the Cognition-to-Value Protocol for XRPL-native and XRPL-adjacent workflows.

The goal is not to make an autonomous trading agent. The goal is to make AI-assisted ledger workflows safer by enforcing explicit permission modes, XRPL-specific intent metadata, prompt firewall checks, compliance classification, deterministic CAR validation, and hash-linked task receipts.

## Added Safety Layers

```text
Input / Ledger Metadata
  → Prompt Firewall
  → Permission Mode Policy
  → OODA / LEAR / FEYNMAN
  → Compliance Guard
  → XRPL-native PIE Envelope
  → CAR XRPL Policy Validation
  → Task Receipt
  → External User Wallet / Ledger, only when allowed
```

## Permission Modes

| Mode | Allowed Boundary |
| --- | --- |
| `disabled` | Emergency halt. No protocol activity except status/receipt preservation. |
| `read_only` | Observe and explain only. No executable intents. |
| `simulation_only` | Observe, explain, and simulate. No fund movement. |
| `draft_intent` | Create bounded intent envelopes for review. No signing. |
| `human_approved_signing` | Submit only after external user-wallet approval. No private keys inside protocol. |
| `restricted_automation` | Automation only inside strict caps, approvals, logs, and halt controls. |

## XRPL-Native Intent Metadata

The XRPL safety envelope adds:

- Network: mainnet, testnet, devnet, or sidechain
- Source address
- Destination address and optional destination tag
- Destination tag requirement flag
- Asset type: XRP, issued currency, or MPT
- Issuer allow-list for issued currencies
- Blocked address list
- XRPL transaction type
- LastLedgerSequence policy
- Fee cap in drops
- Expected signing method
- Partial-payment ambiguity policy
- TrustSet and AMM human-approval warnings

## Non-Custodial Boundary

This profile preserves a strict non-custodial design:

- No seed phrases
- No private keys
- No backend signing
- No silent transaction submission
- No third-party fund control
- No transaction execution in read-only or simulation mode

## Prompt Firewall Scope

The Prompt Firewall scans:

- User prompts
- Agent messages
- XRPL transaction memos
- Token metadata
- NFT metadata
- Issuer domains or external text
- Any external text before it enters cognition

The firewall blocks high/critical patterns such as system override attempts, private key requests, exfiltration requests, and unapproved signing instructions.

## Compliance Guard Scope

The Compliance Guard classifies activity as:

- read-only
- educational
- simulation
- recommendation
- draft transaction
- user-signed transaction
- restricted automation
- custodial activity
- regulated activity warning
- blocked

For the safe reference profile, private-key handling, custody, and third-party fund movement are blocked.

## CAR XRPL Policy Validation

CAR remains deterministic. It does not reason, infer, or consult an LLM.

The XRPL policy validator rejects or warns on:

- Missing required destination tag
- Missing LastLedgerSequence when policy requires it
- Unknown issued-currency issuer when allow-list policy is active
- Blocked destination addresses
- Execution mode without an external signing method
- Signing request in non-execution modes
- Private-key policy relaxation
- Partial-payment ambiguity warning
- TrustSet and AMM human-approval requirements

## Task Receipts

Every important transition can produce a hash-linked receipt:

- Observation
- Explanation
- Rejection
- Simulation
- Draft intent
- Compliance check
- CAR validation
- Approval state
- Submission result

Receipts include mode, actor, action, status, prompt firewall result, compliance result, explanation, PIE hash, CAR hash, ledger hash if applicable, notes, and a canonical SHA-256 receipt hash.

## Recommended Build Order

1. Keep default mode as `read_only`.
2. Add Prompt Firewall before OODA receives external text.
3. Add Compliance Guard before PIE creation.
4. Use XRPL-native PIE only for draft/simulation first.
5. Add CAR XRPL validation before any external wallet handoff.
6. Generate Task Receipts for all rejected, simulated, and drafted actions.
7. Only after security review, enable human-approved external wallet signing.

## Reviewer Summary

This v1.1 profile moves the protocol from a generic cognition-to-value scaffold toward an XRPL-aware safety control plane.

It still does not make the project production-ready for third-party funds. Production use would require deeper XRPL transaction simulation, real wallet integration review, formal invariant tests, dependency audits, legal review, and external security review.
