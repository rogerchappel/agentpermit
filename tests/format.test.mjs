import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, formatExplain } from '../dist/index.js';

test('escapes delimiters in every dynamic explanation table cell', () => {
  const evaluation = evaluate({
    version: 1,
    name: 'table-escaping',
    defaultEffect: 'warn',
    rules: [
      {
        id: 'allow|docs',
        effect: 'allow',
        reason: 'docs | approved',
        kinds: ['file.read'],
        paths: ['docs/**']
      }
    ]
  }, [{ id: 'read|docs', tool: 'read', kind: 'file.read', path: 'docs/README.md' }]);

  const row = formatExplain(evaluation).split('\n').find((line) => line.startsWith('| allow'));

  assert.equal(row, '| allow | read\\|docs | allow\\|docs | docs \\| approved |');
  assert.equal(row.match(/(?<!\\)\|/g)?.length, 5, 'row should contain exactly four table columns');
});
