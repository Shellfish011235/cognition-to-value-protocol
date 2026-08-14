import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import type { CapabilityEnvelope } from '../pie/capabilityEnvelope';

export type SignatureAlgorithm = 'ed25519';

export interface SignedCapabilityEnvelope {
  envelope: CapabilityEnvelope;
  algorithm: SignatureAlgorithm;
  signerAgentId: string;
  signature: string;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== 'signature')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

export function capabilitySigningPayload(envelope: CapabilityEnvelope, signerAgentId: string): Buffer {
  return Buffer.from(JSON.stringify(canonicalize({ signerAgentId, envelope })), 'utf8');
}

export function signCapabilityEnvelope(
  envelope: CapabilityEnvelope,
  signerAgentId: string,
  privateKeyPem: string,
): SignedCapabilityEnvelope {
  const payload = capabilitySigningPayload(envelope, signerAgentId);
  const signature = sign(null, payload, createPrivateKey(privateKeyPem)).toString('base64');
  return { envelope, algorithm: 'ed25519', signerAgentId, signature };
}

export function verifySignedCapabilityEnvelope(
  signed: SignedCapabilityEnvelope,
  publicKeyPem: string,
): boolean {
  if (signed.algorithm !== 'ed25519') return false;
  const payload = capabilitySigningPayload(signed.envelope, signed.signerAgentId);
  return verify(null, payload, createPublicKey(publicKeyPem), Buffer.from(signed.signature, 'base64'));
}
