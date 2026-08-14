# 🧠 Canonical Cognition-to-Value Protocol (v1)
## Modular, Auditable, Ledger-Native Intelligence Architecture

> **Purpose:**  
> This repository is a **grab-and-go GitHub template** for implementing the  
> **OODA → LEAR → FEYNMAN → PIE → CAR** protocol as a safe, explainable, ledger-native  
> cognition-to-action system.
>
> This is **not** a trading bot, AI agent, or DAO.  
> This is a **cognition-to-value operating system** with strict safety invariants.

---

## 🛡️ Defensive OODA v2 (active draft)

Defensive OODA v2 extends the original protocol into a **zero-trust agent control plane**. It is designed to govern autonomous or semi-autonomous agents without allowing probabilistic model output to become direct execution authority.

Current v2 controls include:
- explicit expiring agent identities with public keys, scopes, tool allowlists, and capability profiles
- bounded Capability/Policy Intent Envelopes for non-payment actions as well as payment intents
- Ed25519 signing and verification of capability requests
- deterministic authorization decisions: `ALLOW`, `DENY`, `REQUIRE_HUMAN`, or `SIMULATE_FIRST`
- provenance/trust graphs connecting sources → evidence → hypotheses → decisions → actions → results
- downstream trust revocation when a source or dependency is later found compromised
- non-executing Shadow OODA comparison to challenge primary orientation and expected effects
- rollback, expiry, blast-radius, and approval requirements before consequential actions
- scoped GitHub Actions CI with adversarial fail-closed tests

The design goal is not to build another autonomous security agent. It is to provide the **trust, authorization, provenance, and execution-control layer around agents** so no individual agent becomes sovereign.

See [`docs/defensive-ooda-v2.md`](./docs/defensive-ooda-v2.md) for the current architecture and roadmap.

---

## 📌 What This Repo Is

- A **reference implementation scaffold**
- A **formal protocol spec**
- A **modular foundation** for:
  - AI payment agents
  - XRPL / ILP execution systems
  - Governance & risk tooling
  - Cognitive dashboards (Control Room-style UIs)
- Designed for **auditability, explainability, and safety**

---

## 🚫 What This Repo Is NOT

- ❌ Financial advice
- ❌ Autonomous trading software
- ❌ A self-executing AI agent
- ❌ A black-box LLM system
- ❌ A DAO or governance token

Money **never moves** without bounded intent + deterministic enforcement.

---

## 🧱 Core Philosophy

> **Intelligence may propose.  
> Protocols must decide.  
> Ledgers must enforce.**

Key design principles:
- No free-form execution
- No thinking inside enforcement
- No execution without explanation
- No cognition without feedback

---

## 🧠 The Stack (Top → Bottom)

| Layer         | Component                        |
|---------------|----------------------------------|
| Mental        | OODA (Perception Control)        |
| Logical       | LEAR (Adaptive Intelligence)     |
| Epistemic     | FEYNMAN (Truth Enforcement)      |
| Financial     | PIE (Bounded Intent)             |
| Cryptographic | CAR (Execution Gate)             |
| Ledger        | XRPL / ILP / Settlement          |

**Nothing skips layers.**

---

## 🔁 Loop Definitions & Invariants

### 🧭 OODA — Observe / Orient / Decide / Act
**Role:** Controls attention and proposes candidate actions.

**Invariant:**  
OODA may propose actions — it may **NOT** execute them.

---

### 🧠 LEAR — Learn / Evaluate / Adapt / Reinforce
**Role:** Adapts decision logic over time.

**Invariant:**  
LEAR may adjust *how* decisions are made — never *what* is enforced.

---

### 🧪 FEYNMAN — Explain / Simplify / Test / Reject
**Role:** Truth compression & hallucination defense.

**Invariant:**  
Anything that cannot be clearly explained **does not move money**.

---

### 📦 PIE — Payment Intent Envelope
**Role:** Formal contract between cognition and execution.

**Invariant:**  
No free-form actions. Only bounded, auditable envelopes.

---

### 🧱 CAR — Compute / Validate / Attest / Route
**Role:** Deterministic execution gate.

**Invariant:**  
CAR does **not** think. CAR **enforces**.

---

## 📁 Repository Structure

```
cognition-to-value-protocol/
├── README.md
├── LICENSE
├── .gitignore
├── package.json
├── tsconfig.json
│
├── docs/
│   ├── protocol-overview.md
│   ├── invariants.md
│   ├── threat-model.md
│   └── glossary.md
│
├── src/
│   ├── index.ts
│   │
│   ├── ooda/
│   │   ├── observe.ts
│   │   ├── orient.ts
│   │   ├── decide.ts
│   │   └── act.ts
│   │
│   ├── lear/
│   │   ├── learn.ts
│   │   ├── evaluate.ts
│   │   ├── adapt.ts
│   │   └── reinforce.ts
│   │
│   ├── feynman/
│   │   ├── explain.ts
│   │   ├── simplify.ts
│   │   ├── test.ts
│   │   └── reject.ts
│   │
│   ├── pie/
│   │   ├── pie.schema.ts
│   │   ├── validateEnvelope.ts
│   │   └── examples/
│   │       └── sample-intent.json
│   │
│   ├── car/
│   │   ├── compute.ts
│   │   ├── validate.ts
│   │   ├── attest.ts
│   │   └── route.ts
│   │
│   ├── ledger/
│   │   ├── xrpl.ts
│   │   ├── ilp.ts
│   │   └── settlement.ts
│   │
│   └── utils/
│       ├── logging.ts
│       ├── crypto.ts
│       └── types.ts
│
└── ui/
    ├── README.md
    └── control-room-mapping.md
```

---

## 📦 PIE — Payment Intent Envelope (Canonical Schema)

```ts
export interface PaymentIntentEnvelope {
  intentId: string;                 // UUID
  action: "send" | "swap" | "batch";
  amount: {
    value: string;
    currency: "XRP" | "USD" | string;
  };
  destination: string;              // XRPL address or ILP address
  constraints: {
    maxSlippage: number;
    maxFee: string;
    expiry: number;                 // unix timestamp
  };
  riskBounds: {
    maxVolatility: number;
    complianceFlags: string[];
  };
  allowedRoutes: string[];          // XRPL paths or ILP corridors
  requiredProofs: string[];         // CARV / ZK / audit proofs
  explanation: string;              // Feynman-compressed rationale
}
```

---

## 🧱 CAR — Execution Flow

```ts
// CAR pipeline (NO LLMs ALLOWED)
compute(envelope)
  → validate(envelope, ledgerState)
  → attest(envelope, proofs)
  → route(envelope)
```

- **Compute:** pathfinding only
- **Validate:** deterministic rule checks
- **Attest:** cryptographic signing
- **Route:** ledger submission

---

## 🖥️ UI Mapping (Optional)

| Loop    | UI Element                       |
|---------|----------------------------------|
| OODA    | Lenses, alerts, regions          |
| LEAR    | Drift graphs, adaptive sliders   |
| FEYNMAN | "Explain This" modal             |
| PIE     | Intent preview cards             |
| CAR     | Execute button + attestation log |

The UI is **safety infrastructure**, not decoration.

---

## 🔐 Safety & Threat Model (Summary)

| Threat                | Mitigation              |
|-----------------------|-------------------------|
| LLM hallucinations    | blocked by FEYNMAN      |
| Goal drift            | bounded by PIE          |
| Rogue execution       | blocked by CAR          |
| Black-box behavior    | forbidden               |
| Human override        | always allowed          |

See `docs/threat-model.md`.

---

## 🧪 How To Use This Template

1. Click **Use this template** on GitHub
2. Rename the repo
3. Implement **PIE first**
4. Stub **CAR** before wiring any LLMs
5. Add cognition **last** — never first

---

## 🧠 Final Compression (Feynman-Clean)

> **OODA** decides what to look at  
> **LEAR** decides how to adapt  
> **FEYNMAN** decides what is true  
> **PIE** decides what is allowed  
> **CAR** decides what actually happens

---

## 🏛️ Industry Alignment & External Support

The **Cognition-to-Value Protocol** aligns with emerging industry best practices for building **safe, guardrail-enabled agentic AI systems**, particularly around the separation of probabilistic reasoning from deterministic execution.

This design pattern closely mirrors guidance published by **NVIDIA** on securing agentic AI workflows:

### NVIDIA Reference: *Safeguarding Agentic AI Systems*

NVIDIA's official AI safety guidance emphasizes:
- Separating AI reasoning from execution authority  
- Policy-gated and deterministic enforcement layers  
- Guardrails against goal drift, hallucination, and prompt injection  
- Human-in-the-loop or cryptographically enforced approval for high-risk actions  

**Source:**  
[Safeguard Agentic AI Systems with the NVIDIA Safety Recipe](https://developer.nvidia.com/blog/safeguard-agentic-ai-systems-with-the-nvidia-safety-recipe/)

### Architectural Parallel

Both approaches follow the same core principle:

> **AI systems may propose intents, but deterministic systems decide what is allowed to execute.**

In Cognition-to-Value:
- **Cognition (LLM / agent)** proposes bounded intents  
- **FEYNMAN** enforces explainability  
- **PIE** constrains intent structure and risk  
- **CAR** deterministically validates, attests, and routes actions  
- **Ledger rails (XRPL / ILP)** enforce final settlement  

This mirrors NVIDIA's recommended separation between probabilistic AI behavior and safety-critical execution layers in agentic systems.

### Scope Clarification

> ⚠️ **This project is not affiliated with, endorsed by, or derived from NVIDIA.**  
> The reference is included solely to demonstrate **independent convergence** on shared safety architecture patterns used in high-risk domains such as finance, infrastructure, and autonomous systems.

---

## 📜 License

MIT — protocol is open, execution is bounded.

---

## 🧭 Status

- ✅ Stable protocol v1
- ⚠️ Defensive OODA v2 is an active draft under test
- ⚠️ Safe for experimentation with personal funds only
- 🚫 Not production-ready for third-party assets

---

## ✨ Attribution

Created as part of the **Cognition-to-Value Protocol**  
Originating from XRPL-native, AI-safety-first design.
