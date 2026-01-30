/**
 * PIE - Envelope Validation
 * 
 * Validates Payment Intent Envelopes beyond schema compliance.
 * 
 * INVARIANT: All envelopes must pass validation before CAR processing.
 */

import { createLogger } from '../utils/logging';
import { PaymentIntentEnvelope, ValidationResult } from '../utils/types';
import { validatePIESchema, isExpired, PIESchema } from './pie.schema';

const logger = createLogger('pie');

export interface ValidationConfig {
  maxAmount: string;
  minAmount: string;
  allowedCurrencies: string[];
  allowedActions: string[];
  requireExplanation: boolean;
  maxSlippageLimit: number;
}

const DEFAULT_CONFIG: ValidationConfig = {
  maxAmount: '1000000',
  minAmount: '0.000001',
  allowedCurrencies: ['XRP', 'USD'],
  allowedActions: ['send', 'swap', 'batch'],
  requireExplanation: true,
  maxSlippageLimit: 0.05, // 5%
};

/**
 * Validate a Payment Intent Envelope
 */
export function validateEnvelope(
  envelope: unknown,
  config: ValidationConfig = DEFAULT_CONFIG
): ValidationResult {
  logger.info('Validating PIE envelope');
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Step 1: Schema validation
  const schemaResult = validatePIESchema(envelope);
  if (!schemaResult.valid) {
    const schemaErrors = schemaResult.errors?.errors.map(e => 
      `${e.path.join('.')}: ${e.message}`
    ) || ['Schema validation failed'];
    
    return {
      isValid: false,
      errors: schemaErrors,
      warnings: [],
    };
  }
  
  const validEnvelope = schemaResult.envelope as PIESchema;
  
  // Step 2: Business rule validation
  
  // Check expiry
  if (isExpired(validEnvelope)) {
    errors.push('Envelope has expired');
  }
  
  // Check amount bounds
  const amount = parseFloat(validEnvelope.amount.value);
  const maxAmount = parseFloat(config.maxAmount);
  const minAmount = parseFloat(config.minAmount);
  
  if (amount > maxAmount) {
    errors.push(`Amount ${amount} exceeds maximum ${maxAmount}`);
  }
  
  if (amount < minAmount) {
    errors.push(`Amount ${amount} below minimum ${minAmount}`);
  }
  
  // Check currency
  if (!config.allowedCurrencies.includes(validEnvelope.amount.currency)) {
    errors.push(`Currency ${validEnvelope.amount.currency} not allowed`);
  }
  
  // Check action
  if (!config.allowedActions.includes(validEnvelope.action)) {
    errors.push(`Action ${validEnvelope.action} not allowed`);
  }
  
  // Check slippage
  if (validEnvelope.constraints.maxSlippage > config.maxSlippageLimit) {
    warnings.push(`Slippage ${validEnvelope.constraints.maxSlippage} exceeds recommended limit`);
  }
  
  // Check explanation requirement
  if (config.requireExplanation && validEnvelope.explanation.length < 20) {
    errors.push('Explanation too short (minimum 20 characters)');
  }
  
  // Check routes
  if (validEnvelope.allowedRoutes.length === 0) {
    warnings.push('No allowed routes specified - will use default routing');
  }
  
  const isValid = errors.length === 0;
  
  logger.audit({
    layer: 'pie',
    action: 'validateEnvelope',
    actor: 'system',
    data: {
      intentId: validEnvelope.intentId,
      isValid,
      errorCount: errors.length,
      warningCount: warnings.length,
    },
    outcome: isValid ? 'success' : 'rejected',
  });
  
  return {
    isValid,
    errors,
    warnings,
  };
}

/**
 * Validate that envelope matches expected intent
 */
export function validateIntent(
  envelope: PaymentIntentEnvelope,
  expectedAction: string,
  expectedDestination: string
): ValidationResult {
  const errors: string[] = [];
  
  if (envelope.action !== expectedAction) {
    errors.push(`Action mismatch: expected ${expectedAction}, got ${envelope.action}`);
  }
  
  if (envelope.destination !== expectedDestination) {
    errors.push(`Destination mismatch: expected ${expectedDestination}, got ${envelope.destination}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}

/**
 * Check if envelope can be retried (not expired, no permanent errors)
 */
export function canRetry(
  envelope: PaymentIntentEnvelope,
  previousResult: ValidationResult
): boolean {
  // Cannot retry if expired
  if (isExpired(envelope as unknown as PIESchema)) {
    return false;
  }
  
  // Cannot retry permanent errors
  const permanentErrors = [
    'not allowed',
    'exceeds maximum',
    'below minimum',
  ];
  
  return !previousResult.errors.some(error =>
    permanentErrors.some(pe => error.toLowerCase().includes(pe))
  );
}
