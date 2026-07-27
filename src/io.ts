import { mkdir, open, readFile, unlink, type FileHandle } from 'node:fs/promises';
import path from 'node:path';
import { AgentPermitError } from './errors.js';
import { defaultPolicy } from './defaultPolicy.js';
import { parsePolicyJson, parseTraceJson } from './schema.js';
import type { Policy, ProposedAction, WorkspaceInput } from './types.js';

export const policyFileName = 'agentpermit.policy.json';
export const traceFileName = 'agentpermit.trace.json';

export async function loadWorkspace(rootInput: string, policyOverride?: string, traceOverride?: string): Promise<WorkspaceInput> {
  const root = path.resolve(rootInput);
  const policyPath = path.resolve(policyOverride ?? path.join(root, policyFileName));
  const tracePath = path.resolve(traceOverride ?? path.join(root, traceFileName));
  const policy = await readPolicy(policyPath);
  const actions = await readTrace(tracePath);
  return { root, policyPath, tracePath, policy, actions };
}

export async function readPolicy(filePath: string): Promise<Policy> {
  return parsePolicyJson(await readJson(filePath), filePath);
}

export async function readTrace(filePath: string): Promise<ProposedAction[]> {
  return parseTraceJson(await readJson(filePath), filePath);
}

export async function writeInitFiles(targetInput: string): Promise<{ target: string; files: string[] }> {
  const target = path.resolve(targetInput);
  await mkdir(target, { recursive: true });
  const policyPath = path.join(target, policyFileName);
  const tracePath = path.join(target, traceFileName);
  const handles: Array<{ handle: FileHandle; filePath: string }> = [];
  let collisionFile = policyFileName;
  let initialized = false;

  try {
    const policyHandle = await open(policyPath, 'wx');
    handles.push({ handle: policyHandle, filePath: policyPath });
    collisionFile = traceFileName;
    const traceHandle = await open(tracePath, 'wx');
    handles.push({ handle: traceHandle, filePath: tracePath });
    await policyHandle.writeFile(`${JSON.stringify(defaultPolicy, null, 2)}\n`);
    await traceHandle.writeFile(`${JSON.stringify(sampleTrace(), null, 2)}\n`);
    initialized = true;
    return { target, files: [policyPath, tracePath] };
  } catch (error) {
    if (isFileExistsError(error)) {
      throw new AgentPermitError(`Refusing to initialize: ${collisionFile} already exists`);
    }
    throw error;
  } finally {
    await Promise.allSettled(handles.map(({ handle }) => handle.close()));
    if (!initialized) {
      await Promise.allSettled(handles.map(({ filePath }) => unlink(filePath)));
    }
  }
}

function isFileExistsError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST');
}

async function readJson(filePath: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) throw new AgentPermitError(`Invalid JSON in ${filePath}: ${error.message}`);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      throw new AgentPermitError(`Missing required file: ${filePath}`);
    }
    throw error;
  }
}

function sampleTrace(): { actions: ProposedAction[] } {
  return {
    actions: [
      {
        id: 'read-readme',
        tool: 'read',
        kind: 'file.read',
        path: 'README.md',
        description: 'Read local project context.'
      },
      {
        id: 'review-network',
        tool: 'web_fetch',
        kind: 'network.request',
        url: 'https://example.com/policy-notes',
        description: 'Network requests are warnings by default.'
      }
    ]
  };
}
