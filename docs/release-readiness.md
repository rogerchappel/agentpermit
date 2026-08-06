# Release Readiness

Use this checklist before cutting a release or asking a reviewer to trust the package contents.

## Public Package Surface

- Package: `@rogerchappel/agentpermit` (public npm package)
- Repository: `https://github.com/rogerchappel/agentpermit`
- Published files are controlled by the `files` allowlist in `package.json`.

## CLI Surface

- `agentpermit` -> `./dist/cli.js`

## Verification Commands

- `npm run check`: `tsc --noEmit`
- `npm run test`: `npm run build && node --test tests/*.test.mjs`
- `npm run build`: `tsc`
- `npm run smoke`: `npm run build && bash -c 'node dist/cli.js check fixtures/mixed --format text; test $? -eq 1' && node dist/cli.js check fixtures/clean --format json`
- `npm run package:smoke`: pack the tarball, install it in a temporary prefix,
  and run the installed `agentpermit --help`
- `npm run release:check`: `npm test && npm run check && npm run build && npm run smoke && npm run package:smoke`

Run `npm run release:check` when available before opening a release PR. When a command is unavailable, use the closest listed command and record the reason in the PR.

## Release Gate and Sequence

The first npm publication remains gated on external review. Do not push a
release tag until that review is recorded and the release commit has passed
`npm run release:check`. Pull requests and manual workflow runs cannot publish;
only a pushed `v*.*.*` tag starts the release workflow.

For an approved tag, the workflow runs the readiness checks, builds exactly one
tarball, records and verifies its filename, and publishes that same tarball to
npm with public access and provenance. Only after npm publication succeeds does
it create the GitHub release and attach the identical tarball. A publication
failure therefore cannot produce a GitHub release that advertises an
unavailable npm package.

## Reviewer Notes

- Confirm README examples still match the CLI or module exports.
- Confirm package metadata and install docs still use
  `@rogerchappel/agentpermit`; the unscoped npm name belongs to another project.
- Confirm `npm pack --dry-run` does not include local fixtures, generated logs, or build caches beyond the intended allowlist.
- Confirm GitHub Actions runs the same install and package smoke path used locally.
