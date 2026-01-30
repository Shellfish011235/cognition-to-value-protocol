/**
 * CAR - Validate
 * 
 * Deterministic rule checks. NO AI/ML ALLOWED.
 * 
 * INVARIANT: Validation is pure rule enforcement.
 * Fail closed on any uncertainty.
 */

import { createLogger } from '../utils/logging';
import { PaymentIntentEnvelope, ValidationResult } from '../utils/types';
import { ComputeResult, LedgerState } from './compute';

const logger = createLogger('car');

export interface CARValidationConfig {
  maxTransactionSize: string;
  minBalance: string;
  requireDestinationTag: boolean;
  blockedDestinations: string[];
  maxPendingTransactions: number;
}

const DEFAULT_CONFIG: CARValidationConfig = {
  maxTransactionSize: '100000',
  minBalance: '20', // XRPL reserve
  requireDestinationTag: false,
  blockedDestinations: [],
  maxPendingTransactions: 10,
};

/**
 * Validate envelope and compute result against ledger state
 * 
 * CRITICAL: Pure deterministic validation. No inference.
 */
export function validate(
  computeResult: ComputeResult,
  ledgerState: LedgerState,
  sourceBalance: string,
  config: CARValidationConfig = DEFAULT_CONFIG
): ValidationResult {
  logger.info('CAR validation', { computeId: computeResult.computeId });
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const envelope = computeResult.envelope;
  
  // Rule 1: Amount within transaction limits
  const amount = parseFloat(envelope.amount.value);
  const maxSize = parseFloat(config.maxTransactionSize);
  if (amount > maxSize) {
    errors.push(`Amount ${amount} exceeds max transaction size ${maxSize}`);
  }
  
  // Rule 2: Sufficient balance (including reserve)
  const balance = parseFloat(sourceBalance);
  const fee = parseFloat(computeResult.selectedRoute.estimatedFee);
  const minBalance = parseFloat(config.minBalance);
  const required = amount + fee + minBalance;
  
  if (balance < required) {
    errors.push(`Insufficient balance: have ${balance}, need ${required} (amount + fee + reserve)`);
  }
  
  // Rule 3: Destination not blocked
  if (config.blockedDestinations.includes(envelope.destination)) {
    errors.push(`Destination ${envelope.destination} is blocked`);
  }
  
  // Rule 4: Fee within constraints
  if (fee > parseFloat(envelope.constraints.maxFee)) {
    errors.push(`Route fee ${fee} exceeds max fee ${envelope.constraints.maxFee}`);
  }
  
  // Rule 5: Not expired
  const now = Math.floor(Date.now() / 1000);
  if (now >= envelope.constraints.expiry) {
    errors.push(`Envelope expired at ${envelope.constraints.expiry}, current time ${now}`);
  }
  
  // Rule 6: Required proofs check (placeholder)
  if (envelope.requiredProofs.length > 0) {
    // TODO: Implement proof verification
    warnings.push('Proof verification not yet implemented');
  }
  
  // Rule 7: Route confidence check
  if (computeResult.selectedRoute.confidence < 0.8) {
    warnings.push(`Selected route confidence ${computeResult.selectedRoute.confidence} is below recommended threshold`);
  }
  
  const isValid = errors.length === 0;
  
  logger.audit({
    layer: 'car',
    action: 'validate',
    actor: 'system',
    data: {
      computeId: computeResult.computeId,
      intentId: envelope.intentId,
      isValid,
      errorCount: errors.length,
      warningCount: warnings.length,
    },
    outcome: isValid ? 'success' : 'rejected',
  });
  
  if (!isValid) {
    logger.warn('CAR validation FAILED', { errors });
  }
  
  return {
    isValid,
    errors,
    warnings,
  };
}

/**
 * Quick pre-validation check (before full compute)
 */
export function preValidate(
  envelope: PaymentIntentEnvelope,
  ledgerState: LedgerState
): { canProceed: boolean; reason?: string } {
  // Check expiry first (cheap check)
  const now = Math.floor(Date.now() / 1000);
  if (now >= envelope.constraints.expiry) {
    return { canProceed: false, reason: 'Envelope already expired' };
  }
  
  // Check ledger connectivity
  if (ledgerState.lastLedgerIndex === 0) {
    return { canProceed: false, reason: 'Ledger state unavailable' };
  }
  
  return { canProceed: true };
}

/**
 * Validate human override signal
 */
export function validateOverride(
  overrideSignal: string,
  expectedSignature: string
): boolean {
  // TODO: Implement cryptographic override verification
  // Human override MUST always be possible
  
  logger.info('Override signal received', { hasSignal: !!overrideSignal });
  
  return overrideSignal === expectedSignature;
}
