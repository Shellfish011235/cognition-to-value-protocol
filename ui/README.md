# UI Components

This folder contains documentation and specifications for the Control Room UI.

## Overview

The UI is **safety infrastructure**, not decoration. Every UI element maps directly to a protocol layer.

## Implementation Status

- [ ] Specifications defined
- [ ] Component library selected
- [ ] Layout designed
- [ ] Components implemented
- [ ] Integration tested

## Recommended Stack

- **Framework:** React / Next.js
- **State:** Zustand or Redux
- **Styling:** Tailwind CSS
- **Charts:** Recharts or D3
- **Real-time:** WebSocket or SSE

## Getting Started

1. Read `control-room-mapping.md` to understand UI ↔ Protocol relationships
2. Design components that enforce safety invariants visually
3. Implement with accessibility in mind
4. Test with simulated protocol data

## Key Principles

1. **Visibility** - All system state must be visible
2. **Control** - Human override always accessible
3. **Clarity** - No ambiguous states
4. **Safety** - Dangerous actions require confirmation
