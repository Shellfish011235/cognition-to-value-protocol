export type AgentRole =
  | 'observer'
  | 'orienter'
  | 'challenger'
  | 'decider'
  | 'executor'
  | 'auditor';

export interface AgentIdentity {
  agentId: string;
  version: string;
  owner: string;
  role: AgentRole;
  publicKey: string;
  allowedTools: string[];
  allowedDataScopes: string[];
  capabilityProfile: string[];
  issuedAt: number;
  expiresAt: number;
}

export function isAgentIdentityActive(identity: AgentIdentity, now = Date.now()): boolean {
  return identity.issuedAt <= now && now < identity.expiresAt;
}
