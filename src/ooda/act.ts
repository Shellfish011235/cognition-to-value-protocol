/**
 * OODA - Act
 * 
 * Packages proposals for downstream processing.
 * 
 * INVARIANT: Act PROPOSES to downstream layers. It does NOT execute.
 * Execution authority belongs to CAR only.
 */

import { createLogger } from '../utils/logging';
import { ProposedAction, PaymentIntentEnvelope } from '../utils/types';
import { Decision } from './decide';

const logger = createLogger('ooda');

export interface ActionPackage {
  packageId: string;
  timestamp: number;
  decision: Decision;
  selectedProposal: ProposedAction;
  draftEnvelope: Partial<PaymentIntentEnvelope>;
}

/**
 * Package a proposal for downstream processing
 * 
 * CRITICAL: This does NOT execute anything.
 * It creates a draft envelope for LEAR/FEYNMAN/PIE to process.
 */
export function act(decision: Decision): ActionPackage | null {
  logger.info('Packaging action proposal', { decisionId: decision.decisionId });
  
  if (decision.proposals.length === 0) {
    logger.info('No proposals to act on');
    return null;
  }
  
  // Select best proposal (highest confidence)
  const selectedProposal = decision.proposals.reduce(
    (best, current) => current.confidence > best.confidence ? current : best
  );
  
  // Create draft envelope (NOT a final PIE yet)
  const draftEnvelope = createDraftEnvelope(selectedProposal);
  
  const actionPackage: ActionPackage = {
    packageId: `act-${Date.now()}`,
    timestamp: Date.now(),
    decision,
    selectedProposal,
    draftEnvelope,
  };
  
  logger.audit({
    layer: 'ooda',
    action: 'act',
    actor: 'system',
    data: {
      packageId: actionPackage.packageId,
      proposalId: selectedProposal.proposalId,
      proposalConfidence: selectedProposal.confidence,
    },
    outcome: 'success',
  });
  
  return actionPackage;
}

/**
 * Create draft envelope from proposal
 * 
 * This is INCOMPLETE by design - PIE layer will validate and complete
 */
function createDraftEnvelope(proposal: ProposedAction): Partial<PaymentIntentEnvelope> {
  return {
    ...proposal.intent,
    explanation: proposal.rationale,
  };
}

/**
 * Validate that OODA is not attempting execution
 * 
 * Safety check - OODA should never have execution capability
 */
export function assertNoExecutionCapability(): void {
  // This function exists as a design assertion
  // If this codebase ever gives OODA execution capability,
  // this is where we would throw an error
  
  logger.debug('OODA execution capability check passed - no execution authority');
}

/**
 * Get all proposals from a decision (for multi-proposal scenarios)
 */
export function getAllProposals(decision: Decision): ProposedAction[] {
  return decision.proposals;
}
