/**
 * PQC Hash Functions
 * 
 * Cryptographic hashing for envelope attestation.
 * Uses SHA3-256 as the primary hash function.
 */

import { createHash } from "crypto";

/**
 * Use SHA3-256 for envelope hashing.
 * Node supports "sha3-256" in modern versions; if not available in your runtime,
 * replace with a vetted SHA3 library and keep this function signature the same.
 */
export function sha3_256(data: Uint8Array): Buffer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const h = createHash("sha3-256" as any);
  h.update(data);
  return h.digest();
}

/**
 * SHA-256 for compatibility / anchoring
 */
export function sha256(data: Uint8Array): Buffer {
  const h = createHash("sha256");
  h.update(data);
  return h.digest();
}

/**
 * Create a commitment hash for on-ledger anchoring
 */
export function createCommitmentHash(attestationJson: string): string {
  const h = createHash("sha256");
  h.update(attestationJson);
  return h.digest("hex");
}

/**
 * Verify a commitment hash
 */
export function verifyCommitmentHash(attestationJson: string, expectedHash: string): boolean {
  const computed = createCommitmentHash(attestationJson);
  return computed === expectedHash;
}
