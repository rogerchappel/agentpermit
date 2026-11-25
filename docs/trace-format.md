# Trace format

`agentpermit.trace.json` is a list of proposed actions. These actions describe
what another agent or tool wants to do; AgentPermit never executes them. The
Draft 2020-12 editor schema is
[`../schemas/trace.schema.json`](../schemas/trace.schema.json); see
[validation instructions](README.md#json-schema-validation).

Required action fields:

- `id` — stable identifier for reports.
- `tool` — tool surface, such as `read`, `write`, `exec`, or `message`.

Action ids must be unique within a trace. Duplicate ids block the run because
they make review, audit logs, and follow-up instructions ambiguous.

Optional fields include `kind`, `description`, `path`, `command`, `url`,
`target`, and `metadata`.

When `kind` is omitted, AgentPermit infers a practical kind from the tool name.
