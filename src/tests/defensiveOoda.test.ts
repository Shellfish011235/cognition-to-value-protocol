import test from 'node:test';
import assert from 'node:assert/strict';
import { isAgentIdentityActive, AgentIdentity } from '../identity/agentIdentity';
import { validateCapabilityEnvelope } from '../pie/capabilityEnvelope';
import { ProvenanceGraph } from '../trust/provenanceGraph';
import { comparePrimaryToShadow } from '../ooda/shadow';

const now = 1_700_000_000_000;

function identity(overrides: Partial<AgentIdentity> = {}): AgentIdentity {
  return {
    agentId: 'observer-1',
    version: '1.0.0',
    owner: 'shellfish',
    role: 'observer',
    publicKey: 'ed25519:test-key',
    allowedTools: ['ledger.read'],
    allowedDataScopes: ['xrpl.public'],
    capabilityProfile: ['observe'],
    issuedAt: now - 1_000,
    expiresAt: now + 60_000,
    ...overrides,
  };
}

test('AgentIdentity accepts active identity and rejects expired/not-yet-active identity', () => {
  assert.equal(isAgentIdentityActive(identity(), now), true);
  assert.equal(isAgentIdentityActive(identity({ expiresAt: now }), now), false);
  assert.equal(isAgentIdentityActive(identity({ issuedAt: now + 1 }), now), false);
});

test('CapabilityEnvelope accepts a bounded valid request', () => {
  const parsed = validateCapabilityEnvelope({
    intentId: 'intent-1',
    agentId: 'observer-1',
    action: 'rate_limit',
    target: 'ip:203.0.113.10',
    reason: 'Repeated failed authentication attempts',
    evidenceIds: ['ev-1'],
    confidence: 0.82,
    allowedTools: ['firewall.rate_limit'],
    prohibitedActions: ['delete_firewall_rules'],
    constraints: {
      maxImpact: 'single-source-ip',
      maxActions: 1,
      expiresAt: now + 60_000,
      rollbackRequired: true,
    },
    requiredApprovals: ['policy-engine'],
    rollbackProcedure: 'Remove temporary rate limit after expiry.',
  });

  assert.equal(parsed.action, 'rate_limit');
  assert.equal(parsed.constraints.maxActions, 1);
});

test('CapabilityEnvelope rejects out-of-range confidence and non-positive maxActions', () => {
  const base = {
    intentId: 'intent-2',
    agentId: 'observer-1',
    action: 'rate_limit',
    target: 'ip:203.0.113.10',
    reason: 'test',
    constraints: {
      maxImpact: 'single-source-ip',
      maxActions: 1,
      expiresAt: now + 60_000,
      rollbackRequired: true,
    },
    rollbackProcedure: 'rollback',
  };

  assert.throws(() => validateCapabilityEnvelope({ ...base, confidence: 1.1 }));
  assert.throws(() => validateCapabilityEnvelope({
    ...base,
    confidence: 0.5,
    constraints: { ...base.constraints, maxActions: 0 },
  }));
});

test('ProvenanceGraph traces downstream impact from a poisoned source', () => {
  const graph = new ProvenanceGraph();
  graph.addNode({ id: 'src-1', type: 'source', trust: 1, createdAt: now });
  graph.addNode({ id: 'ev-1', type: 'evidence', trust: 1, createdAt: now });
  graph.addNode({ id: 'hyp-1', type: 'hypothesis', trust: 0.8, createdAt: now });
  graph.addNode({ id: 'decision-1', type: 'decision', trust: 0.8, createdAt: now });
  graph.addNode({ id: 'action-1', type: 'action', trust: 0.8, createdAt: now });
  graph.addNode({ id: 'unrelated', type: 'evidence', trust: 1, createdAt: now });

  graph.addEdge({ from: 'src-1', to: 'ev-1', relation: 'produced', createdAt: now });
  graph.addEdge({ from: 'ev-1', to: 'hyp-1', relation: 'supports', createdAt: now });
  graph.addEdge({ from: 'hyp-1', to: 'decision-1', relation: 'informed', createdAt: now });
  graph.addEdge({ from: 'decision-1', to: 'action-1', relation: 'authorized', createdAt: now });

  const affected = new Set(graph.affectedBy('src-1').map((node) => node.id));
  assert.deepEqual(affected, new Set(['ev-1', 'hyp-1', 'decision-1', 'action-1']));
  assert.equal(affected.has('unrelated'), false);
});

test('ProvenanceGraph rejects invalid trust and edges with missing endpoints', () => {
  const graph = new ProvenanceGraph();
  assert.throws(() => graph.addNode({ id: 'bad', type: 'source', trust: 1.1, createdAt: now }));
  graph.addNode({ id: 'src', type: 'source', trust: 1, createdAt: now });
  assert.throws(() => graph.addEdge({ from: 'src', to: 'missing', relation: 'produced', createdAt: now }));
});

test('Shadow OODA does not require review when outcomes match closely', () => {
  const result = comparePrimaryToShadow(
    { hypothesis: 'brute-force', confidence: 0.8, expectedEffects: ['rate-limit'], evidenceIds: ['ev-1'] },
    { hypothesis: 'brute-force', confidence: 0.78, expectedEffects: ['rate-limit'], evidenceIds: ['ev-1'] },
  );

  assert.equal(result.hypothesisMatch, true);
  assert.equal(result.requiresReview, false);
});

test('Shadow OODA triggers review on materially divergent orientation', () => {
  const result = comparePrimaryToShadow(
    { hypothesis: 'brute-force', confidence: 0.9, expectedEffects: ['rate-limit'], evidenceIds: ['ev-1'] },
    { hypothesis: 'broken-automation', confidence: 0.4, expectedEffects: ['service-impact'], evidenceIds: ['ev-1', 'ev-2'] },
  );

  assert.equal(result.hypothesisMatch, false);
  assert.equal(result.requiresReview, true);
  assert.deepEqual(result.missingEvidence, ['ev-2']);
  assert.deepEqual(result.unexpectedEffects, ['service-impact']);
});
