/**
 * Core type definitions for the Cognition-to-Value Protocol
 */

/**
 * Payment Intent Envelope - The canonical schema for bounded intent
 */
export interface PaymentIntentEnvelope {
  /** Unique identifier (UUID) */
  intentId: string;
  
  /** Action type */
  action: 'send' | 'swap' | 'batch';
  
  /** Amount specification */
  amount: {
    value: string;
    currency: 'XRP' | 'USD' | string;
  };
  
  /** Destination address (XRPL or ILP) */
  destination: string;
  
  /** Execution constraints */
  constraints: {
    maxSlippage: number;
    maxFee: string;
    expiry: number; // unix timestamp
  };
  
  /** Risk boundaries */
  riskBounds: {
    maxVolatility: number;
    complianceFlags: string[];
  };
  
  /** Allowed routing paths */
  allowedRoutes: string[];
  
  /** Required proofs for execution */
  requiredProofs: string[];
  
  /** Feynman-compressed rationale */
  explanation: string;
}

/**
 * Proposed action from OODA layer
 */
export interface ProposedAction {
  proposalId: string;
  timestamp: number;
  source: 'ooda';
  intent: Partial<PaymentIntentEnvelope>;
  confidence: number;
  rationale: string;
}

/**
 * LEAR adaptation parameters
 */
export interface AdaptationParams {
  paramId: string;
  name: string;
  currentValue: number;
  minBound: number;
  maxBound: number;
  adaptationRate: number;
}

/**
 * FEYNMAN explanation result
 */
export interface ExplanationResult {
  isExplainable: boolean;
  simplifiedRationale: string;
  verificationStatus: 'verified' | 'unverified' | 'rejected';
  sourceReferences: string[];
}

/**
 * CAR validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  attestation?: string;
}

/**
 * CAR attestation record
 */
export interface AttestationRecord {
  attestationId: string;
  envelopeId: string;
  timestamp: number;
  signature: string;
  publicKey: string;
  validationHash: string;
}

/**
 * Ledger submission result
 */
export interface SubmissionResult {
  success: boolean;
  transactionHash?: string;
  ledgerIndex?: number;
  error?: string;
}

/**
 * Audit log entry
 */
export interface AuditEntry {
  entryId: string;
  timestamp: number;
  layer: 'ooda' | 'lear' | 'feynman' | 'pie' | 'car' | 'ledger';
  action: string;
  actor: string;
  data: Record<string, unknown>;
  outcome: 'success' | 'failure' | 'rejected';
}

/**
 * System state for monitoring
 */
export interface SystemState {
  isOperational: boolean;
  lastHeartbeat: number;
  activeEnvelopes: number;
  pendingProposals: number;
  halted: boolean;
  haltReason?: string;
}
