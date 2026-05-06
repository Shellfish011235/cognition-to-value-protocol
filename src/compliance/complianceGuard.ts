import { PermissionMode } from '../permissions/modes';
import { XRPLIntentEnvelope } from '../xrpl/xrpl-intent.schema';

export type ComplianceClassification =
  | 'read_only'
  | 'educational'
  | 'simulation'
  | 'recommendation'
  | 'draft_transaction'
  | 'user_signed_transaction'
  | 'restricted_automation'
  | 'custodial_activity'
  | 'regulated_activity_warning'
  | 'blocked';

export interface ComplianceGuardInput {
  permissionMode: PermissionMode;
  jurisdiction?: 'US-FL' | 'US' | 'EU' | 'OTHER';
  intent?: XRPLIntentEnvelope;
  handlesPrivateKeys?: boolean;
  takesCustody?: boolean;
  movesThirdPartyFunds?: boolean;
  providesFinancialAdvice?: boolean;
}

export interface ComplianceGuardResult {
  classification: ComplianceClassification;
  allowed: boolean;
  reasons: string[];
  requiredDisclosures: string[];
}

export function classifyCompliance(input: ComplianceGuardInput): ComplianceGuardResult {
  const reasons: string[] = [];
  const requiredDisclosures: string[] = [];

  if (input.handlesPrivateKeys) {
    return block('Protocol must not handle private keys, seed phrases, or mnemonic material.');
  }

  if (input.takesCustody) {
    return block('Custodial activity is outside the safe reference profile.');
  }

  if (input.movesThirdPartyFunds) {
    return block('Moving third-party funds may trigger regulated activity and is outside this reference profile.');
  }

  if (input.providesFinancialAdvice) {
    reasons.push('Financial advice flag detected. Output must be educational/general and not individualized investment advice.');
    requiredDisclosures.push('This system provides protocol analysis and safety checks, not financial, legal, or tax advice.');
  }

  switch (input.permissionMode) {
    case 'disabled':
      return {
        classification: 'blocked',
        allowed: false,
        reasons: ['System is in disabled/emergency halt mode.'],
        requiredDisclosures,
      };
    case 'read_only':
      return {
        classification: 'read_only',
        allowed: true,
        reasons: ['Read-only analysis does not create, sign, or submit transactions.'],
        requiredDisclosures,
      };
    case 'simulation_only':
      return {
        classification: 'simulation',
        allowed: true,
        reasons: ['Simulation mode may model outcomes but may not move funds.'],
        requiredDisclosures,
      };
    case 'draft_intent':
      requiredDisclosures.push('Draft intents are not transactions and require separate user approval/signing.');
      return {
        classification: 'draft_transaction',
        allowed: true,
        reasons: ['Draft intent mode creates bounded envelopes for review only.'],
        requiredDisclosures,
      };
    case 'human_approved_signing':
      requiredDisclosures.push('Execution requires explicit approval from a user-controlled external wallet.');
      return {
        classification: 'user_signed_transaction',
        allowed: true,
        reasons: ['Human-approved signing mode keeps private keys outside the protocol.'],
        requiredDisclosures,
      };
    case 'restricted_automation':
      requiredDisclosures.push('Restricted automation requires caps, signed approvals, logs, and emergency halt controls.');
      return {
        classification: 'restricted_automation',
        allowed: true,
        reasons: ['Automation is allowed only inside predefined caps and approvals.'],
        requiredDisclosures,
      };
    default:
      return block('Unknown permission mode.');
  }

  function block(reason: string): ComplianceGuardResult {
    return {
      classification: 'blocked',
      allowed: false,
      reasons: [reason],
      requiredDisclosures,
    };
  }
}
