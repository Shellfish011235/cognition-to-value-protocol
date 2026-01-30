/**
 * PIE - Payment Intent Envelope Schema
 * 
 * The canonical schema for bounded intent between cognition and execution.
 * 
 * INVARIANT: No free-form actions. Only bounded, auditable envelopes.
 */

import { z } from 'zod';

/**
 * Amount specification schema
 */
export const AmountSchema = z.object({
  value: z.string().regex(/^\d+(\.\d+)?$/, 'Value must be a numeric string'),
  currency: z.string().min(1).max(10),
});

/**
 * Execution constraints schema
 */
export const ConstraintsSchema = z.object({
  maxSlippage: z.number().min(0).max(1),
  maxFee: z.string().regex(/^\d+(\.\d+)?$/, 'MaxFee must be a numeric string'),
  expiry: z.number().int().positive(),
});

/**
 * Risk boundaries schema
 */
export const RiskBoundsSchema = z.object({
  maxVolatility: z.number().min(0).max(1),
  complianceFlags: z.array(z.string()),
});

/**
 * Complete Payment Intent Envelope schema
 */
export const PaymentIntentEnvelopeSchema = z.object({
  intentId: z.string().uuid(),
  action: z.enum(['send', 'swap', 'batch']),
  amount: AmountSchema,
  destination: z.string().min(1),
  constraints: ConstraintsSchema,
  riskBounds: RiskBoundsSchema,
  allowedRoutes: z.array(z.string()),
  requiredProofs: z.array(z.string()),
  explanation: z.string().min(10).max(500),
});

/**
 * Type inference from schema
 */
export type PIESchema = z.infer<typeof PaymentIntentEnvelopeSchema>;

/**
 * Partial envelope for draft/proposal stage
 */
export const PartialEnvelopeSchema = PaymentIntentEnvelopeSchema.partial();

export type PartialPIE = z.infer<typeof PartialEnvelopeSchema>;

/**
 * Validation result type
 */
export interface PIEValidationResult {
  valid: boolean;
  errors: z.ZodError | null;
  envelope: PIESchema | null;
}

/**
 * Validate an envelope against the schema
 */
export function validatePIESchema(data: unknown): PIEValidationResult {
  const result = PaymentIntentEnvelopeSchema.safeParse(data);
  
  if (result.success) {
    return {
      valid: true,
      errors: null,
      envelope: result.data,
    };
  }
  
  return {
    valid: false,
    errors: result.error,
    envelope: null,
  };
}

/**
 * Check if envelope has expired
 */
export function isExpired(envelope: PIESchema): boolean {
  return Date.now() > envelope.constraints.expiry * 1000;
}

/**
 * Create a new envelope with default constraints
 */
export function createDefaultConstraints(): z.infer<typeof ConstraintsSchema> {
  return {
    maxSlippage: 0.01, // 1%
    maxFee: '0.001',   // 0.001 XRP
    expiry: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
  };
}

/**
 * Create default risk bounds
 */
export function createDefaultRiskBounds(): z.infer<typeof RiskBoundsSchema> {
  return {
    maxVolatility: 0.1, // 10%
    complianceFlags: [],
  };
}
