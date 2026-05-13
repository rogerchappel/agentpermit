import { AgentPermitError } from './errors.js';
import type { Policy, ProposedAction, Rule } from './types.js';

export function parsePolicyJson(value: unknown, source: string): Policy {
  const input = asRecord(value, `Policy in ${source}`);
  if (input.version !== 1) throw new AgentPermitError(`Policy in ${source} must use version 1.`);
  const name = requiredString(input.name, 'policy.name');
  const defaultEffect = parseEffect(input.defaultEffect, 'policy.defaultEffect');
  const rulesInput = Array.isArray(input.rules) ? input.rules : fail('policy.rules must be an array.');
  return {
    version: 1,
    name,
    defaultEffect,
    rules: rulesInput.map((rule, index) => parseRule(rule, `policy.rules[${index}]`))
  };
}

export function parseTraceJson(value: unknown, source: string): ProposedAction[] {
  const input = asRecord(value, `Trace in ${source}`);
  const actions = Array.isArray(input.actions) ? input.actions : fail('trace.actions must be an array.');
  return actions.map((action, index) => parseAction(action, `trace.actions[${index}]`));
}

function parseRule(value: unknown, label: string): Rule {
  const input = asRecord(value, label);
  const rule: Rule = {
    id: requiredString(input.id, `${label}.id`),
    effect: parseEffect(input.effect, `${label}.effect`),
    reason: requiredString(input.reason, `${label}.reason`)
  };
  assignArray(rule, 'tools', input.tools, `${label}.tools`);
  assignArray(rule, 'kinds', input.kinds, `${label}.kinds`);
  assignArray(rule, 'paths', input.paths, `${label}.paths`);
  assignArray(rule, 'commands', input.commands, `${label}.commands`);
  assignArray(rule, 'urls', input.urls, `${label}.urls`);
  assignArray(rule, 'targets', input.targets, `${label}.targets`);
  return rule;
}

function parseAction(value: unknown, label: string): ProposedAction {
  const input = asRecord(value, label);
  const action: ProposedAction = {
    id: requiredString(input.id, `${label}.id`),
    tool: requiredString(input.tool, `${label}.tool`)
  };
  assignString(action, 'kind', input.kind, `${label}.kind`);
  assignString(action, 'description', input.description, `${label}.description`);
  assignString(action, 'path', input.path, `${label}.path`);
  assignString(action, 'command', input.command, `${label}.command`);
  assignString(action, 'url', input.url, `${label}.url`);
  assignString(action, 'target', input.target, `${label}.target`);
  if (typeof input.metadata === 'object' && input.metadata !== null && !Array.isArray(input.metadata)) {
    action.metadata = input.metadata as Record<string, unknown>;
  }
  return action;
}

function assignArray<T extends keyof Rule>(target: Rule, key: T, value: unknown, label: string): void {
  const parsed = optionalStringArray(value, label);
  if (parsed !== undefined) (target[key] as string[] | undefined) = parsed;
}

function assignString<T extends keyof ProposedAction>(target: ProposedAction, key: T, value: unknown, label: string): void {
  const parsed = optionalString(value, label);
  if (parsed !== undefined) (target[key] as string | undefined) = parsed;
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AgentPermitError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new AgentPermitError(`${label} must be a non-empty string.`);
  return value;
}

function optionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new AgentPermitError(`${label} must be a string.`);
  return value;
}

function optionalStringArray(value: unknown, label: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new AgentPermitError(`${label} must be an array of strings.`);
  }
  return value;
}

function parseEffect(value: unknown, label: string): 'allow' | 'warn' | 'deny' {
  if (value === 'allow' || value === 'warn' || value === 'deny') return value;
  throw new AgentPermitError(`${label} must be allow, warn, or deny.`);
}

function fail(message: string): never {
  throw new AgentPermitError(message);
}
