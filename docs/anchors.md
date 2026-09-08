# Content anchors

Line-number references can point to the wrong code after an edit. An anchor names a
claim and records its content digest. A changed claim then requires another review.

## Syntax

In Markdown, put the marker on its own line. The next non-empty line contains the claim:

```markdown
<!-- @anchor tm.mcp.batch-surface -->

The MCP endpoint accepts JSON-RPC arrays and dispatches each element independently.
```

In source files, place the claim after a dash separator on the same line:

```ts
// @anchor tm.mcp.batch-surface - transport accepts JSON-RPC arrays and fans out per element
```

Use dotted, lowercase IDs with the area prefix: `tm.` for task market or `ag.` for agency.
The ID pattern is `^[a-z][a-z0-9]*(\.[a-z0-9][a-z0-9-]*)+$`.
The scanner skips fenced code, so the examples here do not register anchors.

## Lookup

| Occurrences | Verdict     | Meaning                                          |
| ----------- | ----------- | ------------------------------------------------ |
| Exactly 1   | `resolved`  | Found one claim. Derive its current line number. |
| 0           | `missing`   | No claim found. Verification fails.              |
| 2 or more   | `ambiguous` | Duplicate ID. Verification fails.                |

## Digests

The digest normalizes the claim by collapsing whitespace and lowercasing text.
Formatting changes alone therefore do not change it. Each task records the digest
from its last verification.

- **Matching digest:** the recorded claim is unchanged.

- **Different digest:** review the edited claim and its supporting evidence.

- **Missing or ambiguous anchor:** fail verification.

A matching digest checks the text, not the truth of the claim. Changes to supporting
code or evidence can still require review even when the anchored sentence stays the same.

## Placement and checks

Anchor the behavior, invariant, or defect that the task cites. Avoid formatting-only
lines, generated files, fixtures, vendored code, and fenced examples.

`npm run code:index` reports duplicate IDs and malformed anchors.
`tests/knowledge/anchors.test.ts` rejects ambiguous or malformed repository anchors
as part of the release gate.
