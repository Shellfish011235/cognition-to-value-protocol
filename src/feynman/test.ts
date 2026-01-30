/**
 * FEYNMAN - Test
 * 
 * Verifies claims against source data.
 * 
 * INVARIANT: All claims must be traceable to verifiable sources.
 * Fabricated justifications are rejected.
 */

import { createLogger } from '../utils/logging';
import { ExplanationResult } from '../utils/types';

const logger = createLogger('feynman');

export interface TestRequest {
  explanation: ExplanationResult;
  claims: Claim[];
  availableSources: DataSource[];
}

export interface Claim {
  claimId: string;
  statement: string;
  requiredEvidence: string;
}

export interface DataSource {
  sourceId: string;
  type: 'observation' | 'ledger' | 'external' | 'computed';
  data: Record<string, unknown>;
  timestamp: number;
  reliability: number;
}

export interface TestResult {
  testId: string;
  explanation: ExplanationResult;
  claimResults: ClaimTestResult[];
  overallVerified: boolean;
  confidence: number;
}

export interface ClaimTestResult {
  claimId: string;
  verified: boolean;
  evidence: string | null;
  sourceId: string | null;
  reason: string;
}

/**
 * Test an explanation's claims against available sources
 */
export function test(request: TestRequest): TestResult {
  logger.info('Testing explanation claims', {
    claimCount: request.claims.length,
    sourceCount: request.availableSources.length,
  });
  
  const claimResults = request.claims.map(claim =>
    verifyClaim(claim, request.availableSources)
  );
  
  const verifiedCount = claimResults.filter(r => r.verified).length;
  const overallVerified = verifiedCount === request.claims.length;
  const confidence = request.claims.length > 0 
    ? verifiedCount / request.claims.length 
    : 0;
  
  const result: TestResult = {
    testId: `test-${Date.now()}`,
    explanation: {
      ...request.explanation,
      verificationStatus: overallVerified ? 'verified' : 'rejected',
    },
    claimResults,
    overallVerified,
    confidence,
  };
  
  logger.audit({
    layer: 'feynman',
    action: 'test',
    actor: 'system',
    data: {
      testId: result.testId,
      overallVerified,
      confidence,
      verifiedCount,
      totalClaims: request.claims.length,
    },
    outcome: overallVerified ? 'success' : 'rejected',
  });
  
  return result;
}

/**
 * Verify a single claim against sources
 */
function verifyClaim(claim: Claim, sources: DataSource[]): ClaimTestResult {
  logger.debug('Verifying claim', { claimId: claim.claimId });
  
  // Try to find supporting evidence in sources
  for (const source of sources) {
    const evidence = findEvidence(claim, source);
    if (evidence) {
      return {
        claimId: claim.claimId,
        verified: true,
        evidence,
        sourceId: source.sourceId,
        reason: `Verified against ${source.type} source`,
      };
    }
  }
  
  // No evidence found
  return {
    claimId: claim.claimId,
    verified: false,
    evidence: null,
    sourceId: null,
    reason: 'No supporting evidence found in available sources',
  };
}

/**
 * Find evidence for a claim in a data source
 */
function findEvidence(claim: Claim, source: DataSource): string | null {
  // TODO: Implement actual evidence matching
  // Should use semantic similarity or exact matching based on claim type
  
  // Simple keyword check for now
  const sourceString = JSON.stringify(source.data).toLowerCase();
  const requiredEvidence = claim.requiredEvidence.toLowerCase();
  
  if (sourceString.includes(requiredEvidence)) {
    return `Found "${claim.requiredEvidence}" in source data`;
  }
  
  return null;
}

/**
 * Extract testable claims from an explanation
 */
export function extractClaims(explanation: ExplanationResult): Claim[] {
  // TODO: Implement claim extraction using NLP
  // Should identify factual assertions that can be verified
  
  const claims: Claim[] = [];
  
  // Simple extraction: treat each source reference as a claim
  for (const ref of explanation.sourceReferences) {
    claims.push({
      claimId: `claim-${claims.length}`,
      statement: `Referenced ${ref}`,
      requiredEvidence: ref,
    });
  }
  
  return claims;
}

/**
 * Check if a test result meets minimum confidence threshold
 */
export function meetsConfidenceThreshold(
  result: TestResult,
  threshold: number
): boolean {
  return result.confidence >= threshold;
}
