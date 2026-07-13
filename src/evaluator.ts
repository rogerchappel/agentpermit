import { matchesAny } from './match.js';
import { normalizeAction } from './normalize.js';
import type { Evaluation, Finding, Policy, ProposedAction, Rule, Severity } from './types.js';

const severityRank: Record<Severity, number> = { allow: 0, warn: 1, deny: 2 };

export function evaluate(policy: Policy, actions: ProposedAction[]): Evaluation {
  const findings = actions.map((action) => evaluateAction(policy, action));
  const integrity = integrityFindings(actions);
  const totals: Record<Severity, number> = { allow: 0, warn: 0, deny: 0 };
  for (const finding of findings) totals[finding.effect] += 1;
  return {
    ok: totals.deny === 0 && integrity.every((finding) => finding.effect !== 'deny'),
    policy: policy.name,
    totals,
    integrity,
    findings: findings.sort((left, right) => left.actionId.localeCompare(right.actionId))
  };
}

export function evaluateAction(policy: Policy, actionInput: ProposedAction): Finding {
  const action = normalizeAction(actionInput);
  const matches = policy.rules.filter((rule) => ruleMatches(rule, action));
  const rule = pickStrongest(matches) ?? defaultRule(policy);
  return {
    actionId: action.id,
    tool: action.tool,
    kind: action.kind ?? 'unknown',
    effect: rule.effect,
    ruleId: rule.id,
    reason: rule.reason,
    evidence: evidenceFor(action)
  };
}

function ruleMatches(rule: Rule, action: ProposedAction): boolean {
  return matchesAny(action.tool, rule.tools)
    && matchesAny(action.kind, rule.kinds)
    && matchesAny(action.path, rule.paths)
    && matchesAny(action.command, rule.commands)
    && matchesAny(action.url, rule.urls)
    && matchesAny(action.target, rule.targets);
}

function pickStrongest(rules: Rule[]): Rule | undefined {
  return [...rules].sort((left, right) => {
    const severity = severityRank[right.effect] - severityRank[left.effect];
    return severity === 0 ? left.id.localeCompare(right.id) : severity;
  })[0];
}

function defaultRule(policy: Policy): Rule {
  return {
    id: 'default',
    effect: policy.defaultEffect,
    reason: `No explicit rule matched; default policy effect is ${policy.defaultEffect}.`
  };
}

function evidenceFor(action: ProposedAction): string[] {
  return [
    `tool=${action.tool}`,
    `kind=${action.kind ?? 'unknown'}`,
    action.path ? `path=${action.path}` : undefined,
    action.command ? `command=${action.command}` : undefined,
    action.url ? `url=${action.url}` : undefined,
    action.target ? `target=${action.target}` : undefined
  ].filter((item): item is string => Boolean(item));
}

function integrityFindings(actions: ProposedAction[]): Finding[] {
  const seen = new Map<string, number>();
  for (const action of actions) seen.set(action.id, (seen.get(action.id) ?? 0) + 1);
  return [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([actionId, count]) => ({
      actionId,
      tool: 'trace',
      kind: 'integrity',
      effect: 'deny' as const,
      ruleId: 'trace.duplicateActionId',
      reason: 'Trace action ids must be unique so decisions can be reviewed unambiguously.',
      evidence: [`actionId=${actionId}`, `count=${count}`]
    }))
    .sort((left, right) => left.actionId.localeCompare(right.actionId));
}
