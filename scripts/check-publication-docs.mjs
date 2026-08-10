import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const state = JSON.parse(await readFile(new URL('docs/publication-state.json', root), 'utf8'));
const readme = await readFile(new URL('README.md', root), 'utf8');
const readiness = await readFile(new URL('docs/release-readiness.md', root), 'utf8');

assert.equal(state.npm?.package, '@rogerchappel/agentpermit');
assert.equal(typeof state.npm?.published, 'boolean');

if (!state.npm.published) {
  for (const [name, contents] of [['README.md', readme], ['docs/release-readiness.md', readiness]]) {
    assert.doesNotMatch(
      contents,
      /npm (?:install|i|add) @rogerchappel\/agentpermit/,
      `${name} must not advertise a registry install while the package is unpublished`,
    );
  }

  assert.match(readme, /not yet published to npm/i);
  assert.match(readme, /git clone https:\/\/github\.com\/rogerchappel\/agentpermit\.git/);
  assert.match(readme, /npm ci/);
  assert.match(readme, /npm run package:smoke/);
}

console.log(`Publication documentation matches npm published=${state.npm.published}.`);
