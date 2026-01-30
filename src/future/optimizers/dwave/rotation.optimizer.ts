/**
 * Rotation Optimizer Orchestrator
 * 
 * High-level interface for key rotation scheduling.
 * Can be called from LEAR or your ops pipeline.
 * 
 * INVARIANT: Keep this outside CAR. CAR should not be scheduling; CAR enforces.
 */

import { createLogger } from "../../utils/logging";
import { RotationNode, RotationConstraints, RotationPlan, isValidRotationNode, isValidConstraints } from "./model";
import { RotationOptimizerAdapter, greedyRotationAdapter } from "./adapter";

const logger = createLogger('lear'); // Rotation planning is LEAR-adjacent

export class RotationOptimizer {
  private adapter: RotationOptimizerAdapter;

  constructor(adapter: RotationOptimizerAdapter = greedyRotationAdapter) {
    this.adapter = adapter;
  }

  /**
   * Build a rotation plan from nodes and constraints
   */
  async buildPlan(nodes: RotationNode[], constraints: RotationConstraints): Promise<RotationPlan> {
    logger.info('Building rotation plan', {
      nodeCount: nodes.length,
      epochTarget: constraints.epochTarget,
      adapter: this.adapter.id,
    });

    // Validate inputs
    for (const node of nodes) {
      if (!isValidRotationNode(node)) {
        throw new Error(`Invalid rotation node: ${node.id}`);
      }
    }

    if (!isValidConstraints(constraints)) {
      throw new Error('Invalid rotation constraints');
    }

    // Check for dependency cycles
    this.validateNoCycles(nodes);

    // Solve using adapter
    const plan = await this.adapter.solve(nodes, constraints);

    logger.audit({
      layer: 'lear',
      action: 'buildRotationPlan',
      actor: 'system',
      data: {
        adapter: this.adapter.id,
        nodeCount: nodes.length,
        planItemCount: plan.items.length,
        score: plan.score,
      },
      outcome: 'success',
    });

    return plan;
  }

  /**
   * Set a different optimizer adapter
   */
  setAdapter(adapter: RotationOptimizerAdapter): void {
    logger.info('Switching rotation optimizer adapter', {
      from: this.adapter.id,
      to: adapter.id,
    });
    this.adapter = adapter;
  }

  /**
   * Get current adapter ID
   */
  getAdapterId(): string {
    return this.adapter.id;
  }

  /**
   * Validate that there are no dependency cycles
   */
  private validateNoCycles(nodes: RotationNode[]): void {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (inStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      inStack.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (node) {
        for (const dep of node.dependencies) {
          if (hasCycle(dep)) return true;
        }
      }

      inStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (hasCycle(node.id)) {
        throw new Error(`Dependency cycle detected involving node: ${node.id}`);
      }
    }
  }
}

/**
 * Create a default rotation optimizer instance
 */
export function createRotationOptimizer(adapterId?: string): RotationOptimizer {
  if (adapterId) {
    const { createAdapter } = require('./adapter');
    return new RotationOptimizer(createAdapter(adapterId));
  }
  return new RotationOptimizer();
}
