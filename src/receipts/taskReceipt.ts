import { createHash } from 'crypto';
import { PermissionMode } from '../permissions/modes';
import { ComplianceGuardResult } from '../compliance/complianceGuard';
import { PromptFirewallResult } from '../security/promptFirewall';

export type TaskReceiptStatus =
  | 'observed'
  | 'explained'
  | 'rejected'
  | 'simulated'
  | 'drafted'
  | 'needs_review'
  | 'approved'
  | 'submitted'
  | 'failed'
  | 'blocked';

export interface TaskReceiptInput {
  taskId: string;
  timestamp?: number;
  permissionMode: PermissionMode;
  actor: string;
  action: string;
  status: TaskReceiptStatus;
  inputHash?: string;
  promptFirewall?: PromptFirewallResult;
  compliance?: ComplianceGuardResult;
  explanation?: string;
  pieEnvelopeHash?: string;
  carValidationHash?: string;
  ledgerTransactionHash?: string;
  notes?: string[];
}

export interface TaskReceipt extends Required<Omit<TaskReceiptInput, 'timestamp' | 'inputHash' | 'promptFirewall' | 'compliance' | 'explanation' | 'pieEnvelopeHash' | 'carValidationHash' | 'ledgerTransactionHash' | 'notes'>> {
  timestamp: number;
  inputHash?: string;
  promptFirewall?: PromptFirewallResult;
  compliance?: ComplianceGuardResult;
  explanation?: string;
  pieEnvelopeHash?: string;
  carValidationHash?: string;
  ledgerTransactionHash?: string;
  notes: string[];
  receiptHash: string;
}

export function createTaskReceipt(input: TaskReceiptInput): TaskReceipt {
  const receiptWithoutHash = {
    taskId: input.taskId,
    timestamp: input.timestamp ?? Date.now(),
    permissionMode: input.permissionMode,
    actor: input.actor,
    action: input.action,
    status: input.status,
    inputHash: input.inputHash,
    promptFirewall: input.promptFirewall,
    compliance: input.compliance,
    explanation: input.explanation,
    pieEnvelopeHash: input.pieEnvelopeHash,
    carValidationHash: input.carValidationHash,
    ledgerTransactionHash: input.ledgerTransactionHash,
    notes: input.notes ?? [],
  };

  return {
    ...receiptWithoutHash,
    receiptHash: hashCanonical(receiptWithoutHash),
  };
}

export function hashCanonical(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

export function hashInput(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
