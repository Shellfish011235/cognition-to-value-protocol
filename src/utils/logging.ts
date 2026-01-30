/**
 * Logging utilities for audit trail and observability
 * 
 * INVARIANT: Every state transition must be logged
 */

import { AuditEntry } from './types';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  critical(message: string, data?: Record<string, unknown>): void;
  audit(entry: Omit<AuditEntry, 'entryId' | 'timestamp'>): void;
}

/**
 * Create a logger instance for a specific layer
 */
export function createLogger(layer: AuditEntry['layer']): Logger {
  const log = (level: LogLevel, message: string, data?: Record<string, unknown>) => {
    const entry = {
      timestamp: Date.now(),
      level,
      layer,
      message,
      data,
    };
    
    // TODO: Implement actual logging backend
    // This should write to persistent audit storage
    console.log(JSON.stringify(entry));
  };

  return {
    debug: (message, data) => log('debug', message, data),
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
    critical: (message, data) => log('critical', message, data),
    
    audit: (entry) => {
      const fullEntry: AuditEntry = {
        entryId: generateAuditId(),
        timestamp: Date.now(),
        ...entry,
      };
      
      // TODO: Write to immutable audit log
      console.log('[AUDIT]', JSON.stringify(fullEntry));
    },
  };
}

/**
 * Generate unique audit entry ID
 */
function generateAuditId(): string {
  // TODO: Use proper UUID library
  return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format error for logging
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}
