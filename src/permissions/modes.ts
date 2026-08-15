export type PermissionMode =
  | 'disabled'
  | 'read_only'
  | 'simulation_only'
  | 'draft_intent'
  | 'human_approved_signing'
  | 'restricted_automation';

export type ProtocolCapability =
  | 'observe'
  | 'explain'
  | 'simulate'
  | 'create_intent'
  | 'request_human_approval'
  | 'submit_signed_transaction'
  | 'automate_with_caps';

export interface PermissionModePolicy {
  mode: PermissionMode;
  label: string;
  description: string;
  allowedCapabilities: ProtocolCapability[];
  requiresHumanApproval: boolean;
  allowsPrivateKeys: false;
  allowsBackendSigning: boolean;
}

export const PERMISSION_MODE_POLICIES: Record<PermissionMode, PermissionModePolicy> = {
  disabled: {
    mode: 'disabled',
    label: 'Disabled / Emergency Halt',
    description: 'All protocol activity is halted except receipt preservation and status display.',
    allowedCapabilities: [],
    requiresHumanApproval: true,
    allowsPrivateKeys: false,
    allowsBackendSigning: false,
  },
  read_only: {
    mode: 'read_only',
    label: 'Read-only Intelligence',
    description: 'The system may observe, explain, and audit data. It may not create executable intents.',
    allowedCapabilities: ['observe', 'explain'],
    requiresHumanApproval: false,
    allowsPrivateKeys: false,
    allowsBackendSigning: false,
  },
  simulation_only: {
    mode: 'simulation_only',
    label: 'Simulation Only',
    description: 'The system may simulate outcomes and produce non-executable recommendations.',
    allowedCapabilities: ['observe', 'explain', 'simulate'],
    requiresHumanApproval: false,
    allowsPrivateKeys: false,
    allowsBackendSigning: false,
  },
  draft_intent: {
    mode: 'draft_intent',
    label: 'Draft Intent',
    description: 'The system may create bounded, immutable intent envelopes for user review only.',
    allowedCapabilities: ['observe', 'explain', 'simulate', 'create_intent'],
    requiresHumanApproval: true,
    allowsPrivateKeys: false,
    allowsBackendSigning: false,
  },
  human_approved_signing: {
    mode: 'human_approved_signing',
    label: 'Human-approved Wallet Signing',
    description: 'The system may submit a transaction only after explicit user-wallet approval. Private keys remain outside the protocol.',
    allowedCapabilities: ['observe', 'explain', 'simulate', 'create_intent', 'request_human_approval', 'submit_signed_transaction'],
    requiresHumanApproval: true,
    allowsPrivateKeys: false,
    allowsBackendSigning: false,
  },
  restricted_automation: {
    mode: 'restricted_automation',
    label: 'Restricted Automation With Caps',
    description: 'Automation is allowed only inside strict policy caps, signed approvals, and emergency halt controls.',
    allowedCapabilities: ['observe', 'explain', 'simulate', 'create_intent', 'request_human_approval', 'submit_signed_transaction', 'automate_with_caps'],
    requiresHumanApproval: true,
    allowsPrivateKeys: false,
    allowsBackendSigning: false,
  },
};

export function getPermissionModePolicy(mode: PermissionMode): PermissionModePolicy {
  return PERMISSION_MODE_POLICIES[mode];
}

export function canUseCapability(mode: PermissionMode, capability: ProtocolCapability): boolean {
  return PERMISSION_MODE_POLICIES[mode].allowedCapabilities.includes(capability);
}

export function assertCapability(mode: PermissionMode, capability: ProtocolCapability): void {
  if (!canUseCapability(mode, capability)) {
    throw new Error(`Capability ${capability} is blocked in permission mode ${mode}`);
  }
}

export function isExecutionMode(mode: PermissionMode): boolean {
  return mode === 'human_approved_signing' || mode === 'restricted_automation';
}
