import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../dist/index.js';

const policy = {
  version: 1,
  name: 'unit-policy',
  defaultEffect: 'warn',
  rules: [
    { id: 'allow-docs', effect: 'allow', reason: 'docs ok', kinds: ['file.read'], paths: ['docs/**'] },
    { id: 'deny-env', effect: 'deny', reason: 'env blocked', paths: ['.env'], kinds: ['file.write'] },
    { id: 'warn-web', effect: 'warn', reason: 'network review', kinds: ['network.request'], urls: ['https://**'] }
  ]
};

test('evaluates allow, warn, and deny decisions deterministically', () => {
  const result = evaluate(policy, [
    { id: 'c', tool: 'write', kind: 'file.write', path: '.env' },
    { id: 'a', tool: 'read', kind: 'file.read', path: 'docs/PRD.md' },
    { id: 'b', tool: 'web_fetch', kind: 'network.request', url: 'https://example.com' }
  ]);

  assert.equal(result.ok, false);
  assert.deepEqual(result.totals, { allow: 1, warn: 1, deny: 1 });
  assert.deepEqual(result.findings.map((finding) => finding.actionId), ['a', 'b', 'c']);
  assert.deepEqual(result.findings.map((finding) => finding.ruleId), ['allow-docs', 'warn-web', 'deny-env']);
});

test('uses strongest matching rule when multiple rules match', () => {
  const result = evaluate({ ...policy, rules: [
    { id: 'allow-env', effect: 'allow', reason: 'too broad', paths: ['.env'] },
    { id: 'deny-env', effect: 'deny', reason: 'safer rule', paths: ['.env'] }
  ] }, [{ id: 'write-env', tool: 'write', kind: 'file.write', path: '.env' }]);

  assert.equal(result.findings[0].effect, 'deny');
  assert.equal(result.findings[0].ruleId, 'deny-env');
});

test('blocks traces with duplicate action ids', () => {
  const result = evaluate(policy, [
    { id: 'same', tool: 'read', kind: 'file.read', path: 'docs/one.md' },
    { id: 'same', tool: 'read', kind: 'file.read', path: 'docs/two.md' }
  ]);

  assert.equal(result.ok, false);
  assert.equal(result.integrity.length, 1);
  assert.equal(result.integrity[0].ruleId, 'trace.duplicateActionId');
  assert.deepEqual(result.integrity[0].evidence, ['actionId=same', 'count=2']);
});
