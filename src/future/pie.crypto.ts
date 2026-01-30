/**
 * PIE Crypto Policy Fields
 * 
 * Extends Payment Intent Envelope with cryptographic policy requirements.
 * This is bounded intent at the PIE layer - not crypto implementation.
 */

import { CryptoPolicy, CryptoPolicyId, AttestationSuiteId } from "../security/pqc/policy";

export interface PieCryptoFields extends CryptoPolicy {
  requiredProofs: string[]; // e.g. ["pqc_attestation:v1", "sbom:v1"]
}

/**
 * A strict validator for crypto policy fields.
 * NOTE: This is not doing cryptography; it's enforcing policy invariants at the intent layer.
 */
export function validatePieCryptoFields(input: Partial<PieCryptoFields>): asserts input is PieCryptoFields {
  if (!input.cryptoPolicy) throw new Error("PIE missing cryptoPolicy");
  if (!input.attestationSuite) throw new Error("PIE missing attestationSuite");
  if (typeof input.keyEpoch !== "number" || input.keyEpoch < 0) throw new Error("PIE invalid keyEpoch");
  if (typeof input.requireHybrid !== "boolean") throw new Error("PIE invalid requireHybrid");
  if (!Array.isArray(input.requiredProofs)) throw new Error("PIE invalid requiredProofs");
}

/**
 * Opinionated defaults for safe rollout:
 * - Start with hybrid attestations (classical + PQC) even if ledger auth stays classical.
 */
export function defaultHybridPolicy(keyEpoch: number): PieCryptoFields {
  return {
    cryptoPolicy: "HYBRID_ED25519_PLUS_DILITHIUM",
    attestationSuite: "CAR_ATTEST_V1_HYBRID",
    keyEpoch,
    requireHybrid: true,
    requiredProofs: ["pqc_attestation:v1"],
  };
}

/**
 * Classical-only policy (no PQC)
 */
export function classicalOnlyPolicy(keyEpoch: number): PieCryptoFields {
  return {
    cryptoPolicy: "CLASSICAL_ONLY",
    attestationSuite: "CAR_ATTEST_V1",
    keyEpoch,
    requireHybrid: false,
    requiredProofs: [],
  };
}

/**
 * ECDSA + Dilithium hybrid policy (XRPL-compatible classical side)
 */
export function ecdsaDilithiumPolicy(keyEpoch: number): PieCryptoFields {
  return {
    cryptoPolicy: "HYBRID_ECDSA_SECP256K1_PLUS_DILITHIUM",
    attestationSuite: "CAR_ATTEST_V1_HYBRID",
    keyEpoch,
    requireHybrid: true,
    requiredProofs: ["pqc_attestation:v1"],
  };
}

/**
 * PQC-only policy (for off-ledger attestations where classical is not needed)
 */
export function pqcOnlyPolicy(keyEpoch: number): PieCryptoFields {
  return {
    cryptoPolicy: "PQC_ONLY_DILITHIUM",
    attestationSuite: "CAR_ATTEST_V1_PQC",
    keyEpoch,
    requireHybrid: false,
    requiredProofs: ["pqc_attestation:v1"],
  };
}
