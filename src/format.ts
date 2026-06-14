import type { Evaluation, Finding } from './types.js';

export type OutputFormat = 'text' | 'json';

export function formatEvaluation(evaluation: Evaluation, format: OutputFormat): string {
  if (format === 'json') return `${JSON.stringify(evaluation, null, 2)}\n`;
  const lines = [
    `AgentPermit policy: ${evaluation.policy}`,
    `Result: ${evaluation.ok ? 'allowable' : 'blocked'} (${evaluation.totals.allow} allow, ${evaluation.totals.warn} warn, ${evaluation.totals.deny} deny)`,
    ''
  ];
  for (const finding of evaluation.integrity) lines.push(formatFinding(finding), '');
  for (const finding of evaluation.findings) lines.push(formatFinding(finding), '');
  return `${lines.join('\n').trimEnd()}\n`;
}

export function formatFinding(finding: Finding): string {
  return [
    `[${finding.effect.toUpperCase()}] ${finding.actionId} via ${finding.tool} (${finding.kind})`,
    `  rule: ${finding.ruleId}`,
    `  reason: ${finding.reason}`,
    `  evidence: ${finding.evidence.join('; ')}`
  ].join('\n');
}

export function formatExplain(evaluation: Evaluation): string {
  const lines = [
    '# AgentPermit explanation',
    '',
    `Policy: ${evaluation.policy}`,
    `Decision: ${evaluation.ok ? 'No deny findings.' : 'Deny findings present.'}`,
    '',
    '| Effect | Action | Rule | Reason |',
    '| --- | --- | --- | --- |'
  ];
  for (const finding of evaluation.findings) {
    lines.push(`| ${finding.effect} | ${finding.actionId} | ${finding.ruleId} | ${escapeTable(finding.reason)} |`);
  }
  for (const finding of evaluation.integrity) {
    lines.push(`| ${finding.effect} | ${finding.actionId} | ${finding.ruleId} | ${escapeTable(finding.reason)} |`);
  }
  return `${lines.join('\n')}\n`;
}

function escapeTable(value: string): string {
  return value.replace(/\|/g, '\\|');
}
