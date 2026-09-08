# Agent Archetype Generalization

## Problem Statement

`src/agents/profile-catalog.ts` hardcodes 34 profiles, each pinned to one sleeve (`sleeve: 'engineering'` → `agency:engineering`).
The catalog declares `lifecycle: 'template'` on 25 profiles, but no code reads that field.
A Developer pod cannot target a second sleeve. Each pod repeats its blue/red/verify roles.
Growth lacks a verifier, and Delivery and Knowledge lack reviewers.

The schema caps the catalog at 100 profiles. At 5 pods × 5 roles × N clients, the catalog exceeds that cap above N=4.

## Proposed Solution

Split the catalog into three layers.

**1. Archetype layer.** Define each archetype once, using the existing `relation` enum. Each archetype owns a domain-invariant framework: stage sequence, budget class, output-contract shape, escalation rule.

**2. Pod recipe layer.** Define one recipe per function. A recipe names which archetypes compose it plus domain stage/output vocabulary: "Developer" = advisor + builder + reviewer + verifier under a specialist.

**3. Instance layer.** Create instances per scope, outside the catalog. Recipe + scope → concrete profiles with concrete sleeves, registered through the existing `RegisterControlScope`/`RegisterMemorySleeve`/`IssueAgentSleeveGrant` machinery, which already supports `client|company|project` kinds.

### Generalization verdict

| Archetype                                        | Existing instances                                                                                                               | Verdict                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| specialist, advisor, builder, reviewer, verifier | developer, architect, code-blue/red, release-verifier, idea-*, growth pod, workflow-mapper, curator, toolsmith, publisher, scout | **Generic.** Produces artifacts and evidence within its sleeve.                 |
| root (jarvis)                                    | jarvis                                                                                                                           | **Singleton.** Validator hard-requires exactly one.                             |
| coordinator                                      | agency, mcp-x402                                                                                                                 | **Per-scope.** Durable identity holding cross-run scope state.                  |
| operator                                         | automation-worker, seller-operator                                                                                               | **Per-scope.** Shape generalizes. The gate predicate does not.                  |
| auditor                                          | settlement-auditor                                                                                                               | **Per-scope.** Reconciles an external ledger. The invariant is domain-specific. |
| advisor-to-coordinator                           | chief-of-staff                                                                                                                   | **Per-scope.** Depends on coordinator context.                                  |

The proposed distinction is whether a role needs state outside its sleeve. Management needs operator context, operators affect external systems, and auditors reconcile external records.
These roles need scope-specific identities and checks. The inward-facing roles can share archetypes.

## Assumptions & Bets

Assume sleeve isolation and run-bounded instances remain required. Test whether five generic archetypes and about seven recipes cover the planned sleeves.
Do not preserve the 34-node tree solely for its dashboard appearance.

## Thinking Level

Use external-state dependencies to decide which roles can share archetypes. Validate the distinction against the catalog before changing runtime behavior.

## Skill Dependencies

Zod schema refactor, per-scope grant issuance, catalog-drift detection under dynamic instances, dashboard projection of archetype vs. instance.

## Alternatives Considered

| Alternative                   | Why Rejected                                                           |
| ----------------------------- | ---------------------------------------------------------------------- |
| Keep hardcoding per sleeve    | Exceeds the 100 cap as clients grow. Some pods already lack reviewers. |
| One omni-agent per sleeve     | Combines author and reviewer responsibilities.                         |
| Make coordinators generic too | Durable scope state cannot be shared without leaking sleeves.          |

## Quadrant Coverage

| Quadrant         | Element                                     |
| ---------------- | ------------------------------------------- |
| Individual Outer | Archetype/recipe/instance modules           |
| Individual Inner | Boundary-crossing criterion                 |
| Collective Outer | Access-control registry, catalog validator  |
| Collective Inner | What operators approve when a pod is minted |

## Time Horizons

- **V1:** extract archetypes + recipes. Regenerate the current 34 profiles identically (byte-stable catalog hash): pure refactor, no behavior change.

- **V2:** runtime instantiation into per-scope sleeves. Add missing reviewers/verifiers. Finance and Marketing recipes (neither exists today: Growth is sales, not marketing).

- **Not planned:** agent-created agents, cross-sleeve coordinators, generic operators.
