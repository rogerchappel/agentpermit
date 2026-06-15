# Release Readiness

Use this checklist before cutting a release or asking a reviewer to trust the package contents.

## Public Package Surface

- Package: `agentpermit`
- Repository: `https://github.com/rogerchappel/agentpermit`
- Published files are controlled by the `files` allowlist in `package.json`.

## CLI Surface

- `agentpermit` -> `./dist/cli.js`

## Verification Commands

- `npm run check`: `tsc --noEmit`
- `npm run test`: `npm run build && node --test tests/*.test.mjs`
- `npm run build`: `tsc`
- `npm run smoke`: `npm run build && bash -c 'node dist/cli.js check fixtures/mixed --format text; test $? -eq 1' && node dist/cli.js check fixtures/clean --format json`
- `npm run package:smoke`: `npm pack --dry-run`
- `npm run release:check`: `npm test && npm run check && npm run build && npm run smoke && npm run package:smoke`

Run `npm run release:check` when available before opening a release PR. When a command is unavailable, use the closest listed command and record the reason in the PR.

## Reviewer Notes

- Confirm README examples still match the CLI or module exports.
- Confirm `npm pack --dry-run` does not include local fixtures, generated logs, or build caches beyond the intended allowlist.
- Confirm GitHub Actions runs the same install and package smoke path used locally.
