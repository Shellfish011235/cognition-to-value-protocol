import { z } from 'zod';
import { PaymentIntentEnvelopeSchema } from '../pie/pie.schema';
import { PermissionMode } from '../permissions/modes';

export const XRPLNetworkSchema = z.enum(['mainnet', 'testnet', 'devnet', 'sidechain']);

export const XRPLClassicAddressSchema = z
  .string()
  .regex(/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/, 'Expected an XRPL classic address');

export const XRPLDestinationSchema = z.object({
  address: XRPLClassicAddressSchema,
  destinationTag: z.number().int().min(0).max(4294967295).optional(),
  requiresDestinationTag: z.boolean().default(false),
});

export const XRPLAssetSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('xrp'),
    currency: z.literal('XRP'),
  }),
  z.object({
    type: z.literal('issued_currency'),
    currency: z.string().min(1).max(40),
    issuer: XRPLClassicAddressSchema,
  }),
  z.object({
    type: z.literal('mpt'),
    mptIssuanceId: z.string().min(1),
  }),
]);

export const XRPLTransactionTypeSchema = z.enum([
  'Payment',
  'OfferCreate',
  'OfferCancel',
  'TrustSet',
  'EscrowCreate',
  'EscrowFinish',
  'PaymentChannelCreate',
  'PaymentChannelClaim',
  'AMMDeposit',
  'AMMWithdraw',
  'CheckCreate',
  'TicketCreate',
]);

export const XRPLPolicyFlagsSchema = z.object({
  rejectPartialPaymentAmbiguity: z.boolean().default(true),
  requireDeliveredAmountCheck: z.boolean().default(true),
  requireLastLedgerSequence: z.boolean().default(true),
  requireHumanApprovalForTrustSet: z.boolean().default(true),
  requireHumanApprovalForAMM: z.boolean().default(true),
  blockUnknownIssuersByDefault: z.boolean().default(true),
  prohibitPrivateKeyMaterial: z.boolean().default(true),
});

export const XRPLSafetyMetadataSchema = z.object({
  network: XRPLNetworkSchema,
  sourceAddress: XRPLClassicAddressSchema.optional(),
  destination: XRPLDestinationSchema.optional(),
  asset: XRPLAssetSchema.optional(),
  transactionType: XRPLTransactionTypeSchema.optional(),
  lastLedgerSequence: z.number().int().positive().optional(),
  feeDropsMax: z.string().regex(/^\d+$/, 'feeDropsMax must be drops as an integer string').optional(),
  issuerAllowList: z.array(XRPLClassicAddressSchema).default([]),
  blockedAddresses: z.array(XRPLClassicAddressSchema).default([]),
  expectedSigningMethod: z.enum(['none', 'external_wallet', 'multisig', 'passkey_attested']).default('none'),
  permissionMode: z.custom<PermissionMode>(),
  policyFlags: XRPLPolicyFlagsSchema.default({}),
});

export const XRPLIntentEnvelopeSchema = PaymentIntentEnvelopeSchema.extend({
  xrpl: XRPLSafetyMetadataSchema,
});

export type XRPLIntentEnvelope = z.infer<typeof XRPLIntentEnvelopeSchema>;

export interface XRPLIntentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  envelope: XRPLIntentEnvelope | null;
}

export function validateXRPLIntentEnvelope(data: unknown): XRPLIntentValidationResult {
  const parsed = XRPLIntentEnvelopeSchema.safeParse(data);

  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      warnings: [],
      envelope: null,
    };
  }

  const envelope = parsed.data;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (envelope.xrpl.destination?.requiresDestinationTag && envelope.xrpl.destination.destinationTag === undefined) {
    errors.push('Destination tag is required for this destination but missing.');
  }

  if (envelope.xrpl.policyFlags.requireLastLedgerSequence && envelope.xrpl.lastLedgerSequence === undefined) {
    errors.push('lastLedgerSequence is required by policy.');
  }

  if (envelope.xrpl.policyFlags.blockUnknownIssuersByDefault && envelope.xrpl.asset?.type === 'issued_currency') {
    const issuer = envelope.xrpl.asset.issuer;
    if (!envelope.xrpl.issuerAllowList.includes(issuer)) {
      errors.push(`Issued-currency issuer ${issuer} is not allow-listed.`);
    }
  }

  if (envelope.xrpl.blockedAddresses.includes(envelope.destination)) {
    errors.push(`Destination ${envelope.destination} is blocked by XRPL safety metadata.`);
  }

  if (envelope.xrpl.expectedSigningMethod === 'none' && ['human_approved_signing', 'restricted_automation'].includes(envelope.xrpl.permissionMode)) {
    errors.push('Execution-capable permission modes require an external signing method.');
  }

  if (envelope.xrpl.transactionType === 'TrustSet' && envelope.xrpl.policyFlags.requireHumanApprovalForTrustSet) {
    warnings.push('TrustSet requires explicit human approval because trustlines can expose users to issuer/token risk.');
  }

  if (
    (envelope.xrpl.transactionType === 'AMMDeposit' || envelope.xrpl.transactionType === 'AMMWithdraw') &&
    envelope.xrpl.policyFlags.requireHumanApprovalForAMM
  ) {
    warnings.push('AMM actions require explicit human approval because LP positions carry market and liquidity risk.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    envelope,
  };
}
