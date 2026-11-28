import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflowPath = new URL('../.github/workflows/ci.yml', import.meta.url);
const workflow = readFileSync(workflowPath, 'utf8');

export function checkWorkflow(source) {
  const expected = [
    'npm run check --if-present',
    'npm test --if-present',
    'npm run build --if-present',
    'npm run smoke --if-present',
    'npm run package:smoke --if-present',
  ];
  const lines = source.split('\n');
  const npmBranches = [];
  const npmInstallIndexes = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line === 'npm ci' || line === 'npm install')
    .map(({ index }) => index);
  assert.equal(npmInstallIndexes.length, 1, 'expected only the package-lock npm branch');

  const installIndex = npmInstallIndexes[0];
  let elseIndex = -1;
  let endIndex = -1;
  for (let index = installIndex + 1; index < lines.length; index += 1) {
    if (lines[index] === '            elif [ -f yarn.lock ]; then'
      || lines[index] === '            elif [ -f pnpm-lock.yaml ]; then') break;
    if (lines[index] === '            else') {
      assert.equal(elseIndex, -1, 'unexpected additional npm fallback else branch');
      elseIndex = index;
      continue;
    }
    if (lines[index] === '            fi') {
      assert.notEqual(elseIndex, -1, 'expected npm fallback else branch');
      endIndex = index;
      break;
    }
  }
  assert.notEqual(elseIndex, -1, 'expected npm fallback else branch');
  assert.notEqual(endIndex, -1, 'expected npm fallback closing fi');
  npmBranches.push(lines.slice(elseIndex + 1, endIndex));

  assert.equal(npmBranches.length, 1, 'expected only the package-lock npm branch');
  assert.match(workflow, /- name: Validate shell syntax\n        run: bash scripts\/check-shell-syntax\.sh/,
    'expected CI to validate shell syntax');

  for (const [manager, command] of [['pnpm', 'pnpm run release:check'], ['npm', 'npm run release:check']]) {
    assert.ok(workflow.includes(`${command}\n              ${manager} run ci:check --if-present`),
      `expected ci:check after ${command}`);
  }
  for (const [index, fallback] of npmBranches.entries()) {
    const commands = fallback
      .map((line) => line.trim())
      .filter((line) => line.startsWith('npm '));
    assert.deepEqual(commands, expected, `npm fallback ${index + 1} command sequence diverged`);
  }

  return true;
}

checkWorkflow(workflow);
console.log('CI npm fallback sequences are consistent.');
