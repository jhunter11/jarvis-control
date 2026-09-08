# Memory Architecture Experiment Program

**Date:** 2026-07-24 (revised 2026-07-25)
**Status:** Proof of concept complete and runnable. Ledger, temporal, and experiment
layers landed. The bench **runner** is unfinished: see Limitations. Status describes the July 25 checkpoint.
**Sources:** three deep-research reports on agentic memory architecture

## Why

This experiment compares three research reports with the Jarvis memory system:

| Report                             | Subject                                                 | Prior state in Jarvis                                                                     |
| ---------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| (3) Agentic memory architectures   | CoALA typed-hybrid memory cell per sleeve               | Prior qualitative estimate: ~90% built (`023_typed_hybrid_memory`); not measured coverage |
| (2) Deterministic memory semantics | Event-sourced ledger, bitemporality, conflict hierarchy | Not built                                                                                 |
| (4) Experimental program           | 8 arms, workload generator, metric dictionary, gates    | Partial (2-arm retrieval eval only)                                                       |

The harness compares candidate memory architectures on representative Jarvis workloads.
Its results must support backend selection for those workloads, with separate checks for retrieval, answers, and isolation.

## The finding that shaped the design

The Jarvis `flat` backend already applies temporal filters.
`ScopedLexicalRetrievalService` filters superseded revisions, closed validity windows,
and operator-withdrawn fragments in SQL, before ranking.

The proposed flat-versus-temporal comparison must account for those existing filters.
On the initial demo corpus, `flat` and `typed_hybrid` had equal scores.
That result alone cannot measure the value of temporal filtering or establish equal behavior.

The `flat_untyped` experimental control uses tags and lexical ranking without temporal filters.
It relaxes **temporal correctness only**. It must enforce the same scope binding and sensitivity ceiling as every other backend.

## Backends

Five interchangeable backends behind one `MemorySystem` seam, selected by
`createMemorySystem({ backend })` or `JARVIS_MEMORY_BACKEND`. Default stays `flat`.

| Backend          | Role                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| `flat_untyped`   | **Experimental control only.** Returns stale facts by design. Never for production. |
| `flat`           | Current production default: one store, temporally-filtered lexical retrieval        |
| `typed_hybrid`   | CoALA store classes, working memory, propose-only consolidation                     |
| `typed_temporal` | `typed_hybrid` + validity-window reasoning and stale suppression                    |
| `ledger`         | Event-sourced revisions, bitemporal semantics, deterministic projections            |

## Proof of concept

`npm run memory:demo`

The demo uses 11 hand-authored items (`src/memory/demo/sample-memory.ts`) and 5 probe questions.
Each item declares its expected role, so the trace can identify correct retrieval and specific failures.

The corpus deliberately contains a superseded launch date, a policy whose validity
window closed, an operator-withdrawn fragment, a lexical distractor, an evidence chain
for multi-hop questions, and a near-identical fact in a neighbouring client sleeve that
must never appear.

Each answer produces a reasoning trace:

```
  1. authorize  -> read grant on client:acme_corp (deny-first; other sleeves unreadable)
  2. retrieve   -> terms [when, does, the, acme, relaunch, ship]
       [1] acme-launch-date-v2 (semantic) bm25=-2.029
  3. suppress   -> 3 candidate(s) held back
       - acme-launch-date-v1: suppressed: a newer revision supersedes it
  4. compile    -> ready, 115/760 evidence tokens used
  5. resolve    -> answered
       policy: query_specificity_coverage_confidence_v1 (evidence_threshold_met)
       best match: acme-launch-date-v2 coverage=1000/1000 confidence=900/1000
       cites: acme-launch-date-v2
  MEMORY: correct    ANSWER: correct
```

### Two-layer scoring

Score correctness at two independent layers:

- **memory layer**: did retrieval return the required evidence and hold back the stale,
  withdrawn, and out-of-scope items? This measures backend retrieval.

- **answer layer**: did the fixed, model-free resolver reach the right conclusion? It
  considers only compiled survivors, ranks meaningful exact-query coverage discounted by
  fragment confidence, and requires fixed 600/1000 coverage and confidence floors. Keep the resolver constant across backends to isolate the effect of retrieved and compiled evidence.

### Measured result

```
backend         memory    answer    abstain   leaks   behaviour  safety
-----------------------------------------------------------------------
flat_untyped    2/5       3/5       0/2       3       A          FAIL (forbidden evidence surfaced)
flat            5/5       5/5       2/2       0       B          pass
typed_hybrid    5/5       5/5       2/2       0       C          pass
typed_temporal  5/5       5/5       2/2       0       C          pass
ledger          5/5       5/5       2/2       0       B          pass
```

The **behaviour** column groups backends by a digest of their decisions, excluding backend names.
Equal scores can conceal different decisions. The digest separates three behavior groups:

- **B**: `ledger` decides identically to `flat`. It writes through the reducer and reads over the flat substrate. The digest verifies that equality on this corpus.

- **C**: the typed arms re-rank by store class and differ from `flat`.

- `typed_temporal` matches `typed_hybrid` **on this corpus only**, because the
  substrate SQL already filters every temporal case the 11 items contain. The temporal cases in `tests/memory/system/temporal-retrieval.test.ts` exercise that layer separately.

The demo records two findings:

1. **The context compiler filters a stale retrieval.** On the launch-date question the control ranks the
   _stale_ Sept 15 date first (bm25 −2.061, a better lexical match than the current
   −2.029). It suppresses nothing. But the context
   compiler still drops the superseded revision, so the final answer stays correct.
   The separate scores record the retrieval failure despite the correct final answer.

2. **The resolver policy improves answers on these five questions.** Before the resolver policy, the safe backends scored 5/5 on memory but 2/5
   on answers: code-freeze and refund-policy over-answered, while release-checklist cited the
   short brand-palette fragment because the resolver used compiler utility order as answer rank.
   `query_specificity_coverage_confidence_v1` now re-ranks only compiled survivors, requires at
   least two meaningful query terms, and declines weak or low-confidence evidence. Safe backends
   score 5/5 answers and 2/2 expected abstentions with zero leaks. This is still a five-question
   behavioral proof, not a production-calibrated threshold.

## Determinism

The demo fixes the clock, seeds the PRNG (no `Math.random`), and uses stable tie-breaks (`score desc, id asc`).
Each backend uses its own temporary database to prevent shared writes.
Tests assert byte-identical traces across repeated runs.

## Invariants preserved

1. No new cross-sleeve movement. Promotion still requires `shared_approved_bundles`.

2. The control relaxes temporal correctness only, never scope or sensitivity.

3. Working memory stays run-local. Candidate stores stay propose-only.

4. Default backend remains `flat`. Every addition is opt-in.

## Defects found by review, and fixed

Review confirmed seven defects by direct inspection. Each recorded fix has a regression test.

| Defect                                                                                                                  | Why it mattered                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `arms.ts` claimed TypedBasic switched per-store retrieval on. `typed_hybrid.retrieve` returned the same bytes as `flat` | The FlatTag→TypedBasic contrast (the first program hypothesis) could only ever measure noise. Fixed in the backend.      |
| `isRetrievable` encoded the abstain-on-conflict rule but no caller used it. Reads used `isLiveClaim`                    | Reads returned both sides of an unresolved contradiction as current without a ledger decision.                           |
| `handleSplit` conflict-checked parts against pre-command state only                                                     | One SPLIT could commit two contradictory active claims with no conflict flag and no contradiction edge.                  |
| `DeterministicPrng.fromSeed` stored its label without mixing it into the seed                                           | Two "independent" root streams at one seed emitted identical sequences. Any cross-component effect would be an artifact. |
| `loadState` never restored `deletionQueue`, and the test copied the value out of the object under comparison            | The erasure obligation vanished on restart, and the tautological assertion could not fail.                               |
| `localeCompare` ordered the seeded cluster bootstrap and the arm ranking                                                | Host-collation-dependent ordering: the same seed could yield different confidence intervals on a different machine.      |
| The trace fingerprint hashed the backend id                                                                             | Two backends always differed there, so it could not support the cross-backend comparison it appeared to.                 |

Inspection did not confirm one reported defect. The zod payload union rejects excessive nesting before the canonicalizer depth check.
The reducer retains its `try/catch` as an additional check.

## Limitations

- **The bench runner is unfinished.** The [runner draft](https://github.com/jhunter11/jarvis-control/blob/c4d8cc3542118ede9c8b182649f3c1bb61da190d/src/memory/experiment/bench-runner.ts) remains in Git history.
  The September 2026 cleanup removed this unused file from build source and removed its special coverage exclusion.
  The draft has per-item replay machinery but no top-level orchestrator, CLI, or tests. Its `metrics` field contains `null`.
  The experiment components and their tests remain in the source tree. A complete runner still needs implementation and validation.

- **The bench measures no consolidation cost.** The replay harness runs no
  consolidation pass, so `consolidationProposals` is structurally zero. The harness would understate the maintenance cost of an arm that declares consolidation.
  Skip those arms until the replay includes that pass.

- **The running app does not consume the memory interface yet.** Only the demo, bench, and tests call `createMemorySystem`.
  No gateway, chat, or agent path binds it. Backends are swappable in code, via `--backends`, and now via
  `JARVIS_MEMORY_BACKEND`. Runtime integration remains unfinished.

- The demo resolver is a fixed model-free stand-in, not a language model. It exists to
  hold the answer stage constant. Its 600/1000 thresholds need a larger frozen golden set
  before reuse outside this demo.

- The 11-item corpus checks specific behaviors. It does not establish statistical performance. Volume comes from the synthetic
  workload generator, once the runner that drives it exists.
