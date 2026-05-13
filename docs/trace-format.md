# Trace format

`agentpermit.trace.json` is a list of proposed actions. These actions describe
what another agent or tool wants to do; AgentPermit never executes them.

Required action fields:

- `id` — stable identifier for reports.
- `tool` — tool surface, such as `read`, `write`, `exec`, or `message`.

Optional fields include `kind`, `description`, `path`, `command`, `url`,
`target`, and `metadata`.

When `kind` is omitted, AgentPermit infers a practical kind from the tool name.
