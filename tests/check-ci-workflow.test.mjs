import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { checkWorkflow } from '../scripts/check-ci-workflow.mjs';

const validWorkflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const npmBranchStart = validWorkflow.indexOf('          elif [ -f package-lock.json ]; then');
const npmBranchEnd = validWorkflow.indexOf('          else\n', validWorkflow.indexOf('npm run package:smoke --if-present', npmBranchStart));
const npmBranch = validWorkflow.slice(npmBranchStart, npmBranchEnd);
const withNpmBranch = (branch) => validWorkflow.slice(0, npmBranchStart) + branch + validWorkflow.slice(npmBranchEnd);

test('CI npm fallback accepts the repository workflow', () => {
  assert.equal(checkWorkflow(validWorkflow), true);
});

test('CI npm fallback rejects missing commands', () => {
  assert.throws(() => checkWorkflow(withNpmBranch(npmBranch.replace('npm run smoke --if-present\n', ''))));
});

test('CI npm fallback rejects reordered commands', () => {
  const reordered = withNpmBranch(npmBranch.replace(
    'npm run check --if-present\n              npm test --if-present',
    'npm test --if-present\n              npm run check --if-present',
  ));
  assert.throws(() => checkWorkflow(reordered));
});

test('CI npm fallback rejects duplicate commands', () => {
  assert.throws(() => checkWorkflow(withNpmBranch(npmBranch.replace(
    'npm run build --if-present\n',
    'npm run build --if-present\n              npm run build --if-present\n',
  ))));
});

test('CI npm fallback rejects changed commands', () => {
  assert.throws(() => checkWorkflow(withNpmBranch(npmBranch.replace('npm test --if-present', 'npm test'))));
});

test('CI npm fallback rejects a missing closing fi', () => {
  const malformed = withNpmBranch(npmBranch.replace('            fi\n', ''));
  assert.throws(() => checkWorkflow(malformed), /expected npm fallback closing fi/);
});
