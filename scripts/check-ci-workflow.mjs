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
  const npmBranches = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line === 'npm ci' || line === 'npm install')
    .map(({ index }) => {
      const elseIndex = lines.findIndex((line, candidate) => candidate > index && line === '            else');
      assert.notEqual(elseIndex, -1, 'expected npm fallback else branch');
      const endIndex = lines.findIndex((line, candidate) => candidate > elseIndex && line === '            fi');
      assert.notEqual(endIndex, -1, 'expected npm fallback closing fi');
      return lines.slice(elseIndex + 1, endIndex);
    });

  assert.equal(npmBranches.length, 1, 'expected only the package-lock npm branch');

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
