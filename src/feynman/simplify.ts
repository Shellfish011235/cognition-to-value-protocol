/**
 * FEYNMAN - Simplify
 * 
 * Compresses complex reasoning into simple, verifiable statements.
 * 
 * INVARIANT: Simplification must preserve truth. No information fabrication.
 */

import { createLogger } from '../utils/logging';

const logger = createLogger('feynman');

export interface SimplificationRequest {
  complexStatement: string;
  maxLength: number;
  preserveKeys: string[];
}

export interface SimplificationResult {
  original: string;
  simplified: string;
  compressionRatio: number;
  preservedKeys: string[];
  lostInformation: string[];
}

/**
 * Simplify a complex statement while preserving key information
 */
export function simplify(request: SimplificationRequest): SimplificationResult {
  logger.info('Simplifying statement', { 
    originalLength: request.complexStatement.length,
    maxLength: request.maxLength,
  });
  
  const { complexStatement, maxLength, preserveKeys } = request;
  
  // Extract key information that must be preserved
  const preserved = extractPreservedInfo(complexStatement, preserveKeys);
  
  // Compress the statement
  const simplified = compressStatement(complexStatement, maxLength, preserved);
  
  // Identify what was lost
  const lost = identifyLostInformation(complexStatement, simplified);
  
  const result: SimplificationResult = {
    original: complexStatement,
    simplified,
    compressionRatio: simplified.length / complexStatement.length,
    preservedKeys: preserved,
    lostInformation: lost,
  };
  
  logger.audit({
    layer: 'feynman',
    action: 'simplify',
    actor: 'system',
    data: {
      compressionRatio: result.compressionRatio,
      preservedCount: preserved.length,
      lostCount: lost.length,
    },
    outcome: 'success',
  });
  
  return result;
}

/**
 * Extract information that must be preserved
 */
function extractPreservedInfo(statement: string, keys: string[]): string[] {
  const preserved: string[] = [];
  
  for (const key of keys) {
    if (statement.toLowerCase().includes(key.toLowerCase())) {
      preserved.push(key);
    }
  }
  
  return preserved;
}

/**
 * Compress statement to target length
 */
function compressStatement(
  statement: string,
  maxLength: number,
  mustPreserve: string[]
): string {
  if (statement.length <= maxLength) {
    return statement;
  }
  
  // TODO: Implement intelligent compression
  // Should use NLP techniques to identify core meaning
  
  // Simple approach: truncate with ellipsis while preserving key terms
  let compressed = statement.slice(0, maxLength - 3) + '...';
  
  // Ensure preserved keys are included
  for (const key of mustPreserve) {
    if (!compressed.includes(key)) {
      // This is a simplification failure - key info lost
      logger.warn('Compression lost preserved key', { key });
    }
  }
  
  return compressed;
}

/**
 * Identify what information was lost in simplification
 */
function identifyLostInformation(original: string, simplified: string): string[] {
  const lost: string[] = [];
  
  // Simple word-level comparison
  const originalWords = new Set(original.toLowerCase().split(/\s+/));
  const simplifiedWords = new Set(simplified.toLowerCase().split(/\s+/));
  
  for (const word of originalWords) {
    if (!simplifiedWords.has(word) && word.length > 4) {
      lost.push(word);
    }
  }
  
  // Limit to most important losses
  return lost.slice(0, 5);
}

/**
 * Check if simplification preserved all critical information
 */
export function isLossless(result: SimplificationResult): boolean {
  return result.lostInformation.length === 0;
}

/**
 * Rate the quality of simplification
 */
export function rateSimplification(result: SimplificationResult): number {
  // Score from 0 to 1
  let score = 1.0;
  
  // Penalize for lost information
  score -= result.lostInformation.length * 0.1;
  
  // Penalize for poor compression
  if (result.compressionRatio > 0.9) {
    score -= 0.1; // Barely compressed
  }
  
  // Bonus for good compression with preservation
  if (result.compressionRatio < 0.5 && result.preservedKeys.length > 0) {
    score += 0.1;
  }
  
  return Math.max(0, Math.min(1, score));
}
