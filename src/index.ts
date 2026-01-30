/**
 * Cognition-to-Value Protocol v1
 * 
 * Main entry point for the protocol implementation.
 * 
 * Architecture: OODA → LEAR → FEYNMAN → PIE → CAR → Ledger
 * 
 * @module cognition-to-value-protocol
 */

// OODA - Perception Control
export * from './ooda/observe';
export * from './ooda/orient';
export * from './ooda/decide';
export * from './ooda/act';

// LEAR - Adaptive Intelligence
export * from './lear/learn';
export * from './lear/evaluate';
export * from './lear/adapt';
export * from './lear/reinforce';

// FEYNMAN - Truth Enforcement
export * from './feynman/explain';
export * from './feynman/simplify';
export * from './feynman/test';
export * from './feynman/reject';

// PIE - Payment Intent Envelope
export * from './pie/pie.schema';
export * from './pie/validateEnvelope';

// CAR - Execution Gate
export * from './car/compute';
export * from './car/validate';
export * from './car/attest';
export * from './car/route';

// Ledger
export * from './ledger/xrpl';
export * from './ledger/ilp';
export * from './ledger/settlement';

// Utilities
export * from './utils/types';
export * from './utils/logging';
export * from './utils/crypto';
