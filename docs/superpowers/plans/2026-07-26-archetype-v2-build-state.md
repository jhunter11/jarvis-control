# BUILD STATE: Agent Archetype Generalization V2

> **Resume file.** If a session is cut off, read this top-to-bottom and continue at the first
> unchecked task. The V1 resume file is `2026-07-25-archetype-build-state.md`. Design rationale is
> `2026-07-25-agent-archetype-generalization.md`.

## What changed between V1 and V2

V1 preserved a frozen catalog digest. V2 changes the catalog and establishes a new digest.

```
V1 BASELINE (retired): 34 profiles, sha256 80520874cc872b3f54b136a8e843638828921ae19533d039fd30345f2715676c
V2 BASELINE:           47 profiles, sha256 <filled in by task 5>
```

Keep the stability test to detect accidental catalog changes.
Change its baseline only with an intended catalog revision and the dependent assertions in task 5.

**Check the digest any time:**

```bash
npx tsx -e "import{createHash}from'node:crypto';import{listAgentProfiles}from'./src/agents/profile-catalog';const p=listAgentProfiles();console.log(p.length,createHash('sha256').update(JSON.stringify(p),'utf8').digest('hex'))"
```

## Runtime sleeve selection

V1 reproduced the pinned catalog from archetypes and recipes.
V2 adds pods that target a sleeve selected at runtime.

A recipe supports scoped instances only if **every** member uses a generalizable archetype.
Root, coordinator, operator, and auditor roles depend on state outside the sleeve.
Changing the sleeve alone cannot rebind those roles, so a pod containing one cannot support scoped instances.

Expected split (verify in task 7, do not assume):

| Instantiable                                                                | Not instantiable | Blocked by  |
| --------------------------------------------------------------------------- | ---------------- | ----------- |
| developer, idea, growth, knowledge, finance, marketing, contracts, scouting | jarvis           | root        |
|                                                                             | agency, mcp-x402 | coordinator |
|                                                                             | delivery, seller | operator    |
|                                                                             | settlement       | auditor     |

## Safety invariants that must survive V2

Carried from the catalog validator and SPEC §24. None of these may be relaxed:

- No `task_market` profile receives `execute` access, wallet material, or signing authority.

- **Static** profiles may never bootstrap `client:` sleeve access. V2 does not weaken this: the
  instance path is the "separately authorized temporary grant" the validator error message
  already refers to, and it runs through a different code path with an operator gate.

- Mint instances at `authorityLayer: 'operator'` with a real expiry, never `blueprint`.

- **No instance may hold `execute`.** Outward effect belongs to the `operator` archetype, which is
  not generalizable, so no instantiable pod contains one. The instance validator must enforce this rule.

- The 100-profile catalog cap **stays**. Instances live in the access-control plane, not in
  `listAgentProfiles()`, so they do not consume it. (The V1 resume file incorrectly listed a cap increase as V2 work.)

## Tasks

- [ ] **1. SPEC §24 first.** Adding profiles is spec drift: §24 pins the seeded tree and the
      durable-coordinator list. Update the tree, the durable sentence, and add a
      "Pod recipes and scoped instances" subsection. Spec before code.

- [ ] **2. Regularize sleeve derivation.** Verifier `sleeveRule` `'explicit'` → `'pod_reviews'`.
      Drop `'explicit'` from `SleeveRuleSchema`. **Delete `PodMember.sleeve` entirely**. After
      this, a sleeve is a pure function of (pod, archetype) with no escape hatch. Renames:
      `contract_reviews`→`contracts_reviews`, `security_reviews`→`seller_reviews`,
      `submission_reviews`→`scouting_reviews`, evaluation-runner `improvement`→`knowledge_reviews`,
      toolsmith `improvement`→`knowledge`. `agency:improvement` disappears.

- [ ] **3. Missing triad members** (+3): `agency-growth-verifier`, `agency-delivery-red`,
      `agency-knowledge-red`.

- [ ] **4. Finance and Marketing pods** (+10). Agency domain, 5 members each
      (specialist/advisor/builder/reviewer/verifier). Only already-allowlisted agency tool
      namespaces: if either pod needs a new namespace, stop and reconsider the pod, do not widen
      `TOOL_NAMESPACES`. Neither pod gets an operator: drafting is inward, publishing is not.

- [ ] **5. Re-baseline.** Regenerate `tests/agents/__fixtures__/catalog-baseline.json`, update
      `BASELINE_SHA256` and rewrite the test header comment. Dependent assertions to update:
      `profile-catalog.test.ts` (length 34→47, id list, durable list),
      `profile-access-bootstrap.test.ts` (`profileCount`, `knowledgeScopeCount`, `sleeveCount`,
      `sleeveGrantCount`, `toolGrantCount`).

- [ ] **6. Stale blueprint-grant reconciliation.** Task 2 renames sleeves, which leaves active
      blueprint grants that no longer appear in the manifest, so `ProfileAccessBootstrap.install()`
      would throw `CATALOG_ACCESS_DRIFT` against an existing database. Revoke active blueprint
      grants for catalog agents that are absent from the manifest, before the drift check.
      Without reconciliation, startup fails against an already-bootstrapped database.

- [ ] **7. `src/agents/pod-instances.ts`**: pure planner. `planPodInstance()` returns profiles,
      control scope, knowledge scope, sleeves, and grants without touching the database.

- [ ] **8. `PodInstanceInstaller`**: operator-gated write path.

- [ ] **9. `tests/agents/pod-instances.test.ts`**: instantiable set, all three binding kinds,
      every fail-closed path.

- [ ] **10. Full verify**: `typecheck && test && lint && format:check && build`.

## Ordering rule

Tasks 2-4 all change the digest, so the stability test is red between task 2 and task 5. That is
expected. Do not "fix" it early by re-baselining before task 4 lands. Tasks 7-9 are additive and independent of 2-6. They can start from a clean tree after an interrupted session.

## Non-obvious constraints discovered while planning

- **Agent ids cannot hold underscores** (`AgentIdSchema` = `^[a-z][a-z0-9-]{2,63}$`) but
  **client sleeves cannot hold hyphens** (`^client:[a-z][a-z0-9_]{2,62}$`). An instance binding
  carries one `subjectId` in underscore form and converts to hyphens for agent ids.

- **Instances cannot use `AgentProfileCatalogSchema`.** It requires exactly one root, forbids
  `client:` sleeves, and requires a trust-domain prefix on every sleeve. Instances use
  `AgentProfileSchema` plus their own validator. Keep the static-catalog rules intact.

- **Knowledge scopes only have `harness|project|client` kinds**, but control scopes have
  `company|client|project`. Mapping: client → `client:<subject>`, company →
  `project:company_<subject>`, project → `project:project_<subject>`. The kind is always
  recoverable, so two bindings of different kinds can never collide on one knowledge scope.

- Reviewers cannot read the sleeve they critique. Inputs arrive as pinned
  artifact digests (`*_pinned` opening stage), not as sleeve reads. Preserve that restriction.

## Known drift explicitly NOT addressed in V2

- No code in `src/` reads `lifecycle: 'template'`. It is descriptive metadata on the
  dashboard only. Removing it is a separate change with its own digest churn.

- Pods are still not uniform: `growth` has two builders and no advisor, `contracts` has no lead
  specialist (its builder is the lead), `agency` has only an advisor. The archetype layer must enforce the safety rules across these different compositions.
