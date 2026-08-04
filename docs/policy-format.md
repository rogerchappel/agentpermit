# Policy format

`agentpermit.policy.json` contains a version, a name, a default effect, and a
list of rules.

A rule matches only when every specified matcher matches the action. Omitted
matchers behave like wildcards. If several rules match, AgentPermit chooses the
strongest effect: `deny`, then `warn`, then `allow`.

Supported matchers:

- `tools`
- `kinds`
- `paths`
- `commands`
- `urls`
- `targets`

Use `*` for a wildcard that does not cross `/` and `**` for broad matching that
can cross `/`. Separators next to wildcards remain required: `**/.env` matches
`nested/.env`, not the root-level `.env`, so list both patterns when both forms
should match.
