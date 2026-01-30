/**
 * Settlement Layer
 * 
 * Coordinates settlement across ledgers and tracks finality.
 */

import { createLogger } from '../utils/logging';
import { SubmissionResult } from '../utils/types';

const logger = createLogger('ledger');

export interface SettlementConfig {
  primaryLedger: 'xrpl' | 'ilp';
  confirmationRequirement: number;
  timeoutMs: number;
}

export interface Settlement {
  settlementId: string;
  intentId: string;
  timestamp: number;
  status: SettlementStatus;
  ledger: string;
  transactionHash?: string;
  confirmations: number;
  finalizedAt?: number;
}

export type SettlementStatus = 
  | 'pending'
  | 'submitted'
  | 'confirming'
  | 'finalized'
  | 'failed'
  | 'timeout';

/**
 * Track a settlement
 */
export function createSettlement(
  intentId: string,
  ledger: string
): Settlement {
  const settlement: Settlement = {
    settlementId: `settle-${Date.now()}`,
    intentId,
    timestamp: Date.now(),
    status: 'pending',
    ledger,
    confirmations: 0,
  };
  
  logger.info('Settlement created', { settlementId: settlement.settlementId });
  
  return settlement;
}

/**
 * Update settlement with submission result
 */
export function recordSubmission(
  settlement: Settlement,
  result: SubmissionResult
): Settlement {
  const updated: Settlement = {
    ...settlement,
    status: result.success ? 'submitted' : 'failed',
    transactionHash: result.transactionHash,
  };
  
  logger.audit({
    layer: 'ledger',
    action: 'recordSubmission',
    actor: 'system',
    data: {
      settlementId: settlement.settlementId,
      success: result.success,
      transactionHash: result.transactionHash,
    },
    outcome: result.success ? 'success' : 'failure',
  });
  
  return updated;
}

/**
 * Update settlement confirmations
 */
export function recordConfirmation(
  settlement: Settlement,
  confirmations: number,
  config: SettlementConfig
): Settlement {
  const isFinalized = confirmations >= config.confirmationRequirement;
  
  const updated: Settlement = {
    ...settlement,
    status: isFinalized ? 'finalized' : 'confirming',
    confirmations,
    finalizedAt: isFinalized ? Date.now() : undefined,
  };
  
  if (isFinalized) {
    logger.info('Settlement finalized', { 
      settlementId: settlement.settlementId,
      confirmations,
    });
    
    logger.audit({
      layer: 'ledger',
      action: 'settlementFinalized',
      actor: 'system',
      data: {
        settlementId: settlement.settlementId,
        confirmations,
        finalizedAt: updated.finalizedAt,
      },
      outcome: 'success',
    });
  }
  
  return updated;
}

/**
 * Check if settlement has timed out
 */
export function checkTimeout(
  settlement: Settlement,
  config: SettlementConfig
): Settlement {
  const elapsed = Date.now() - settlement.timestamp;
  
  if (elapsed > config.timeoutMs && settlement.status !== 'finalized') {
    logger.warn('Settlement timeout', { 
      settlementId: settlement.settlementId,
      elapsed,
    });
    
    return {
      ...settlement,
      status: 'timeout',
    };
  }
  
  return settlement;
}

/**
 * Get settlement summary
 */
export interface SettlementSummary {
  total: number;
  pending: number;
  finalized: number;
  failed: number;
  avgConfirmationTime: number;
}

export function summarizeSettlements(settlements: Settlement[]): SettlementSummary {
  const finalized = settlements.filter(s => s.status === 'finalized');
  
  const confirmationTimes = finalized
    .filter(s => s.finalizedAt)
    .map(s => (s.finalizedAt as number) - s.timestamp);
  
  const avgConfirmationTime = confirmationTimes.length > 0
    ? confirmationTimes.reduce((a, b) => a + b, 0) / confirmationTimes.length
    : 0;
  
  return {
    total: settlements.length,
    pending: settlements.filter(s => 
      ['pending', 'submitted', 'confirming'].includes(s.status)
    ).length,
    finalized: finalized.length,
    failed: settlements.filter(s => 
      ['failed', 'timeout'].includes(s.status)
    ).length,
    avgConfirmationTime,
  };
}

/**
 * Check if settlement is final (no more changes possible)
 */
export function isFinal(settlement: Settlement): boolean {
  return ['finalized', 'failed', 'timeout'].includes(settlement.status);
}
