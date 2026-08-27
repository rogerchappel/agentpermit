import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const expected = [
  'npm run check --if-present',
  'npm test --if-present',
  'npm run build --if-present',
  'npm run smoke --if-present',
  'npm run package:smoke --if-present',
];
const lines = workflow.split('\n');
const npmBranches = lines
  .map((line, index) => ({ line: line.trim(), index }))
  .filter(({ line }) => line === 'npm ci' || line === 'npm install')
  .map(({ index }) => {
    const elseIndex = lines.findIndex((line, candidate) => candidate > index && line === '            else');
    const endIndex = lines.findIndex((line, candidate) => candidate > elseIndex && line === '            fi');
    return lines.slice(elseIndex + 1, endIndex);
  });

assert.equal(npmBranches.length, 2, 'expected package-lock and no-lock npm branches');
for (const [index, fallback] of npmBranches.entries()) {
  const commands = fallback
    .map((line) => line.trim())
    .filter((line) => line.startsWith('npm '));
  assert.deepEqual(commands, expected, `npm fallback ${index + 1} command sequence diverged`);
}

console.log('CI npm fallback sequences are consistent.');
