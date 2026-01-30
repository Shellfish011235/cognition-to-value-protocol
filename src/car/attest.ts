/**
 * CAR - Attest
 * 
 * Cryptographic signing and attestation. NO AI/ML ALLOWED.
 * 
 * INVARIANT: All envelopes must be cryptographically attested before routing.
 */

import { createLogger } from '../utils/logging';
import { 
  PaymentIntentEnvelope, 
  ValidationResult, 
  AttestationRecord 
} from '../utils/types';
import { 
  createAttestation, 
  verifyAttestation,
  hashEnvelope 
} from '../utils/crypto';
import { ComputeResult } from './compute';

const logger = createLogger('car');

export interface AttestationConfig {
  signingKeyPath: string;
  requireMultiSig: boolean;
  minSignatures: number;
}

export interface AttestResult {
  attestId: string;
  timestamp: number;
  envelope: PaymentIntentEnvelope;
  computeResult: ComputeResult;
  validationResult: ValidationResult;
  attestation: AttestationRecord;
  attestationChain: AttestationRecord[];
}

/**
 * Attest a validated envelope
 * 
 * CRITICAL: Only valid envelopes may be attested.
 * Attestation is the final gate before routing.
 */
export function attest(
  envelope: PaymentIntentEnvelope,
  computeResult: ComputeResult,
  validationResult: ValidationResult,
  privateKey: string,
  publicKey: string
): AttestResult | null {
  logger.info('Attesting envelope', { intentId: envelope.intentId });
  
  // CRITICAL: Cannot attest invalid envelopes
  if (!validationResult.isValid) {
    logger.error('Cannot attest invalid envelope', {
      intentId: envelope.intentId,
      errors: validationResult.errors,
    });
    return null;
  }
  
  // Create attestation record
  const attestation = createAttestation(envelope, privateKey, publicKey);
  
  // Build attestation chain (for audit trail)
  const attestationChain: AttestationRecord[] = [attestation];
  
  const result: AttestResult = {
    attestId: `attest-${Date.now()}`,
    timestamp: Date.now(),
    envelope,
    computeResult,
    validationResult,
    attestation,
    attestationChain,
  };
  
  logger.audit({
    layer: 'car',
    action: 'attest',
    actor: 'system',
    data: {
      attestId: result.attestId,
      intentId: envelope.intentId,
      attestationId: attestation.attestationId,
      validationHash: attestation.validationHash,
    },
    outcome: 'success',
  });
  
  return result;
}

/**
 * Verify an existing attestation
 */
export function verifyAttest(
  envelope: PaymentIntentEnvelope,
  attestation: AttestationRecord
): boolean {
  logger.info('Verifying attestation', { attestationId: attestation.attestationId });
  
  const isValid = verifyAttestation(envelope, attestation);
  
  logger.audit({
    layer: 'car',
    action: 'verifyAttest',
    actor: 'system',
    data: {
      attestationId: attestation.attestationId,
      isValid,
    },
    outcome: isValid ? 'success' : 'rejected',
  });
  
  return isValid;
}

/**
 * Create attestation hash for logging
 */
export function createAttestationHash(
  envelope: PaymentIntentEnvelope,
  validationResult: ValidationResult
): string {
  const combined = {
    envelopeHash: hashEnvelope(envelope),
    validationErrors: validationResult.errors,
    validationWarnings: validationResult.warnings,
    timestamp: Date.now(),
  };
  
  return hashEnvelope(combined as unknown as PaymentIntentEnvelope);
}

/**
 * Check if attestation is still valid (not expired)
 */
export function isAttestationValid(
  attestation: AttestationRecord,
  maxAge: number = 300000 // 5 minutes default
): boolean {
  const age = Date.now() - attestation.timestamp;
  return age < maxAge;
}

/**
 * Revoke an attestation (for emergency use)
 */
export interface RevocationRecord {
  revocationId: string;
  attestationId: string;
  timestamp: number;
  reason: string;
  revokedBy: string;
}

export function revokeAttestation(
  attestation: AttestationRecord,
  reason: string,
  revokedBy: string
): RevocationRecord {
  const revocation: RevocationRecord = {
    revocationId: `revoke-${Date.now()}`,
    attestationId: attestation.attestationId,
    timestamp: Date.now(),
    reason,
    revokedBy,
  };
  
  logger.audit({
    layer: 'car',
    action: 'revokeAttestation',
    actor: revokedBy,
    data: revocation,
    outcome: 'success',
  });
  
  logger.warn('Attestation revoked', revocation);
  
  return revocation;
}
