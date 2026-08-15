import { canUseCapability, isExecutionMode } from '../permissions/modes';
import { XRPLIntentEnvelope, validateXRPLIntentEnvelope } from '../xrpl/xrpl-intent.schema';

export interface XRPLPolicyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const EXECUTION_TRANSACTION_TYPES = new Set([
  'Payment',
  'OfferCreate',
  'OfferCancel',
  'TrustSet',
  'EscrowCreate',
  'EscrowFinish',
  'PaymentChannelCreate',
  'PaymentChannelClaim',
  'AMMDeposit',
  'AMMWithdraw',
  'CheckCreate',
  'TicketCreate',
]);

export function validateXRPLPolicy(envelope: XRPLIntentEnvelope): XRPLPolicyValidationResult {
  const schemaResult = validateXRPLIntentEnvelope(envelope);
  const errors = [...schemaResult.errors];
  const warnings = [...schemaResult.warnings];

  if (!schemaResult.valid || !schemaResult.envelope) {
    return { isValid: false, errors, warnings };
  }

  const intent = schemaResult.envelope;
  const mode = intent.xrpl.permissionMode;
  const txType = intent.xrpl.transactionType;

  if (!canUseCapability(mode, 'create_intent') && txType && EXECUTION_TRANSACTION_TYPES.has(txType)) {
    errors.push(`Permission mode ${mode} cannot create executable XRPL intents.`);
  }

  if (!isExecutionMode(mode) && intent.xrpl.expectedSigningMethod !== 'none') {
    errors.push(`Permission mode ${mode} must not request signing method ${intent.xrpl.expectedSigningMethod}.`);
  }

  if (isExecutionMode(mode) && !canUseCapability(mode, 'submit_signed_transaction')) {
    errors.push(`Permission mode ${mode} is execution-like but lacks submit_signed_transaction capability.`);
  }

  if (intent.xrpl.policyFlags.prohibitPrivateKeyMaterial === false) {
    errors.push('XRPL safety policy must prohibit private key material.');
  }

  if (intent.xrpl.policyFlags.rejectPartialPaymentAmbiguity && intent.action === 'send') {
    warnings.push('Payment validation must verify delivered_amount after settlement and reject partial-payment ambiguity.');
  }

  if (intent.xrpl.network === 'mainnet' && mode === 'restricted_automation') {
    warnings.push('Restricted automation on mainnet requires additional caps, monitoring, and legal/security review.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
