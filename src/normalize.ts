import path from 'node:path';
import type { ProposedAction } from './types.js';

export function normalizeAction(action: ProposedAction): ProposedAction {
  const kind = action.kind ?? inferKind(action.tool);
  const normalized: ProposedAction = { ...action, kind };
  if (action.path) normalized.path = normalizePath(action.path);
  return normalized;
}

export function normalizePath(value: string): string {
  return path.normalize(value).replace(/\\/g, '/').replace(/^\.\//, '');
}

export function inferKind(tool: string): string {
  if (tool === 'read' || tool === 'file_fetch') return 'file.read';
  if (tool === 'write' || tool === 'edit' || tool === 'apply_patch' || tool === 'file_write') return 'file.write';
  if (tool === 'exec') return 'command.run';
  if (tool === 'web_fetch' || tool === 'web_search' || tool === 'browser') return 'network.request';
  if (tool === 'message') return 'message.send';
  return 'unknown';
}
