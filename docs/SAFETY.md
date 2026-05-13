# Safety model

AgentPermit never executes trace actions. It reads JSON, evaluates rules, and
prints reasons. That makes it useful as a dry-run checkpoint for agentic tools.

- No telemetry.
- No hosted service.
- No LLM dependency.
- No mutation outside `agentpermit init`, which writes sample files only to the
  requested directory and refuses to overwrite existing files.
- Deterministic ordering for findings.

Use deny rules for actions that affect people, secrets, production systems, or
privileged machine state. Use warn rules for actions that are safe to review but
should not be invisible.
