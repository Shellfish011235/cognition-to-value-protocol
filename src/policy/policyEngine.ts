import type { AgentIdentity } from '../identity/agentIdentity';
import { isAgentIdentityActive } from '../identity/agentIdentity';
import type { CapabilityEnvelope } from '../pie/capabilityEnvelope';
import type { ShadowComparison } from '../ooda/shadow';
import type { SignedCapabilityEnvelope } from '../security/signatures';
import { verifySignedCapabilityEnvelope } from '../security/signatures';

export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_HUMAN' | 'SIMULATE_FIRST';

export interface PolicyContext {
  now?: number;
  identity: AgentIdentity;
  signedCapability: SignedCapabilityEnvelope;
  shadow?: ShadowComparison;
  revokedAgentIds?: Set<string>;
  revokedIntentIds?: Set<string>;
  highImpactPatterns?: RegExp[];
  simulationImpactPatterns?: RegExp[];
}

export interface PolicyResult {
  decision: PolicyDecision;
  reasons: string[];
}

function actionAllowedByIdentity(identity: AgentIdentity, envelope: CapabilityEnvelope): boolean {
  return identity.capabilityProfile.includes(envelope.action);
}

function toolsAllowedByIdentity(identity: AgentIdentity, envelope: CapabilityEnvelope): boolean {
  return envelope.allowedTools.every((tool) => identity.allowedTools.includes(tool));
}

function matchesAny(value: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

export function evaluatePolicy(context: PolicyContext): PolicyResult {
  const now = context.now ?? Date.now();
  const { identity, signedCapability, shadow } = context;
  const envelope = signedCapability.envelope;
  const reasons: string[] = [];

  if (context.revokedAgentIds?.has(identity.agentId)) reasons.push('agent identity revoked');
  if (context.revokedIntentIds?.has(envelope.intentId)) reasons.push('capability intent revoked');
  if (!isAgentIdentityActive(identity, now)) reasons.push('agent identity inactive or expired');
  if (identity.agentId !== envelope.agentId || identity.agentId !== signedCapability.signerAgentId) {
    reasons.push('agent identity does not match capability signer/requester');
  }
  if (now >= envelope.constraints.expiresAt) reasons.push('capability envelope expired');
  if (!verifySignedCapabilityEnvelope(signedCapability, identity.publicKey)) reasons.push('invalid capability signature');
  if (!actionAllowedByIdentity(identity, envelope)) reasons.push('action outside agent capability profile');
  if (!toolsAllowedByIdentity(identity, envelope)) reasons.push('requested tool outside agent allowlist');
  if (envelope.prohibitedActions.includes(envelope.action)) reasons.push('requested action is explicitly prohibited');

  if (reasons.length > 0) return { decision: 'DENY', reasons };

  const highImpactPatterns = context.highImpactPatterns ?? [/delete/i, /transfer_all/i, /disable.*security/i];
  if (matchesAny(envelope.action, highImpactPatterns) || matchesAny(envelope.constraints.maxImpact, highImpactPatterns)) {
    return { decision: 'REQUIRE_HUMAN', reasons: ['high-impact action requires human approval'] };
  }

  if (shadow?.requiresReview) {
    return { decision: 'REQUIRE_HUMAN', reasons: ['primary and shadow OODA materially diverge'] };
  }

  const simulationImpactPatterns = context.simulationImpactPatterns ?? [/network/i, /multi/i, /system/i, /ledger-wide/i];
  if (matchesAny(envelope.constraints.maxImpact, simulationImpactPatterns)) {
    return { decision: 'SIMULATE_FIRST', reasons: ['blast radius requires pre-action simulation'] };
  }

  const additionalApprovals = envelope.requiredApprovals.filter((approval) => approval !== 'policy-engine');
  if (additionalApprovals.length > 0) {
    return { decision: 'REQUIRE_HUMAN', reasons: [`additional approvals required: ${additionalApprovals.join(', ')}`] };
  }

  return { decision: 'ALLOW', reasons: ['identity, signature, scope, tools, expiry, and OODA checks passed'] };
}
