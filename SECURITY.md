# Security policy

AgentPermit is a simulator. It should not execute trace actions, contact remote
services, or mutate project files except when `agentpermit init` writes starter
files to a requested directory.

Please report vulnerabilities through GitHub security advisories if available,
or open a minimal public issue if the report does not expose sensitive details.

Useful reports include:

- A trace that causes nondeterministic or misleading decisions.
- A policy parsing bug that silently ignores deny intent.
- Unexpected filesystem writes.
- Any hidden network behavior.
