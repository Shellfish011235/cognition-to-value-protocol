/**
 * PQC Policy Definitions
 * 
 * Defines crypto policy types for post-quantum readiness.
 * These are constraints at the PIE layer, not crypto implementations.
 */

export type CryptoPolicyId =
  | "CLASSICAL_ONLY"
  | "HYBRID_ECDSA_SECP256K1_PLUS_DILITHIUM"
  | "HYBRID_ED25519_PLUS_DILITHIUM"
  | "PQC_ONLY_DILITHIUM" // for off-ledger attestations, not necessarily on-ledger auth
  ;

export type AttestationSuiteId =
  | "CAR_ATTEST_V1"
  | "CAR_ATTEST_V1_HYBRID"
  | "CAR_ATTEST_V1_PQC"
  ;

export interface CryptoPolicy {
  cryptoPolicy: CryptoPolicyId;
  attestationSuite: AttestationSuiteId;
  /**
   * Epoch is a monotonic counter you control (or time-bucket) to coordinate rotations.
   * This helps prevent replay and supports phased migrations.
   */
  keyEpoch: number;
  /**
   * True = require both classical + PQC signatures in attestation.
   * This is recommended during transition periods.
   */
  requireHybrid: boolean;
}

/**
 * Validate that a crypto policy is well-formed
 */
export function isValidCryptoPolicy(policy: CryptoPolicy): boolean {
  if (!policy.cryptoPolicy) return false;
  if (!policy.attestationSuite) return false;
  if (typeof policy.keyEpoch !== 'number' || policy.keyEpoch < 0) return false;
  if (typeof policy.requireHybrid !== 'boolean') return false;
  return true;
}

/**
 * Get the signature algorithms required by a policy
 */
export function getRequiredAlgorithms(policy: CryptoPolicyId): {
  classical: string[];
  pqc: string[];
} {
  switch (policy) {
    case "CLASSICAL_ONLY":
      return { classical: ["ed25519", "secp256k1"], pqc: [] };
    case "HYBRID_ECDSA_SECP256K1_PLUS_DILITHIUM":
      return { classical: ["secp256k1"], pqc: ["dilithium2", "dilithium3", "dilithium5"] };
    case "HYBRID_ED25519_PLUS_DILITHIUM":
      return { classical: ["ed25519"], pqc: ["dilithium2", "dilithium3", "dilithium5"] };
    case "PQC_ONLY_DILITHIUM":
      return { classical: [], pqc: ["dilithium2", "dilithium3", "dilithium5"] };
    default:
      return { classical: [], pqc: [] };
  }
}
