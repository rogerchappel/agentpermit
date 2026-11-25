# agentpermit Documentation

This directory holds project documentation.

## Contents

- [Contributing guide](../CONTRIBUTING.md)
- [Security policy](../SECURITY.md)
- [Agent instructions](../AGENTS.md)

## JSON Schema validation

The versioned [`policy.schema.json`](../schemas/policy.schema.json) and
[`trace.schema.json`](../schemas/trace.schema.json) describe the policy and
trace structures accepted by AgentPermit. Point an editor's JSON Schema
association at the appropriate file to get completion and structural
validation. These schemas follow JSON Schema Draft 2020-12.

To validate the checked-in examples and fixtures with the same schemas, install
the development dependencies and run:

```sh
npm ci
node --test tests/json-schema.test.mjs
```

The tests cover accepted fixture documents and malformed required fields,
enums, arrays, and object shapes. Runtime validation remains authoritative; the
schemas provide editor feedback and may not express every cross-field runtime
check (such as unique action ids).

## Additional docs

For a hosted documentation site, see the `docs-site/` directory if present.
