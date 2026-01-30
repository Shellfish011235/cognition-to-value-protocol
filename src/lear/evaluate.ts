/**
 * LEAR - Evaluate
 * 
 * Assesses current parameters against learned patterns.
 * 
 * INVARIANT: Evaluation is analytical only. No parameter changes here.
 */

import { createLogger } from '../utils/logging';
import { AdaptationParams } from '../utils/types';
import { LearningState, Pattern } from './learn';

const logger = createLogger('lear');

export interface Evaluation {
  evaluationId: string;
  timestamp: number;
  parameters: AdaptationParams[];
  patterns: Pattern[];
  assessments: ParameterAssessment[];
  overallHealth: 'healthy' | 'degraded' | 'critical';
}

export interface ParameterAssessment {
  paramId: string;
  currentValue: number;
  suggestedValue: number;
  suggestedDirection: 'increase' | 'decrease' | 'maintain';
  confidence: number;
  rationale: string;
}

/**
 * Evaluate current parameters against patterns
 */
export function evaluate(
  parameters: AdaptationParams[],
  learningState: LearningState
): Evaluation {
  logger.info('Evaluating parameters', { 
    paramCount: parameters.length,
    patternCount: learningState.patterns.length,
  });
  
  const assessments = parameters.map(param => 
    assessParameter(param, learningState.patterns)
  );
  
  const overallHealth = determineOverallHealth(assessments);
  
  const evaluation: Evaluation = {
    evaluationId: `eval-${Date.now()}`,
    timestamp: Date.now(),
    parameters,
    patterns: learningState.patterns,
    assessments,
    overallHealth,
  };
  
  logger.audit({
    layer: 'lear',
    action: 'evaluate',
    actor: 'system',
    data: {
      evaluationId: evaluation.evaluationId,
      overallHealth,
      assessmentCount: assessments.length,
    },
    outcome: 'success',
  });
  
  return evaluation;
}

/**
 * Assess a single parameter
 */
function assessParameter(
  param: AdaptationParams,
  patterns: Pattern[]
): ParameterAssessment {
  // TODO: Implement actual parameter assessment
  // Should consider:
  // - Historical performance at different values
  // - Pattern correlations
  // - Bound constraints
  
  // Placeholder: suggest maintaining current value
  return {
    paramId: param.paramId,
    currentValue: param.currentValue,
    suggestedValue: param.currentValue,
    suggestedDirection: 'maintain',
    confidence: 0.5,
    rationale: 'Insufficient pattern data for confident recommendation',
  };
}

/**
 * Determine overall system health from assessments
 */
function determineOverallHealth(
  assessments: ParameterAssessment[]
): 'healthy' | 'degraded' | 'critical' {
  const avgConfidence = assessments.reduce(
    (sum, a) => sum + a.confidence, 0
  ) / assessments.length;
  
  if (avgConfidence >= 0.7) return 'healthy';
  if (avgConfidence >= 0.4) return 'degraded';
  return 'critical';
}

/**
 * Check if evaluation suggests adaptation is needed
 */
export function needsAdaptation(evaluation: Evaluation): boolean {
  return evaluation.assessments.some(
    a => a.suggestedDirection !== 'maintain' && a.confidence >= 0.6
  );
}

/**
 * Get high-confidence recommendations only
 */
export function getConfidentRecommendations(
  evaluation: Evaluation,
  minConfidence: number
): ParameterAssessment[] {
  return evaluation.assessments.filter(a => a.confidence >= minConfidence);
}
