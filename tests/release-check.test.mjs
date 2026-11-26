import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));

test('release:check runs every required validation step in order', () => {
  const expected = [
    'npm test',
    'npm run check',
    'npm run docs:check',
    'npm run ci:check',
    'npm run shell:check',
    'npm run build',
    'npm run smoke',
    'npm run package:smoke',
  ];
  const actual = manifest.scripts['release:check'].split(' && ');
  assert.deepEqual(actual, expected);
});
