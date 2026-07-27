import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const cli = path.resolve('dist/cli.js');

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
}

test('clean fixture exits zero with json totals', () => {
  const result = run(['check', 'fixtures/clean', '--format', 'json']);
  assert.equal(result.status, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, true);
  assert.equal(body.totals.allow, 2);
});

test('help and version flags exit successfully', () => {
  const help = run(['--help']);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /Usage: agentpermit/);

  const version = run(['--version']);
  assert.equal(version.status, 0, version.stderr);
  assert.match(version.stdout, /^0\.1\.0/);
});

test('mixed fixture exits one and prints reasons', () => {
  const result = run(['check', 'fixtures/mixed', '--format', 'text']);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /\[DENY\] 03-write-env/);
  assert.match(result.stdout, /Network lookups should be reviewed/);
});

test('invalid policy exits two', () => {
  const result = run(['check', 'fixtures/invalid']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /defaultEffect/);
});

test('init writes sample files without network calls', () => {
  const target = mkdtempSync(path.join(tmpdir(), 'agentpermit-'));
  const result = run(['init', target]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Initialized AgentPermit workspace/);
  assert.deepEqual(readdirSync(target).sort(), ['agentpermit.policy.json', 'agentpermit.trace.json']);
  assert.doesNotThrow(() => JSON.parse(readFileSync(path.join(target, 'agentpermit.policy.json'), 'utf8')));
  assert.doesNotThrow(() => JSON.parse(readFileSync(path.join(target, 'agentpermit.trace.json'), 'utf8')));
});

for (const existingFile of ['agentpermit.policy.json', 'agentpermit.trace.json']) {
  test(`init leaves the directory unchanged when ${existingFile} exists`, () => {
    const target = mkdtempSync(path.join(tmpdir(), 'agentpermit-'));
    const existingContents = '{"sentinel":true}\n';
    writeFileSync(path.join(target, existingFile), existingContents);

    const result = run(['init', target]);

    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, new RegExp(`^agentpermit: Refusing to initialize: ${existingFile} already exists\\n$`));
    assert.doesNotMatch(result.stderr, /\n\s+at /);
    assert.deepEqual(readdirSync(target), [existingFile]);
    assert.equal(readFileSync(path.join(target, existingFile), 'utf8'), existingContents);
  });
}
