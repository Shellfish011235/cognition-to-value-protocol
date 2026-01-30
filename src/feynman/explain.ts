/**
 * FEYNMAN - Explain
 * 
 * Generates human-readable explanations for proposed actions.
 * 
 * INVARIANT: If it cannot be explained simply, it does not execute.
 */

import { createLogger } from '../utils/logging';
import { PaymentIntentEnvelope, ExplanationResult } from '../utils/types';

const logger = createLogger('feynman');

export interface ExplanationRequest {
  envelope: Partial<PaymentIntentEnvelope>;
  context: Record<string, unknown>;
  depth: 'brief' | 'standard' | 'detailed';
}

/**
 * Generate explanation for a proposed action
 * 
 * Named after Richard Feynman: "If you can't explain it simply,
 * you don't understand it well enough."
 */
export function explain(request: ExplanationRequest): ExplanationResult {
  logger.info('Generating explanation', { depth: request.depth });
  
  const { envelope, context } = request;
  
  // Attempt to construct simple explanation
  const simplifiedRationale = constructRationale(envelope, context);
  const isExplainable = validateExplainability(simplifiedRationale);
  const sources = extractSourceReferences(context);
  
  const result: ExplanationResult = {
    isExplainable,
    simplifiedRationale,
    verificationStatus: isExplainable ? 'unverified' : 'rejected',
    sourceReferences: sources,
  };
  
  logger.audit({
    layer: 'feynman',
    action: 'explain',
    actor: 'system',
    data: {
      isExplainable,
      rationaleLength: simplifiedRationale.length,
      sourceCount: sources.length,
    },
    outcome: isExplainable ? 'success' : 'rejected',
  });
  
  return result;
}

/**
 * Construct human-readable rationale
 */
function constructRationale(
  envelope: Partial<PaymentIntentEnvelope>,
  context: Record<string, unknown>
): string {
  const parts: string[] = [];
  
  if (envelope.action) {
    parts.push(`Action: ${envelope.action}`);
  }
  
  if (envelope.amount) {
    parts.push(`Amount: ${envelope.amount.value} ${envelope.amount.currency}`);
  }
  
  if (envelope.destination) {
    parts.push(`To: ${truncateAddress(envelope.destination)}`);
  }
  
  if (envelope.explanation) {
    parts.push(`Reason: ${envelope.explanation}`);
  }
  
  if (parts.length === 0) {
    return 'Insufficient information to explain this action.';
  }
  
  return parts.join(' | ');
}

/**
 * Truncate address for readability
 */
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validate that explanation meets Feynman standard
 */
function validateExplainability(rationale: string): boolean {
  // Criteria for valid explanation:
  // 1. Not empty
  // 2. Not too long (should be simple)
  // 3. Contains actionable information
  
  if (!rationale || rationale.length < 10) return false;
  if (rationale.length > 500) return false; // Too complex
  if (rationale.includes('Insufficient information')) return false;
  
  return true;
}

/**
 * Extract verifiable source references from context
 */
function extractSourceReferences(context: Record<string, unknown>): string[] {
  const sources: string[] = [];
  
  // TODO: Implement actual source extraction
  // Should trace back to original data sources
  
  if (context.observationId) {
    sources.push(`observation:${context.observationId}`);
  }
  
  if (context.decisionId) {
    sources.push(`decision:${context.decisionId}`);
  }
  
  return sources;
}

/**
 * Format explanation for display
 */
export function formatExplanation(result: ExplanationResult): string {
  const status = result.isExplainable ? '✓' : '✗';
  return `[${status}] ${result.simplifiedRationale}`;
}
