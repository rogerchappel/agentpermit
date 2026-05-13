# Contributing

Thanks for helping make AgentPermit safer and clearer.

## Development

```sh
npm install
npm test
npm run check
npm run build
npm run smoke
```

Prefer small changes with fixtures. If behavior changes, add or update a trace
under `fixtures/` and cover it with `node:test`.

## Design principles

- Local-first beats clever.
- Deterministic output beats hidden magic.
- Deny reasons should be useful to a tired human reviewer.
- No telemetry, hosted dependency, or LLM requirement.
