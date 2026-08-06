import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const releaseWorkflow = await readFile(
  new URL('../.github/workflows/release.yml', import.meta.url),
  'utf8',
);

test('release metadata uses the maintainer scope and retains the CLI name', () => {
  assert.equal(manifest.name, '@rogerchappel/agentpermit');
  assert.equal(manifest.publishConfig?.access, 'public');
  assert.equal(manifest.bin?.agentpermit, './dist/cli.js');
});

test('installation docs cannot resolve to the unrelated unscoped package', () => {
  assert.match(readme, /npm install @rogerchappel\/agentpermit/);
  assert.doesNotMatch(readme, /npm install(?: --\S+)* agentpermit(?:\s|$)/m);
});

test('tag releases publish the exact inspected tarball before announcing it', () => {
  assert.match(releaseWorkflow, /push:\s*\n\s+tags:\s*\n\s+- 'v\*\.\*\.\*'/);
  assert.match(releaseWorkflow, /artifact="\$\(npm pack[\s\S]+printf 'artifact=%s\\n' "\$artifact" >> "\$GITHUB_OUTPUT"/);

  const publish = releaseWorkflow.indexOf(
    'npm publish "${{ steps.package.outputs.artifact }}" --access public --provenance',
  );
  const githubRelease = releaseWorkflow.indexOf(
    'gh release create "${GITHUB_REF_NAME}" --notes-file RELEASE_NOTES.md "${{ steps.package.outputs.artifact }}"',
  );

  assert.notEqual(publish, -1, 'tag workflow must publish to npm');
  assert.notEqual(githubRelease, -1, 'GitHub release must attach the inspected tarball');
  assert.ok(publish < githubRelease, 'npm publication must precede the GitHub release');
});

test('non-tag events cannot enter the publishing workflow', () => {
  assert.doesNotMatch(releaseWorkflow, /pull_request:|workflow_dispatch:/);
  assert.doesNotMatch(releaseWorkflow, /npm publish[^\n]*--dry-run/);
});
