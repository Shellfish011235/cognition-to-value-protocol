/**
 * LEAR - Reinforce
 * 
 * Commits validated adaptations and provides feedback.
 * 
 * INVARIANT: Reinforcement is the final step before adaptation takes effect.
 * It must validate bounds one more time before committing.
 */

import { createLogger } from '../utils/logging';
import { AdaptationParams } from '../utils/types';
import { Adaptation, applyAdaptation, validateAdaptation } from './adapt';

const logger = createLogger('lear');

export interface ReinforcementResult {
  reinforcementId: string;
  timestamp: number;
  adaptation: Adaptation;
  success: boolean;
  newParams: AdaptationParams[];
  feedback: string;
}

/**
 * Reinforce (commit) an adaptation
 * 
 * Final validation and commitment of parameter changes
 */
export function reinforce(
  adaptation: Adaptation,
  currentParams: AdaptationParams[]
): ReinforcementResult {
  logger.info('Reinforcing adaptation', { adaptationId: adaptation.adaptationId });
  
  // Final bounds check
  if (!validateAdaptation(adaptation, currentParams)) {
    logger.error('Reinforcement rejected - bounds violation');
    
    return {
      reinforcementId: `reinforce-${Date.now()}`,
      timestamp: Date.now(),
      adaptation,
      success: false,
      newParams: currentParams, // No change
      feedback: 'Adaptation rejected due to bounds violation',
    };
  }
  
  // Apply the adaptation
  const newParams = applyAdaptation(currentParams, adaptation);
  
  const result: ReinforcementResult = {
    reinforcementId: `reinforce-${Date.now()}`,
    timestamp: Date.now(),
    adaptation: { ...adaptation, applied: true },
    success: true,
    newParams,
    feedback: `Successfully applied ${adaptation.changes.length} parameter changes`,
  };
  
  logger.audit({
    layer: 'lear',
    action: 'reinforce',
    actor: 'system',
    data: {
      reinforcementId: result.reinforcementId,
      success: result.success,
      changeCount: adaptation.changes.length,
    },
    outcome: result.success ? 'success' : 'rejected',
  });
  
  return result;
}

/**
 * Create negative reinforcement (rollback signal)
 */
export function negativeReinforce(
  adaptation: Adaptation,
  reason: string
): ReinforcementResult {
  logger.warn('Negative reinforcement triggered', { 
    adaptationId: adaptation.adaptationId,
    reason,
  });
  
  return {
    reinforcementId: `reinforce-neg-${Date.now()}`,
    timestamp: Date.now(),
    adaptation,
    success: false,
    newParams: [], // Caller should use previous params
    feedback: `Negative reinforcement: ${reason}`,
  };
}

/**
 * Track reinforcement history for meta-learning
 */
export interface ReinforcementHistory {
  results: ReinforcementResult[];
  successRate: number;
  lastSuccess: number | null;
}

export function trackReinforcement(
  history: ReinforcementHistory,
  result: ReinforcementResult
): ReinforcementHistory {
  const results = [...history.results, result];
  const successCount = results.filter(r => r.success).length;
  
  return {
    results,
    successRate: successCount / results.length,
    lastSuccess: result.success ? result.timestamp : history.lastSuccess,
  };
}
