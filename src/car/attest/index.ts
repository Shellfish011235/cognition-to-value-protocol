/**
 * CAR Attestation Module
 * 
 * Factory for selecting attestation suites based on crypto policy.
 * 
 * INVARIANT: CAR stays non-thinking. PQC is pure deterministic crypto inside CAR.
 */

import { AttestInput, AttestOutput } from "./types";
import { CryptoPolicyId } from "../../security/pqc/policy";
import { hybridEd25519DilithiumSuite } from "./suites/hybrid-ed25519-dilithium";
import { hybridEcdsaDilithiumSuite } from "./suites/hybrid-ecdsa-dilithium";

export interface CarAttestor {
  id: string;
  supports: readonly CryptoPolicyId[];
  attest(input: AttestInput): Promise<AttestOutput>;
}

/**
 * Factory: choose an attestation suite based on PIE.cryptoPolicy.
 * Keep CAR deterministic; no LLM calls. No network required.
 * 
 * INVARIANT: This is pure selection logic - no cognition.
 */
export function createAttestor(cryptoPolicy: CryptoPolicyId): CarAttestor {
  switch (cryptoPolicy) {
    case "HYBRID_ED25519_PLUS_DILITHIUM":
      return hybridEd25519DilithiumSuite;
    case "HYBRID_ECDSA_SECP256K1_PLUS_DILITHIUM":
      return hybridEcdsaDilithiumSuite;
    case "CLASSICAL_ONLY":
      // TODO: Implement classical-only attestor
      throw new Error("CLASSICAL_ONLY attestor not yet implemented");
    case "PQC_ONLY_DILITHIUM":
      // TODO: Implement PQC-only attestor
      throw new Error("PQC_ONLY_DILITHIUM attestor not yet implemented");
    default:
      throw new Error(`Unsupported cryptoPolicy for CAR attestation: ${cryptoPolicy}`);
  }
}

/**
 * List all supported crypto policies
 */
export function getSupportedPolicies(): CryptoPolicyId[] {
  return [
    "HYBRID_ED25519_PLUS_DILITHIUM",
    "HYBRID_ECDSA_SECP256K1_PLUS_DILITHIUM",
  ];
}

/**
 * Check if a policy is supported
 */
export function isPolicySupported(policy: CryptoPolicyId): boolean {
  return getSupportedPolicies().includes(policy);
}

// Re-export types
export * from "./types";
