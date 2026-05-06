export type PromptFirewallSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface PromptFirewallFinding {
  ruleId: string;
  severity: PromptFirewallSeverity;
  message: string;
  match?: string;
}

export interface PromptFirewallResult {
  allowed: boolean;
  findings: PromptFirewallFinding[];
  sanitizedInput: string;
}

interface PromptFirewallRule {
  ruleId: string;
  severity: PromptFirewallSeverity;
  message: string;
  pattern: RegExp;
}

const RULES: PromptFirewallRule[] = [
  {
    ruleId: 'PF-001-SYSTEM-OVERRIDE',
    severity: 'high',
    message: 'Input appears to instruct the model to ignore system or developer instructions.',
    pattern: /\b(ignore|bypass|override|forget)\b.{0,80}\b(system|developer|safety|policy|instructions?)\b/i,
  },
  {
    ruleId: 'PF-002-PRIVATE-KEY',
    severity: 'critical',
    message: 'Input appears to request or include private key or seed material.',
    pattern: /\b(seed phrase|secret numbers?|family seed|private key|mnemonic|sEd[a-zA-Z0-9]{20,})\b/i,
  },
  {
    ruleId: 'PF-003-UNAPPROVED-SIGNING',
    severity: 'critical',
    message: 'Input appears to request signing or sending funds without explicit approval.',
    pattern: /\b(sign|send|transfer|sweep|drain|move)\b.{0,80}\b(without approval|without confirmation|automatically|silently|no confirmation)\b/i,
  },
  {
    ruleId: 'PF-004-EXFILTRATION',
    severity: 'high',
    message: 'Input appears to request secret or credential exfiltration.',
    pattern: /\b(exfiltrate|export|reveal|print|show me|dump)\b.{0,80}\b(api key|token|password|secret|credential|wallet key)\b/i,
  },
  {
    ruleId: 'PF-005-LEDGER-METADATA-INJECTION',
    severity: 'medium',
    message: 'Ledger metadata contains prompt-like instructions and must be treated as untrusted data.',
    pattern: /\b(as an ai|assistant|system prompt|developer message|ignore previous|you are now)\b/i,
  },
];

const BLOCKING_SEVERITIES: PromptFirewallSeverity[] = ['high', 'critical'];

export function scanPromptInput(input: string): PromptFirewallResult {
  const findings: PromptFirewallFinding[] = [];

  for (const rule of RULES) {
    const match = input.match(rule.pattern);
    if (match) {
      findings.push({
        ruleId: rule.ruleId,
        severity: rule.severity,
        message: rule.message,
        match: match[0],
      });
    }
  }

  const allowed = !findings.some((finding) => BLOCKING_SEVERITIES.includes(finding.severity));

  return {
    allowed,
    findings,
    sanitizedInput: redactSensitiveMaterial(input),
  };
}

export function redactSensitiveMaterial(input: string): string {
  return input
    .replace(/\bsEd[a-zA-Z0-9]{20,}\b/g, '[REDACTED_FAMILY_SEED]')
    .replace(/\b(seed phrase|secret numbers?|private key|mnemonic)\b\s*[:=]?\s*[^\n]+/gi, '$1: [REDACTED]');
}

export function assertPromptAllowed(input: string): void {
  const result = scanPromptInput(input);
  if (!result.allowed) {
    const reasons = result.findings.map((finding) => `${finding.ruleId}: ${finding.message}`).join('; ');
    throw new Error(`Prompt Firewall blocked input: ${reasons}`);
  }
}
