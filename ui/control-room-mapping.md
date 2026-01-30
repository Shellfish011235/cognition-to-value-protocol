# Control Room UI Mapping

## Overview

Each protocol layer maps to specific UI components. This ensures that the UI accurately represents system state and provides appropriate controls.

---

## Layer Mappings

### 🧭 OODA → Observation Panel

**Purpose:** Display what the system is "looking at"

| Component | Function |
|-----------|----------|
| Market Lenses | Show current observation focus |
| Alert Stream | Real-time signals and anomalies |
| Region Selector | Choose observation domains |
| Confidence Meter | Display observation quality |

**Data Flow:**
```
observe() → Observation Panel
orient() → Context Display
decide() → Proposal Cards
act() → Pending Actions List
```

**Safety Features:**
- Read-only display (no execution from here)
- Stale data indicators
- Source attribution for all data

---

### 🧠 LEAR → Adaptation Dashboard

**Purpose:** Monitor and visualize system adaptation

| Component | Function |
|-----------|----------|
| Drift Graphs | Show parameter changes over time |
| Adaptive Sliders | Display current parameter values |
| Learning Events | Stream of recent feedback |
| Health Indicator | Overall adaptation health |

**Data Flow:**
```
learn() → Learning Events Feed
evaluate() → Health Assessment
adapt() → Parameter Change Proposals
reinforce() → Applied Changes Log
```

**Safety Features:**
- Bounds visualization on all sliders
- Drift alerts when approaching limits
- Adaptation history for audit

---

### 🧪 FEYNMAN → Explainability Panel

**Purpose:** Make all decisions transparent

| Component | Function |
|-----------|----------|
| "Explain This" Modal | On-demand explanation for any action |
| Verification Status | Show claim verification results |
| Source References | Link to original data sources |
| Rejection Log | Display blocked actions with reasons |

**Data Flow:**
```
explain() → Explanation Display
simplify() → Simplified Rationale
test() → Verification Results
reject() → Rejection Notification
```

**Safety Features:**
- Mandatory explanation before execution
- Hallucination warnings
- Source traceability

---

### 📦 PIE → Intent Preview

**Purpose:** Display bounded payment intents

| Component | Function |
|-----------|----------|
| Intent Cards | Preview of pending envelopes |
| Constraint Display | Show bounds and limits |
| Risk Bounds Viz | Visual risk indicators |
| Expiry Countdown | Time remaining for intent |

**Data Flow:**
```
PaymentIntentEnvelope → Intent Card
constraints → Constraint Badges
riskBounds → Risk Indicator
expiry → Countdown Timer
```

**Safety Features:**
- Clear amount/destination display
- Constraint violations highlighted
- Cannot modify intent from UI (immutable)

---

### 🧱 CAR → Execution Control

**Purpose:** Final execution gateway

| Component | Function |
|-----------|----------|
| Execute Button | Trigger execution (requires confirmation) |
| Attestation Log | Show cryptographic proofs |
| Route Display | Selected route visualization |
| Halt Button | Emergency stop (always visible) |

**Data Flow:**
```
compute() → Route Options
validate() → Validation Status
attest() → Attestation Badge
route() → Execution Result
```

**Safety Features:**
- Two-step execution (preview → confirm)
- Halt button always accessible
- Attestation required indicator
- Clear success/failure feedback

---

## Layout Recommendations

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: System Status | Halt Button | Human Override        │
├───────────────────┬─────────────────────────────────────────┤
│                   │                                         │
│  OODA Panel       │        Main Workspace                   │
│  (Observations)   │        (Context-dependent)              │
│                   │                                         │
├───────────────────┼─────────────────────────────────────────┤
│                   │                                         │
│  LEAR Dashboard   │        PIE Intent Preview               │
│  (Adaptation)     │        (Pending Envelopes)              │
│                   │                                         │
├───────────────────┴─────────────────────────────────────────┤
│ FOOTER: CAR Execution | Attestation Log | Recent Actions    │
└─────────────────────────────────────────────────────────────┘
```

---

## Color Coding

| Color | Meaning |
|-------|---------|
| Green | Validated / Safe / Success |
| Yellow | Warning / Pending / Uncertain |
| Red | Error / Rejected / Danger |
| Blue | Informational / Neutral |
| Gray | Disabled / Stale / Inactive |

---

## Accessibility Requirements

- All interactive elements keyboard accessible
- Color not sole indicator (use icons/text)
- Screen reader compatible
- Minimum contrast ratios met
- Focus indicators visible

---

## Real-time Updates

| Data Type | Update Frequency |
|-----------|------------------|
| Observations | 1-5 seconds |
| LEAR metrics | 10-30 seconds |
| PIE status | On change |
| CAR status | On change |
| Ledger state | 3-5 seconds |

Use WebSocket for real-time data; poll as fallback.
