# Jarvis Model Economics Design

## Goal

Choose the least-expensive capable execution path and bound context for future model calls. Report observed token and cost telemetry. Require measurements for savings or spend claims.

## Non-goals

- Calling an external or local language model in this MVP.

- Hard-coding provider model names or prices that can become stale.

- Persisting prompts, completions, secrets, or tenant content in the economics ledger.

- Claiming dollar savings from estimated token counts.

## Routing policy

Classify every model-shaped task into one logical tier:

| Tier | Route           | Intended work                                                        | Escalation condition                         |
| ---- | --------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| 0    | `deterministic` | Validation, SQL, graph indexing, Page Studio planning, health checks | None. No model call                          |
| 1    | `local`         | Low-risk classification, extraction, and constrained drafting        | Capability unavailable or validation failure |
| 2    | `economy`       | Multi-source synthesis, ambiguous requests, and ordinary code work   | High risk or repeated validation failure     |
| 3    | `frontier`      | High-risk decisions and work that failed a cheaper capable tier      | Explicit reason required                     |

The router is pure and deterministic. It returns a logical route and reason code, never a provider API identifier. A separate future executor may map logical routes to versioned provider configuration. Risk, required capabilities, and prior validation failures can only move work upward. Preference alone cannot bypass policy.

## Context budgeting

Context fragments carry an ID, priority, provenance, and text. The budgeter:

1. validates bounded input.

2. de-duplicates exact content by SHA-256.

3. orders fragments by priority, then stable input order.

4. selects whole fragments within a hard estimated-token budget.

5. returns selection and omission metadata without returning omitted text.

Label the estimate and use a conservative deterministic character heuristic. Use it to guard capacity. Billing requires separate telemetry. Prompts and content are never written to the usage ledger.

## Usage ledger

`model_usage_log` records actual model-call metadata only. Integer token counts and micro-US-dollar amounts avoid floating-point money. `cost_microusd` is nullable. `cost_basis = unknown` requires it to remain null. The ledger also records a versioned pricing reference when a cost is estimated from a catalog. It never stores request/response content.

Calculate bounded dashboard aggregates in SQL. Report cost coverage as `none`, `partial`, or `complete`, so unknown cost is never rendered as zero. Tier 0 is documented in the routing policy but is not inserted as a model call.

## Dashboard

The operator gets an Economics view and a `model-economics` Page Studio widget. Empty telemetry is an explicit unavailable state. With records, Jarvis shows observed requests/tokens, cache tokens, known spend, unknown-cost request count, route mix, and recent bounded metadata. Require measured evidence for every savings claim.

## Safety and privacy

- Strict schemas and database checks bound every string and number.

- Foreign keys preserve optional client attribution.

- The ledger stores no prompt, response, error body, API key, or tenant payload.

- The dashboard receives only aggregate and allowlisted metadata.

- Provider/model identifiers are operational labels, not executable configuration.

## Verification

Tests cover tier selection and escalation, stable context selection and de-duplication, database invariants, unknown/partial/complete cost coverage, dashboard empty and populated states, Page Studio mapping, and production composition. The full repository quality gate remains required.
