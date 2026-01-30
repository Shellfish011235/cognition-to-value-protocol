/**
 * FEYNMAN - Reject
 * 
 * Gates unexplainable or unverifiable actions.
 * 
 * INVARIANT: Anything that cannot be clearly explained does NOT move money.
 * This is the last line of defense against hallucinations.
 */

import { createLogger } from '../utils/logging';
import { ExplanationResult, PaymentIntentEnvelope } from '../utils/types';
import { TestResult } from './test';

const logger = createLogger('feynman');

export interface RejectionDecision {
  decisionId: string;
  timestamp: number;
  action: 'approve' | 'reject';
  envelope: Partial<PaymentIntentEnvelope>;
  explanation: ExplanationResult;
  testResult?: TestResult;
  reasons: string[];
}

export interface RejectionConfig {
  requireExplainability: boolean;
  requireVerification: boolean;
  minConfidence: number;
  maxRationaleLength: number;
}

const DEFAULT_CONFIG: RejectionConfig = {
  requireExplainability: true,
  requireVerification: true,
  minConfidence: 0.7,
  maxRationaleLength: 500,
};

/**
 * Decide whether to approve or reject an action
 * 
 * This is the FEYNMAN gate - the final check before PIE processing
 */
export function reject(
  envelope: Partial<PaymentIntentEnvelope>,
  explanation: ExplanationResult,
  testResult: TestResult | undefined,
  config: RejectionConfig = DEFAULT_CONFIG
): RejectionDecision {
  logger.info('FEYNMAN gate evaluation');
  
  const reasons: string[] = [];
  let shouldReject = false;
  
  // Check 1: Explainability
  if (config.requireExplainability && !explanation.isExplainable) {
    reasons.push('Action cannot be explained simply');
    shouldReject = true;
  }
  
  // Check 2: Rationale length (complexity check)
  if (explanation.simplifiedRationale.length > config.maxRationaleLength) {
    reasons.push('Explanation too complex (exceeds max length)');
    shouldReject = true;
  }
  
  // Check 3: Verification status
  if (config.requireVerification) {
    if (explanation.verificationStatus === 'rejected') {
      reasons.push('Explanation verification failed');
      shouldReject = true;
    }
    
    if (testResult && !testResult.overallVerified) {
      reasons.push('Claims could not be verified against sources');
      shouldReject = true;
    }
  }
  
  // Check 4: Confidence threshold
  if (testResult && testResult.confidence < config.minConfidence) {
    reasons.push(`Confidence ${testResult.confidence.toFixed(2)} below threshold ${config.minConfidence}`);
    shouldReject = true;
  }
  
  // Check 5: Source references
  if (explanation.sourceReferences.length === 0) {
    reasons.push('No source references provided');
    shouldReject = true;
  }
  
  const decision: RejectionDecision = {
    decisionId: `feynman-${Date.now()}`,
    timestamp: Date.now(),
    action: shouldReject ? 'reject' : 'approve',
    envelope,
    explanation,
    testResult,
    reasons,
  };
  
  logger.audit({
    layer: 'feynman',
    action: 'reject',
    actor: 'system',
    data: {
      decisionId: decision.decisionId,
      action: decision.action,
      reasonCount: reasons.length,
      reasons,
    },
    outcome: shouldReject ? 'rejected' : 'success',
  });
  
  if (shouldReject) {
    logger.warn('FEYNMAN gate REJECTED action', { reasons });
  } else {
    logger.info('FEYNMAN gate APPROVED action');
  }
  
  return decision;
}

/**
 * Format rejection reasons for display
 */
export function formatRejection(decision: RejectionDecision): string {
  if (decision.action === 'approve') {
    return 'APPROVED: Action meets all FEYNMAN criteria';
  }
  
  return `REJECTED:\n${decision.reasons.map(r => `  - ${r}`).join('\n')}`;
}

/**
 * Check if rejection was due to hallucination detection
 */
export function isHallucinationRejection(decision: RejectionDecision): boolean {
  const hallucinationIndicators = [
    'verification failed',
    'could not be verified',
    'no source references',
  ];
  
  return decision.reasons.some(reason =>
    hallucinationIndicators.some(indicator =>
      reason.toLowerCase().includes(indicator)
    )
  );
}

/**
 * Get rejection statistics
 */
export interface RejectionStats {
  total: number;
  approved: number;
  rejected: number;
  hallucinationRejections: number;
  approvalRate: number;
}

export function calculateRejectionStats(
  decisions: RejectionDecision[]
): RejectionStats {
  const approved = decisions.filter(d => d.action === 'approve').length;
  const hallucinationRejections = decisions.filter(isHallucinationRejection).length;
  
  return {
    total: decisions.length,
    approved,
    rejected: decisions.length - approved,
    hallucinationRejections,
    approvalRate: decisions.length > 0 ? approved / decisions.length : 0,
  };
}
