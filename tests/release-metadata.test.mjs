import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');

test('release metadata uses the maintainer scope and retains the CLI name', () => {
  assert.equal(manifest.name, '@rogerchappel/agentpermit');
  assert.equal(manifest.publishConfig?.access, 'public');
  assert.equal(manifest.bin?.agentpermit, './dist/cli.js');
});

test('installation docs cannot resolve to the unrelated unscoped package', () => {
  assert.match(readme, /npm install @rogerchappel\/agentpermit/);
  assert.doesNotMatch(readme, /npm install(?: --\S+)* agentpermit(?:\s|$)/m);
});
