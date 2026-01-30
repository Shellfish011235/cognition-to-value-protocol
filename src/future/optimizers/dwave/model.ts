/**
 * D-Wave Rotation Optimizer Model
 * 
 * Data models for key rotation scheduling optimization.
 * D-Wave is used ONLY for optimization - NOT for PQC math.
 * 
 * INVARIANT: This is planning/ops support - never on the CAR execution path.
 */

export type RotationTier = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface RotationNode {
  id: string;                 // service/wallet/validator identifier
  tier: RotationTier;
  windowStartUtc: string;     // ISO timestamp
  windowEndUtc: string;       // ISO timestamp
  maxDowntimeMinutes: number;
  dependencies: string[];     // ids that must rotate before this
}

export interface RotationConstraints {
  maxConcurrent: number;      // e.g. 5 at once
  maxTotalDowntimeMinutes: number;
  epochTarget: number;        // desired keyEpoch
}

export interface RotationPlanItem {
  id: string;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  epoch: number;
}

export interface RotationPlan {
  epoch: number;
  items: RotationPlanItem[];
  score: number;              // lower is better (objective)
  notes?: string[];
}

/**
 * Tier priority ranking (lower = higher priority)
 */
export const TIER_PRIORITY: Record<RotationTier, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/**
 * Validate rotation node
 */
export function isValidRotationNode(node: RotationNode): boolean {
  if (!node.id) return false;
  if (!node.tier || !(node.tier in TIER_PRIORITY)) return false;
  if (!node.windowStartUtc || !node.windowEndUtc) return false;
  if (typeof node.maxDowntimeMinutes !== 'number') return false;
  if (!Array.isArray(node.dependencies)) return false;
  return true;
}

/**
 * Validate rotation constraints
 */
export function isValidConstraints(constraints: RotationConstraints): boolean {
  if (typeof constraints.maxConcurrent !== 'number' || constraints.maxConcurrent < 1) return false;
  if (typeof constraints.maxTotalDowntimeMinutes !== 'number') return false;
  if (typeof constraints.epochTarget !== 'number') return false;
  return true;
}
