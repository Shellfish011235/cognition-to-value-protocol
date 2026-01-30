/**
 * CAR Attestation Types
 * 
 * Input/output types for the attestation pipeline.
 */

import { PaymentIntentEnvelope } from "../../utils/types";
import { CarAttestation } from "../../security/pqc/attestation";

export interface AttestInput {
  envelope: PaymentIntentEnvelope;
  envelopeCanonicalBytes: Uint8Array; // canonical serialization produced by PIE
  keyEpoch: number;
}

export interface AttestOutput {
  attestation: CarAttestation;
  /**
   * Content-addressable commitment (optional):
   * - You may anchor this hash on XRPL (or store in your audit log).
   */
  attestationHashHex: string;
}

/**
 * Verification result for attestation
 */
export interface AttestVerifyResult {
  valid: boolean;
  classicalValid?: boolean;
  pqcValid?: boolean;
  errors: string[];
}

/**
 * Key material for signing (abstracted - could be HSM, vault, etc.)
 */
export interface SigningKeyRef {
  keyId: string;
  algorithm: string;
  publicKeyHex: string;
  // Private key is never exposed - signing happens via reference
}
