# Orchestration notes

AgentPermit is intentionally local-first. Orchestrators should treat it as a
pre-flight simulator, not as an enforcement daemon.

1. Write proposed tool actions to `agentpermit.trace.json`.
2. Keep policy in `agentpermit.policy.json` next to the fixture or workspace.
3. Run `agentpermit check <workspace> --format json` before executing actions.
4. Treat exit code `1` as a review stop and exit code `2` as bad input.

AgentPermit does not grant permissions. It explains what a configured policy
would decide so a human or parent agent can make a safer call.
