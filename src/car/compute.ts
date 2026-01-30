/**
 * CAR - Compute
 * 
 * Pathfinding and route computation. NO AI/ML ALLOWED.
 * 
 * INVARIANT: Compute performs deterministic pathfinding only.
 * No learning, no inference, no LLMs.
 */

import { createLogger } from '../utils/logging';
import { PaymentIntentEnvelope } from '../utils/types';

const logger = createLogger('car');

export interface ComputeResult {
  computeId: string;
  timestamp: number;
  envelope: PaymentIntentEnvelope;
  selectedRoute: Route;
  alternativeRoutes: Route[];
  computeTimeMs: number;
}

export interface Route {
  routeId: string;
  type: 'direct' | 'xrpl-dex' | 'ilp' | 'multi-hop';
  path: string[];
  estimatedFee: string;
  estimatedTime: number;
  confidence: number;
}

export interface LedgerState {
  networkFee: string;
  lastLedgerIndex: number;
  reserves: Record<string, string>;
  orderBooks?: Record<string, unknown>;
}

/**
 * Compute optimal route for payment
 * 
 * CRITICAL: This is PURE pathfinding. No AI/ML components.
 */
export function compute(
  envelope: PaymentIntentEnvelope,
  ledgerState: LedgerState
): ComputeResult {
  const startTime = Date.now();
  
  logger.info('Computing route', { intentId: envelope.intentId });
  
  // Get candidate routes
  const candidates = getCandidateRoutes(envelope, ledgerState);
  
  // Filter by allowed routes
  const allowedCandidates = filterByAllowedRoutes(candidates, envelope.allowedRoutes);
  
  // Select optimal route based on deterministic criteria
  const selectedRoute = selectOptimalRoute(allowedCandidates, envelope);
  
  const computeTimeMs = Date.now() - startTime;
  
  const result: ComputeResult = {
    computeId: `compute-${Date.now()}`,
    timestamp: Date.now(),
    envelope,
    selectedRoute,
    alternativeRoutes: allowedCandidates.filter(r => r.routeId !== selectedRoute.routeId),
    computeTimeMs,
  };
  
  logger.audit({
    layer: 'car',
    action: 'compute',
    actor: 'system',
    data: {
      computeId: result.computeId,
      intentId: envelope.intentId,
      selectedRouteType: selectedRoute.type,
      routeCount: allowedCandidates.length,
      computeTimeMs,
    },
    outcome: 'success',
  });
  
  return result;
}

/**
 * Get candidate routes from ledger state
 */
function getCandidateRoutes(
  envelope: PaymentIntentEnvelope,
  ledgerState: LedgerState
): Route[] {
  const routes: Route[] = [];
  
  // Direct route (always available for XRP)
  if (envelope.amount.currency === 'XRP') {
    routes.push({
      routeId: `route-direct-${Date.now()}`,
      type: 'direct',
      path: [envelope.destination],
      estimatedFee: ledgerState.networkFee,
      estimatedTime: 4, // ~4 seconds for XRPL
      confidence: 0.99,
    });
  }
  
  // DEX route (for swaps or cross-currency)
  if (envelope.action === 'swap' || envelope.amount.currency !== 'XRP') {
    routes.push({
      routeId: `route-dex-${Date.now()}`,
      type: 'xrpl-dex',
      path: ['XRP', envelope.amount.currency, envelope.destination],
      estimatedFee: multiplyFee(ledgerState.networkFee, 2),
      estimatedTime: 8,
      confidence: 0.9,
    });
  }
  
  // ILP route (for cross-network)
  routes.push({
    routeId: `route-ilp-${Date.now()}`,
    type: 'ilp',
    path: ['ilp-connector', envelope.destination],
    estimatedFee: multiplyFee(ledgerState.networkFee, 3),
    estimatedTime: 15,
    confidence: 0.85,
  });
  
  return routes;
}

/**
 * Filter routes by allowed list
 */
function filterByAllowedRoutes(routes: Route[], allowed: string[]): Route[] {
  if (allowed.length === 0) {
    return routes; // No restrictions
  }
  
  return routes.filter(route => 
    allowed.includes(route.type) || allowed.includes('*')
  );
}

/**
 * Select optimal route based on deterministic criteria
 * 
 * NO ML/AI - pure rule-based selection
 */
function selectOptimalRoute(routes: Route[], envelope: PaymentIntentEnvelope): Route {
  if (routes.length === 0) {
    throw new Error('No valid routes available');
  }
  
  // Sort by: confidence (desc), then fee (asc), then time (asc)
  const sorted = [...routes].sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    
    const feeA = parseFloat(a.estimatedFee);
    const feeB = parseFloat(b.estimatedFee);
    if (feeA !== feeB) {
      return feeA - feeB;
    }
    
    return a.estimatedTime - b.estimatedTime;
  });
  
  // Check fee constraint
  const maxFee = parseFloat(envelope.constraints.maxFee);
  const validRoutes = sorted.filter(r => parseFloat(r.estimatedFee) <= maxFee);
  
  if (validRoutes.length === 0) {
    logger.warn('No routes within fee constraint, using lowest fee option');
    return sorted[0];
  }
  
  return validRoutes[0];
}

/**
 * Multiply fee string by factor
 */
function multiplyFee(fee: string, factor: number): string {
  return (parseFloat(fee) * factor).toFixed(6);
}
