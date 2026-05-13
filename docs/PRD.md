# AgentPermit PRD

Status: in-progress

## Pitch

A local policy simulator for agent tool permissions: feed it proposed actions, see allow/deny reasons before anything runs. 🛂

## Why It Matters

Agentic workflows need reviewable guardrails. Humans and agents should be able to test policy decisions offline with fixtures.

## Target users

- CLI authors who want deterministic local checks.
- Agentic coding workflows that need safe, inspectable fixtures.
- Maintainers who prefer useful small tools over SaaS dashboards.

## V1 Scope

- TypeScript Node.js CLI, local-first, no hidden network calls.
- Fixture-backed parser and planner core.
- Human-readable text output and JSON output.
- `init`, primary check/run command, and `explain`/`report` style command where appropriate.
- Useful examples under `examples/` and tests under `fixtures/`.
- Safety defaults: dry-run first, explicit paths, no destructive writes unless a future version adds opt-in mutation.

## Out of Scope

- Hosted service.
- Telemetry.
- Automatic destructive changes.
- LLM dependency.

## CLI/API Sketch

```bash
agentpermit --help
agentpermit init ./demo
agentpermit check ./demo --format text
agentpermit check ./demo --format json
agentpermit explain ./demo
```

## Functional requirements

- Reads only the requested workspace or fixture paths.
- Produces deterministic ordered findings.
- Exits `0` when clean, `1` when findings exceed default policy, `2` for invalid input/config.
- Includes enough context for another developer or agent to act safely.
- Ships fixture-backed tests for clean, warning, and failure cases.

## Verification

- `npm test`
- `npm run check`
- `npm run build`
- `npm run smoke`
- `bash scripts/validate.sh`
- At least one real CLI smoke against `fixtures/` or `examples/`.

## Source attribution

Inspired by permission policy engines and agent sandbox discussions, reframed as a small local CLI for traces, rules, and explainable decisions.

## Agent Prompt

Build a polished local-first OSS CLI named `agentpermit`. Use StackForge scaffolding, keep the implementation deterministic and fixture-backed, add practical docs with personality, and publish a public GitHub repo under `rogerchappel/agentpermit` after local verification.
