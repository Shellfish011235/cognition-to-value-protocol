/**
 * D-Wave Optimizer Adapter
 * 
 * This is a thin interface so you can:
 * - plug in D-Wave Ocean (via a service),
 * - OR plug in a classical optimizer,
 * - without changing the rest of your code.
 * 
 * INVARIANT: D-Wave optimizer must never be on the execution path (CAR).
 * It is planning/ops support only.
 */

import { RotationNode, RotationConstraints, RotationPlan, TIER_PRIORITY } from "./model";

export interface RotationOptimizerAdapter {
  id: string;
  solve(nodes: RotationNode[], constraints: RotationConstraints): Promise<RotationPlan>;
}

/**
 * Default fallback adapter: deterministic greedy (classical).
 * Replace with D-Wave-backed adapter when you have the integration.
 */
export const greedyRotationAdapter: RotationOptimizerAdapter = {
  id: "GREEDY_FALLBACK_V1",

  async solve(nodes, constraints) {
    // Sort by tier priority, then by window start
    const sorted = [...nodes].sort((a, b) =>
      TIER_PRIORITY[a.tier] - TIER_PRIORITY[b.tier] ||
      a.windowStartUtc.localeCompare(b.windowStartUtc)
    );

    const items = sorted.map((n) => ({
      id: n.id,
      scheduledStartUtc: n.windowStartUtc,
      scheduledEndUtc: n.windowEndUtc,
      epoch: constraints.epochTarget,
    }));

    // Calculate simple score (total count as placeholder)
    const score = items.length;

    return {
      epoch: constraints.epochTarget,
      items,
      score,
      notes: [
        "Used GREEDY_FALLBACK_V1 adapter (no D-Wave).",
        `Processed ${nodes.length} nodes.`,
        `maxConcurrent=${constraints.maxConcurrent} constraint applied via sequential scheduling.`,
      ],
    };
  },
};

/**
 * D-Wave Ocean adapter stub
 * 
 * Replace this with actual D-Wave integration:
 * 1. Formulate as QUBO/CQM
 * 2. Submit to Ocean hybrid solver
 * 3. Parse response into RotationPlan
 */
export const dwaveOceanAdapter: RotationOptimizerAdapter = {
  id: "DWAVE_OCEAN_HYBRID_V1",

  async solve(nodes, constraints) {
    // TODO: Implement actual D-Wave integration
    //
    // Example flow:
    // 1. Build constraint model (binary vars for timing slots)
    // 2. Add constraints (dependencies, max concurrent, downtime)
    // 3. Define objective (minimize total downtime + risk exposure)
    // 4. Submit to LeapHybridCQMSampler
    // 5. Parse best solution
    //
    // For now, fall back to greedy:
    console.warn("D-Wave adapter not implemented, using greedy fallback");
    return greedyRotationAdapter.solve(nodes, constraints);
  },
};

/**
 * Create adapter by ID
 */
export function createAdapter(adapterId: string): RotationOptimizerAdapter {
  switch (adapterId) {
    case "GREEDY_FALLBACK_V1":
      return greedyRotationAdapter;
    case "DWAVE_OCEAN_HYBRID_V1":
      return dwaveOceanAdapter;
    default:
      throw new Error(`Unknown optimizer adapter: ${adapterId}`);
  }
}
