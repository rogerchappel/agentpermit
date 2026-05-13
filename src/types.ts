export type Severity = 'allow' | 'warn' | 'deny';

export type ActionKind =
  | 'file.read'
  | 'file.write'
  | 'command.run'
  | 'network.request'
  | 'message.send'
  | 'browser.open'
  | 'unknown';

export type ProposedAction = {
  id: string;
  tool: string;
  kind?: ActionKind | string;
  description?: string;
  path?: string;
  command?: string;
  url?: string;
  target?: string;
  metadata?: Record<string, unknown>;
};

export type RuleEffect = 'allow' | 'warn' | 'deny';

export type Rule = {
  id: string;
  effect: RuleEffect;
  reason: string;
  tools?: string[];
  kinds?: string[];
  paths?: string[];
  commands?: string[];
  urls?: string[];
  targets?: string[];
};

export type Policy = {
  version: 1;
  name: string;
  defaultEffect: RuleEffect;
  rules: Rule[];
};

export type Finding = {
  actionId: string;
  tool: string;
  kind: string;
  effect: Severity;
  ruleId: string;
  reason: string;
  evidence: string[];
};

export type Evaluation = {
  ok: boolean;
  policy: string;
  totals: Record<Severity, number>;
  findings: Finding[];
};

export type WorkspaceInput = {
  root: string;
  policyPath: string;
  tracePath: string;
  policy: Policy;
  actions: ProposedAction[];
};
