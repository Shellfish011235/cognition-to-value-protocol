import { z } from 'zod';

export const capabilityEnvelopeSchema = z.object({
  intentId: z.string().min(1),
  agentId: z.string().min(1),
  action: z.string().min(1),
  target: z.string().min(1),
  reason: z.string().min(1),
  evidenceIds: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  allowedTools: z.array(z.string()).default([]),
  prohibitedActions: z.array(z.string()).default([]),
  constraints: z.object({
    maxImpact: z.string().min(1),
    maxActions: z.number().int().positive(),
    expiresAt: z.number().int().positive(),
    rollbackRequired: z.boolean(),
  }),
  requiredApprovals: z.array(z.string()).default([]),
  rollbackProcedure: z.string().min(1),
  signature: z.string().optional(),
});

export type CapabilityEnvelope = z.infer<typeof capabilityEnvelopeSchema>;

export function validateCapabilityEnvelope(input: unknown): CapabilityEnvelope {
  return capabilityEnvelopeSchema.parse(input);
}
