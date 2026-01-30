# Open-Source Pathfinding & Security Hardening
## Judgment Stack–Aligned Reference (XRPL / AI / Graph Systems)

This document catalogs **free, open-source, auditable pathfinding tools** and
**defensive security components** that can be composed using:

**The Judgment Stack**
(OODA → LEAR → FEYNMAN → PIE → CAR → Ledger)

The goal is **safe cognition-to-action**, not raw optimization.

---

## 1. Pathfinding (Execution Substrate)

Pathfinding answers *"what routes are possible?"*  
Judgment decides *"what routes are allowed."*

### 1.1 XRPL-Native Pathfinding (Authoritative)

#### **xrpl.js / xrpl-py**
- **Purpose:** Native XRPL payment pathfinding (`ripple_path_find`)
- **License:** ISC / MIT-style
- **Repo:** [Ripple/xrpl.js](https://github.com/XRPLF/xrpl.js), [XRPLF/xrpl-py](https://github.com/XRPLF/xrpl-py)
- **Security Posture:**
  - Uses validated ledger state
  - Deterministic, no ML
  - Minimal external dependencies
- **Judgment Stack Placement:**
  - **CAR → Compute**
  - **CAR → Validate (ledger truth)**
- **Hard Rule:**  
  Pathfinding output is **never executed directly** — must be wrapped in PIE.

✅ **Recommended default for XRPL systems**

---

### 1.2 General Graph Pathfinding (Non-Ledger)

#### **NetworkX (Python)**
- **Purpose:** Graph algorithms (Dijkstra, A*, flow)
- **License:** BSD
- **Repo:** [networkx/networkx](https://github.com/networkx/networkx)
- **Use Case:**  
  - Simulating ILP corridors
  - Modeling liquidity graphs
  - AI planning graphs
- **Security Posture:**
  - Pure Python
  - Easy to audit
- **Judgment Stack Placement:**
  - **OODA → Observe**
  - **CAR → Compute (simulation only)**

⚠️ Must never be treated as settlement truth.

---

#### **PathFinding.js**
- **Purpose:** Lightweight A*/BFS (JS)
- **License:** MIT
- **Repo:** [qiao/PathFinding.js](https://github.com/qiao/PathFinding.js)
- **Use Case:**  
  - Visualization
  - UI simulations
- **Judgment Stack Placement:**
  - **UI / OODA**
- **Security Posture:**  
  Small codebase, easy audit

---

## 2. Security Hardening (Defense-in-Depth)

Security is **not a single tool**.  
It is **layered enforcement**, mapped to protocol loops.

---

## 3. Defenses Against Data Poisoning

### Tools

#### **Adversarial Robustness Toolbox (ART)**
- **Repo:** [Trusted-AI/adversarial-robustness-toolbox](https://github.com/Trusted-AI/adversarial-robustness-toolbox)
- **License:** MIT
- **Use:** Detect poisoned or adversarial data
- **Judgment Stack Placement:**
  - **LEAR → Evaluate**
  - **FEYNMAN → Test**

#### **BackdoorBox**
- **Repo:** [THUYimingLi/BackdoorBox](https://github.com/THUYimingLi/BackdoorBox)
- **License:** MIT
- **Use:** Detect training backdoors (defensive use only)
- **Judgment Stack Placement:**
  - **FEYNMAN → Reject**
  - **LEAR → Drift detection**

### Structural Defense (More Important Than Tools)
- Data provenance hashes
- Immutable training snapshots
- Reject unexplained data shifts

---

## 4. Defenses Against Prompt Injection

### Tools

#### **Rebuff**
- **Repo:** [protectai/rebuff](https://github.com/protectai/rebuff)
- **Use:** Detect prompt injection patterns
- **Placement:** **OODA → Observe**

#### **LLM Guard**
- **Repo:** [protectai/llm-guard](https://github.com/protectai/llm-guard)
- **Use:** Input/output scanning
- **Placement:** **FEYNMAN → Reject**

#### **NeMo Guardrails**
- **Repo:** [NVIDIA/NeMo-Guardrails](https://github.com/NVIDIA/NeMo-Guardrails)
- **Use:** Policy rails (not enforcement)
- **Placement:** **PIE → Constraint shaping**

### Hard Protocol Rule

> **LLMs may never bypass PIE or CAR**

Prompt injection is neutralized structurally, not heuristically.

---

## 5. Defenses Against Backdoors & Supply-Chain Risk

### Tools
- **BackdoorBox** (model-level)
- **SBOM (CycloneDX)**  
  - Dependency transparency
  - Reproducible builds

### Judgment Stack Placement
- **FEYNMAN → Test**
- **CAR → Attest**
- **Ledger → Final accountability**

---

## 6. Defenses Against Malicious Intent / Goal Hijacking

### Tools

#### **Garak**
- **Repo:** [leondz/garak](https://github.com/leondz/garak)
- **Use:** LLM red-teaming
- **Placement:** **LEAR → Stress test**

#### **PyRIT**
- **Repo:** [Azure/PyRIT](https://github.com/Azure/PyRIT)
- **Use:** Adversarial prompting & abuse detection
- **Placement:** **FEYNMAN → Reject**

### Structural Defenses (Most Important)

- PIE requires:
  - Explicit explanation
  - Expiry
  - Risk bounds
- CAR enforces:
  - Deterministic execution
  - No cognition
  - No override

---

## 7. How This All Fits Together

### Canonical Flow

```
OODA    → observe inputs & routes
LEAR    → detect drift / anomalies
FEYNMAN → explain & reject unclear intent
PIE     → formalize bounded intent
CAR     → compute, validate, attest, route
Ledger  → immutable settlement
```

### Key Insight

> **Security is not a feature.  
> It is the absence of bypasses.**

---

## 8. Recommended Minimal Stack (Practical)

### Pathfinding
| Tool | Purpose |
|------|---------|
| xrpl.js | Real ledger pathfinding |
| NetworkX | Simulation & modeling |

### Security
| Tool | Purpose |
|------|---------|
| Rebuff | Input sanitization |
| LLM Guard | Output scanning |
| Garak | Red-team testing |
| SBOM + hashes | Supply chain |

### Protocol
| Component | Status |
|-----------|--------|
| Judgment Stack invariants | **Mandatory** |

---

## 9. Final Feynman Compression

> **Pathfinding finds possibilities.**  
> **Judgment decides permission.**  
> **Enforcement executes reality.**

Anything else is theater.

---

## 10. Tool Reference Links

| Tool | Repository | License |
|------|------------|---------|
| xrpl.js | github.com/XRPLF/xrpl.js | ISC |
| xrpl-py | github.com/XRPLF/xrpl-py | ISC |
| NetworkX | github.com/networkx/networkx | BSD |
| PathFinding.js | github.com/qiao/PathFinding.js | MIT |
| ART | github.com/Trusted-AI/adversarial-robustness-toolbox | MIT |
| BackdoorBox | github.com/THUYimingLi/BackdoorBox | MIT |
| Rebuff | github.com/protectai/rebuff | Apache-2.0 |
| LLM Guard | github.com/protectai/llm-guard | MIT |
| NeMo Guardrails | github.com/NVIDIA/NeMo-Guardrails | Apache-2.0 |
| Garak | github.com/leondz/garak | Apache-2.0 |
| PyRIT | github.com/Azure/PyRIT | MIT |
