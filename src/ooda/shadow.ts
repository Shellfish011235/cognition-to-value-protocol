export interface OODAOutcome {
  hypothesis: string;
  confidence: number;
  expectedEffects: string[];
  evidenceIds: string[];
}

export interface ShadowComparison {
  divergence: number;
  hypothesisMatch: boolean;
  missingEvidence: string[];
  unexpectedEffects: string[];
  requiresReview: boolean;
}

export function comparePrimaryToShadow(
  primary: OODAOutcome,
  shadow: OODAOutcome,
  reviewThreshold = 0.35,
): ShadowComparison {
  const confidenceGap = Math.abs(primary.confidence - shadow.confidence);
  const hypothesisMatch = primary.hypothesis === shadow.hypothesis;
  const primaryEffects = new Set(primary.expectedEffects);
  const shadowEffects = new Set(shadow.expectedEffects);
  const union = new Set([...primary.expectedEffects, ...shadow.expectedEffects]);
  const overlap = [...primaryEffects].filter((effect) => shadowEffects.has(effect)).length;
  const effectDivergence = union.size === 0 ? 0 : 1 - overlap / union.size;
  const divergence = Math.min(1, (confidenceGap + effectDivergence + (hypothesisMatch ? 0 : 1)) / 3);

  return {
    divergence,
    hypothesisMatch,
    missingEvidence: shadow.evidenceIds.filter((id) => !primary.evidenceIds.includes(id)),
    unexpectedEffects: shadow.expectedEffects.filter((effect) => !primary.expectedEffects.includes(effect)),
    requiresReview: divergence >= reviewThreshold,
  };
}
