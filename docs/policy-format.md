# Policy format

`agentpermit.policy.json` contains a version, a name, a default effect, and a
list of rules.

## Versioning and compatibility

The top-level `version` is the policy schema version, not the version of the
AgentPermit program or of a particular policy file. The current schema is
version `1`; write `"version": 1` in every policy. The validator accepts this
version and rejects unsupported versions rather than guessing how to interpret
their fields.

Schema changes that preserve the meaning of existing version-1 policies (such
as adding an optional field with a safe default) may remain version 1. A change
that alters interpretation, removes a field, or requires new structure must
introduce a new schema version. Consumers should not silently reinterpret a
version-1 file as version 2.

For a future incompatible schema, publish the new version alongside a
migration guide with a before/after example, keep version-1 support during a
documented transition where practical, and only remove it in a separately
announced breaking release. For example, migrating a version-1 policy means
reviewing each rule's intent and explicitly changing its version; do not
mechanically relabel it if version 2 changes matcher or effect semantics:

```json
// version 1 (current)
{
  "version": 1,
  "name": "example",
  "default": "deny",
  "rules": [{ "effect": "allow", "tools": ["read_file"] }]
}
```

If a future version 2 changes how matchers are expressed, its migration guide
must show the corresponding version-2 rule shape and explain how to verify
equivalent behavior before updating the version field.

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
