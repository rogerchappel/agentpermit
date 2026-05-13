# AgentPermit

AgentPermit is a local policy simulator for agent tool permissions. Feed it a
proposed action trace and a small policy file; it tells you what would be
allowed, warned, or denied before anything runs.

It is deliberately boring in the best way: deterministic JSON in, deterministic
reasons out, no telemetry, no hosted service, and no LLM dependency.

## Install

```sh
npm install
npm run build
```

For local development, run the CLI from the built output:

```sh
node dist/cli.js --help
```

## Quick start

```sh
agentpermit init ./demo
agentpermit check ./demo --format text
agentpermit check ./demo --format json
agentpermit explain ./demo
```

A workspace contains two files:

- `agentpermit.policy.json` — ordered allow/warn/deny rules.
- `agentpermit.trace.json` — proposed actions from an agent or fixture.

## Example trace

```json
{
  "actions": [
    { "id": "read-prd", "tool": "read", "path": "docs/PRD.md" },
    { "id": "send-status", "tool": "message", "kind": "message.send", "target": "#team" }
  ]
}
```

## Example policy

```json
{
  "version": 1,
  "name": "example-agent-workflow",
  "defaultEffect": "warn",
  "rules": [
    {
      "id": "allow-doc-reads",
      "effect": "allow",
      "reason": "Docs are intentionally reviewable context.",
      "kinds": ["file.read"],
      "paths": ["docs/**", "README.md"]
    },
    {
      "id": "deny-outbound-message",
      "effect": "deny",
      "reason": "Messages leave the machine and need human approval.",
      "tools": ["message"],
      "kinds": ["message.send"]
    }
  ]
}
```

## Commands

- `agentpermit init [target]` writes a starter policy and trace.
- `agentpermit check [workspace] --format text|json` evaluates a trace.
- `agentpermit explain [workspace]` prints a markdown explanation table.
- `agentpermit report [workspace]` emits JSON for automation.

Exit codes:

- `0` — no deny findings.
- `1` — one or more deny findings.
- `2` — invalid input, missing files, or invalid configuration.

## Rule matching

Rules can match by `tools`, `kinds`, `paths`, `commands`, `urls`, and `targets`.
Patterns support `*` for one path segment-ish wildcard and `**` for broad glob
matching. If multiple rules match, the strongest effect wins: deny > warn >
allow. Ties are sorted by rule id for stability.

## Verify

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
node dist/cli.js check fixtures/mixed --format text
```

## Safety

See [docs/SAFETY.md](docs/SAFETY.md). AgentPermit only simulates decisions; it
does not grant permission or execute actions.

## Contributing

Small, fixture-backed changes are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
