/**
 * PQC Attestation Types
 * 
 * Defines the structure of hybrid (classical + PQC) attestations.
 */

import { CryptoPolicyId, AttestationSuiteId } from "./policy";

export interface CarAttestation {
  attestationId: string;              // UUID
  suite: AttestationSuiteId;          // e.g. CAR_ATTEST_V1_HYBRID
  cryptoPolicy: CryptoPolicyId;       // matches PIE.cryptoPolicy
  keyEpoch: number;                   // matches PIE.keyEpoch
  createdAt: number;                  // unix ms
  envelopeHashHex: string;            // SHA3-256(PIE canonical bytes)
  /**
   * Hybrid attestation fields:
   * - classicalSig: optional if PQC-only policy
   * - pqcSig: required for PQC or hybrid policies
   */
  classicalSig?: {
    alg: "ed25519" | "secp256k1";
    publicKeyHex: string;
    signatureHex: string;
  };
  pqcSig?: {
    alg: "dilithium2" | "dilithium3" | "dilithium5" | "falcon512" | "falcon1024" | "sphincs_sha256_128f";
    publicKeyHex: string;
    signatureHex: string;
  };
  /**
   * Optional metadata (kept minimal—avoid leaking secrets).
   */
  meta?: Record<string, string>;
}

/**
 * Validate attestation structure (not cryptographic validity)
 */
export function isValidAttestationStructure(attestation: CarAttestation): boolean {
  if (!attestation.attestationId) return false;
  if (!attestation.suite) return false;
  if (!attestation.cryptoPolicy) return false;
  if (typeof attestation.keyEpoch !== 'number') return false;
  if (typeof attestation.createdAt !== 'number') return false;
  if (!attestation.envelopeHashHex) return false;
  
  // For hybrid policies, both signatures should be present
  if (attestation.cryptoPolicy.includes('HYBRID')) {
    if (!attestation.classicalSig || !attestation.pqcSig) return false;
  }
  
  // For PQC-only policies, PQC signature must be present
  if (attestation.cryptoPolicy.includes('PQC_ONLY')) {
    if (!attestation.pqcSig) return false;
  }
  
  return true;
}

/**
 * Check if attestation has expired based on max age
 */
export function isAttestationExpired(attestation: CarAttestation, maxAgeMs: number): boolean {
  return Date.now() - attestation.createdAt > maxAgeMs;
}

/**
 * Get attestation age in milliseconds
 */
export function getAttestationAge(attestation: CarAttestation): number {
  return Date.now() - attestation.createdAt;
}
