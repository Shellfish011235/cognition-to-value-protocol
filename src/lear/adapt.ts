/**
 * LEAR - Adapt
 * 
 * Adjusts decision parameters within bounded ranges.
 * 
 * INVARIANT: Adaptation may adjust HOW decisions are made.
 * It may NEVER change WHAT is enforced (that's PIE/CAR territory).
 */

import { createLogger } from '../utils/logging';
import { AdaptationParams } from '../utils/types';
import { Evaluation, ParameterAssessment } from './evaluate';

const logger = createLogger('lear');

export interface Adaptation {
  adaptationId: string;
  timestamp: number;
  evaluation: Evaluation;
  changes: ParameterChange[];
  applied: boolean;
}

export interface ParameterChange {
  paramId: string;
  previousValue: number;
  newValue: number;
  rationale: string;
}

/**
 * Adapt parameters based on evaluation
 * 
 * CRITICAL: All adaptations MUST respect bounds
 */
export function adapt(
  evaluation: Evaluation,
  currentParams: AdaptationParams[]
): Adaptation {
  logger.info('Adapting parameters', { evaluationId: evaluation.evaluationId });
  
  const changes: ParameterChange[] = [];
  
  for (const assessment of evaluation.assessments) {
    const param = currentParams.find(p => p.paramId === assessment.paramId);
    if (!param) continue;
    
    if (assessment.suggestedDirection === 'maintain') continue;
    if (assessment.confidence < 0.6) continue; // Don't adapt on low confidence
    
    const change = calculateChange(param, assessment);
    if (change) {
      changes.push(change);
    }
  }
  
  const adaptation: Adaptation = {
    adaptationId: `adapt-${Date.now()}`,
    timestamp: Date.now(),
    evaluation,
    changes,
    applied: false, // Set to true after reinforce()
  };
  
  logger.audit({
    layer: 'lear',
    action: 'adapt',
    actor: 'system',
    data: {
      adaptationId: adaptation.adaptationId,
      changeCount: changes.length,
    },
    outcome: 'success',
  });
  
  return adaptation;
}

/**
 * Calculate bounded parameter change
 */
function calculateChange(
  param: AdaptationParams,
  assessment: ParameterAssessment
): ParameterChange | null {
  // Calculate delta respecting adaptation rate
  const maxDelta = (param.maxBound - param.minBound) * param.adaptationRate;
  const targetValue = assessment.suggestedValue;
  const delta = Math.max(-maxDelta, Math.min(maxDelta, targetValue - param.currentValue));
  
  let newValue = param.currentValue + delta;
  
  // CRITICAL: Enforce bounds
  newValue = Math.max(param.minBound, Math.min(param.maxBound, newValue));
  
  // Don't create change if value unchanged
  if (newValue === param.currentValue) {
    return null;
  }
  
  return {
    paramId: param.paramId,
    previousValue: param.currentValue,
    newValue,
    rationale: assessment.rationale,
  };
}

/**
 * Apply adaptation to parameters (returns new params, does not mutate)
 */
export function applyAdaptation(
  params: AdaptationParams[],
  adaptation: Adaptation
): AdaptationParams[] {
  return params.map(param => {
    const change = adaptation.changes.find(c => c.paramId === param.paramId);
    if (!change) return param;
    
    return {
      ...param,
      currentValue: change.newValue,
    };
  });
}

/**
 * Validate that adaptation respects all bounds
 */
export function validateAdaptation(
  adaptation: Adaptation,
  params: AdaptationParams[]
): boolean {
  for (const change of adaptation.changes) {
    const param = params.find(p => p.paramId === change.paramId);
    if (!param) return false;
    
    if (change.newValue < param.minBound || change.newValue > param.maxBound) {
      logger.error('Adaptation violates bounds', {
        paramId: change.paramId,
        newValue: change.newValue,
        bounds: [param.minBound, param.maxBound],
      });
      return false;
    }
  }
  
  return true;
}
