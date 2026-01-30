/**
 * LEAR - Learn
 * 
 * Collects feedback and outcomes for pattern recognition.
 * 
 * INVARIANT: Learning informs adaptation but does not change enforcement rules.
 */

import { createLogger } from '../utils/logging';
import { AuditEntry } from '../utils/types';

const logger = createLogger('lear');

export interface LearningEvent {
  eventId: string;
  timestamp: number;
  eventType: 'success' | 'failure' | 'rejection' | 'timeout';
  context: Record<string, unknown>;
  outcome: Record<string, unknown>;
  feedback?: string;
}

export interface LearningState {
  stateId: string;
  events: LearningEvent[];
  patterns: Pattern[];
  lastUpdated: number;
}

export interface Pattern {
  patternId: string;
  description: string;
  frequency: number;
  confidence: number;
  associatedOutcome: 'positive' | 'negative' | 'neutral';
}

/**
 * Record a learning event
 */
export function learn(event: Omit<LearningEvent, 'eventId'>): LearningEvent {
  const learningEvent: LearningEvent = {
    eventId: `learn-${Date.now()}`,
    ...event,
  };
  
  logger.info('Recording learning event', { 
    eventId: learningEvent.eventId,
    eventType: learningEvent.eventType,
  });
  
  logger.audit({
    layer: 'lear',
    action: 'learn',
    actor: 'system',
    data: { event: learningEvent },
    outcome: 'success',
  });
  
  return learningEvent;
}

/**
 * Extract patterns from historical events
 */
export function extractPatterns(events: LearningEvent[]): Pattern[] {
  logger.info('Extracting patterns from events', { eventCount: events.length });
  
  // TODO: Implement actual pattern extraction
  // Consider:
  // - Time series analysis
  // - Clustering of similar events
  // - Correlation detection
  // - Anomaly identification
  
  const patterns: Pattern[] = [];
  
  // Group by event type
  const successRate = events.filter(e => e.eventType === 'success').length / events.length;
  
  if (events.length >= 10) {
    patterns.push({
      patternId: `pattern-success-rate`,
      description: `Historical success rate: ${(successRate * 100).toFixed(1)}%`,
      frequency: events.length,
      confidence: Math.min(events.length / 100, 1),
      associatedOutcome: successRate > 0.7 ? 'positive' : successRate > 0.3 ? 'neutral' : 'negative',
    });
  }
  
  return patterns;
}

/**
 * Convert audit entries to learning events
 */
export function fromAuditEntries(entries: AuditEntry[]): LearningEvent[] {
  return entries.map(entry => ({
    eventId: entry.entryId,
    timestamp: entry.timestamp,
    eventType: entry.outcome === 'success' ? 'success' : 
               entry.outcome === 'rejected' ? 'rejection' : 'failure',
    context: { layer: entry.layer, action: entry.action },
    outcome: entry.data,
  }));
}

/**
 * Prune old events beyond retention period
 */
export function pruneEvents(events: LearningEvent[], maxAge: number): LearningEvent[] {
  const cutoff = Date.now() - maxAge;
  return events.filter(e => e.timestamp >= cutoff);
}
