import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePolicyJson, parseTraceJson, normalizeAction, normalizePath, inferKind } from '../dist/index.js';

test('policy schema accepts and preserves valid rule boundaries', () => {
  const policy = parsePolicyJson({
    version: 1, name: ' boundary ', defaultEffect: 'deny',
    rules: [{ id: 'r1', effect: 'allow', reason: 'approved', paths: ['src/**'], tools: ['read'] }]
  }, 'fixture');
  assert.deepEqual(policy, {
    version: 1, name: ' boundary ', defaultEffect: 'deny',
    rules: [{ id: 'r1', effect: 'allow', reason: 'approved', paths: ['src/**'], tools: ['read'] }]
  });
});

test('policy schema rejects malformed object, version, effect, and matcher types', () => {
  const valid = { version: 1, name: 'p', defaultEffect: 'deny', rules: [] };
  for (const [value, message] of [
    [null, /must be an object/],
    [{ ...valid, version: 2 }, /version 1/],
    [{ ...valid, defaultEffect: 'permit' }, /must be allow, warn, or deny/],
    [{ ...valid, rules: [{ id: 'r', effect: 'allow', reason: 'x', paths: [1] }] }, /array of strings/]
  ]) assert.throws(() => parsePolicyJson(value, 'fixture'), message);
});

test('trace schema accepts optional strings and rejects malformed boundary values', () => {
  assert.deepEqual(parseTraceJson({ actions: [{ id: 'a', tool: 'read', path: 'src\\main.ts' }] }, 'fixture'), [
    { id: 'a', tool: 'read', path: 'src\\main.ts' }
  ]);
  assert.throws(() => parseTraceJson({ actions: [{ id: '', tool: 'read' }] }, 'fixture'), /non-empty string/);
  assert.throws(() => parseTraceJson({ actions: [{ id: 'a', tool: 'read', path: 42 }] }, 'fixture'), /must be a string/);
});

test('normalization canonicalizes separators and infers known tool kinds', () => {
  assert.equal(normalizePath('.\\src\\main.ts'), 'src/main.ts');
  assert.deepEqual(normalizeAction({ id: 'a', tool: 'read', path: 'src\\main.ts' }), {
    id: 'a', tool: 'read', path: 'src/main.ts', kind: 'file.read'
  });
  assert.equal(inferKind('custom-tool'), 'unknown');
  assert.equal(normalizeAction({ id: 'b', tool: 'exec', kind: 'custom.kind' }).kind, 'custom.kind');
});
