import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';

const ajv = new Ajv2020({ allErrors: true });
const loadSchema = async (name) => JSON.parse(await readFile(new URL(`../schemas/${name}.schema.json`, import.meta.url), 'utf8'));
const loadFixture = async (name) => JSON.parse(await readFile(new URL(`../fixtures/${name}`, import.meta.url), 'utf8'));

test('policy schema accepts repository examples and rejects malformed policies', async () => {
  const validate = ajv.compile(await loadSchema('policy'));
  for (const file of ['clean/agentpermit.policy.json', 'mixed/agentpermit.policy.json']) {
    assert.equal(validate(await loadFixture(file)), true, `${file}: ${ajv.errorsText(validate.errors)}`);
  }
  assert.equal(validate({ version: 2, name: 'bad', defaultEffect: 'permit', rules: [] }), false);
  assert.equal(validate({ version: 1, name: 'bad', defaultEffect: 'allow', rules: [{ id: 'r', effect: 'allow' }] }), false);
  assert.equal(validate({ version: 1, name: 'bad', defaultEffect: 'allow', rules: [{ id: 'r', effect: 'allow', reason: 'ok', paths: 'src/**' }] }), false);
});

test('trace schema accepts repository examples and rejects malformed actions', async () => {
  const validate = ajv.compile(await loadSchema('trace'));
  for (const file of ['clean/agentpermit.trace.json', 'mixed/agentpermit.trace.json']) {
    assert.equal(validate(await loadFixture(file)), true, `${file}: ${ajv.errorsText(validate.errors)}`);
  }
  assert.equal(validate({ actions: [{ id: 'a' }] }), false);
  assert.equal(validate({ actions: [{ id: 'a', tool: 'read', metadata: [] }] }), false);
  assert.equal(validate({ actions: 'not-an-array' }), false);
});
