# Remaining Work Provisioning: Agent-Executable Packets

**Date:** 2026-07-22
**Status:** Provisioning ledger for `2026-07-22-production-reliability-self-management.md`
**Supersedes:** nothing. This translates the 32-task roadmap into assignable units.

## Problem Statement

The 32-task roadmap defines dependencies but leaves file ownership, normative spec sections, and completion checks unspecified.
For example, Task 6, pending execution semantics, spans Supervisor, queue-cycle, direct API, recovery,
read models, and every existing consumer of `succeeded`. Each assignment needs an explicit subset of that work.

Add a **file-ownership map** and a **machine-checkable completion rule for each packet**.

## Verified Starting State

The following table records checks against the tree at this checkpoint:

| Claim                    | Verified                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Task 2 complete          | Yes: `src/reliability/canonical.ts` (553 L), `identities.ts` (372 L), 1,362 test lines          |
| Task 3 in progress       | Yes: `primary-evidence-reader.ts` (555 L) exists. **no settlement writer, no composition root** |
| Task 4 substrate green   | Yes: `verification-freeze-repository.ts` (777 L) + migration 018 (463 L)                        |
| Freeze substrate dormant | **Confirmed**: only tests import it. Zero production callers                                    |
| Tasks 5-32 not started   | Confirmed: `supervisor.ts:187` still writes `status: 'succeeded'` directly                      |

## Provisioning Principle

The dependency graph defines prerequisites. File ownership determines which assignments can run concurrently. Lanes below are cut so that two
agents in different lanes can never edit the same file. Within a lane, work is strictly serial.

A packet is assignable only when it names: owned paths, forbidden paths, one normative spec
anchor, and one verification command.

## Lane Ownership Map

| Lane                                 | Owns                                                                                                  | Concurrency                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| **A: Settlement spine**              | `src/queue/**`, `src/agents/supervisor.ts`, `src/db/**`, `src/dashboard/**`                           | Serial, one agent                 |
| **B: Reliability ledger & observer** | `src/reliability-ledger/**` (new), `src/channels/telegram*`, `config/schedule*`, `scripts/runtime/**` | Serial within lane. Parallel to A |
| **C: Release & activation**          | `scripts/release/**`, `.github/workflows/**`, `deploy/**`                                             | Blocked until A6 + B7             |
| **D: Improvement**                   | `src/economics/**`, ToolSmith module, improvement dashboard view                                      | Blocked until A5                  |
| **E: Governed self-editing**         | `src/self-edit/**` (new), workbench UI                                                                | Blocked until A7 + C1             |
| **F: Acceptance**                    | evidence/attestation only                                                                             | Blocked until C5 + E6             |

Lane B is safe to parallelize because §5.1 puts the ledger in a **physically separate
SQLite** (`$STATE_ROOT/reliability/reliability.sqlite`, mode `0600`). This allows parallel work because everything else shares the settlement transaction.

## Wave 1: Assignable Now

### A1 · Close Task 3: private settlement writer + observer-only composition root

- **Owns:** `src/reliability/primary-settlement-writer.ts` (new), `src/reliability/composition-root.ts` (new), `tests/reliability/primary-authority-boundaries.test.ts`

- **Must not touch:** `src/queue/**`, `src/agents/**`, `src/dashboard/**`

- **Spec anchor:** §4.1 process/trust boundaries, §5.2 primary database additions

- **Done when:** the forbidden-import test proves no gateway, agent, or worker path can reach
  the writer. The writer refuses a schema version other than 19. `npx vitest run tests/reliability` green

- **Unblocks:** Task 4 acceptance, A2, and all of Lane B

### B0 · Blocked: Lane B opens after A1

Lane B's first two packets (B1 ledger, B2 schedule) both depend on the Task 3 port being
closed. They may then run **concurrently with each other and with Lane A**.

## Wave 2: Three Agents in Parallel (after A1)

### A2 · Task 5: registered daily-report candidate adapter

- **Owns:** `src/queue/daily-report-candidate-adapter.ts` (new), `clients/acme_corp/automations/**`

- **Spec anchor:** §8.1 interface contracts, §8.3 initial exact verifier

- **Done when:** source/result/artifact/journal digests are independently reproducible from a
  fresh process, and no worker output or request text can select a path or scope

### B1 · Task 13: independent reliability ledger

- **Owns:** `src/reliability-ledger/**` (new), its migrations

- **Must not touch:** `src/db/**` (primary database)

- **Spec anchor:** §5.1 storage separation, §5.3

- **Done when:** migrations replay clean, append-only/CAS guards hold, file mode is `0600`,
  and the gateway receives only the bounded reader

### B2 · Task 11: approved schedule and activation history

- **Owns:** `config/schedule*`, `src/config/schedule-*.ts` (new)

- **Spec anchor:** §6.1 interfaces

- **Done when:** zero, multiple, and mismatched schedules all return `NO_GO`. No text or agent
  can alter tenant, automation, time, verifier, or activation

## Wave 3: The High-Risk Split

**Task 6 is the single highest-blast-radius item in the roadmap** and must not be one packet.
It changes the meaning of every existing `succeeded` row and touches every consumer. Split:

### A3a · Task 6 core: pending semantics at the write path

- **Owns:** `src/queue/contracts.ts`, `src/queue/automation-cycle.ts`, `src/agents/supervisor.ts`

- **Done when:** no ordinary runtime path can write new `succeeded`. Direct API returns a bounded `202`

### A3b · Task 6 sweep: consumers and legacy labeling

- **Owns:** `src/dashboard/**`, gateway routes, affected tests

- **Done when:** every read model reflects pending state and historical rows read `legacy_unverified`

Review the A3a semantic change separately from the A3b consumer updates. Smaller diffs make it easier to detect reintroduced unverified success states.

Concurrent in Wave 3: **B3** (Task 15 Telegram transport, after B1) and **B5** (Task 12
occurrence materializer, after A2 + B2).

## Waves 4+: Deliberately Coarser

Remaining packets stay at roadmap-task granularity:

- **Lane A:** A4 (Task 7 verifier) → A5a/A5b (Task 8 finalizer: split registry/journal from the
  four concrete projections) → A6 (Task 9 restart matrix) → A7 (Task 10 dashboard)

- **Lane B:** B4 (Task 16 outbox) → B6 (Task 14 observer, joins A4) → B7 (Task 17 readiness)

- **Lane C:** Tasks 18 → 19 → 20 → 21 → 22

- **Lane D:** Tasks 23 → 24 → 25

- **Lane E:** Tasks 26 → 27/28 → 29 → 30 → 31

- **Lane F:** Task 32

Defer packet-level ownership until the earlier waves establish the file map. Re-run this provisioning pass at each wave boundary.

## Standing Contract for Every Packet

Each agent receives, verbatim:

1. **Owned paths** and **forbidden paths** (above).

2. **One normative spec anchor.** The specs already carry per-component "Failing-first tests"
   sections: those are the acceptance criteria. Do not invent new ones.

3. **Write the failing test first**, per repository convention.

4. **Verification:** focused `npx vitest run tests/<area>`, then the full gate:
   `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build &&
npm run taskmarket:build && npm run memory:graph`. Branch coverage ≥ 85% (currently 85.25%,
   thin margin: do not assume headroom).

5. **Never weaken a test or threshold to pass.**

6. **Update the checkpoint table** in the roadmap with fresh evidence, and state what remains
   unimplemented rather than rounding up.

## Assumptions, Bets, and the Scope Flag

**We assume** the lane cut holds: that Lane B never needs to write the primary database. If
Task 12's occurrence materializer turns out to require primary writes, B5 must move into
Lane A and the parallelism claim shrinks to B1/B3/B4 only.

**We bet** that file-ownership lanes plus machine-checkable done-whens remove the need for a
supervising orchestrator, at the cost of a re-provisioning pass every wave.

**Scope risk:** this roadmap is 30 remaining complex
tasks, estimated at 24-36 sessions plus a real 14-day acceptance window, and it delivers
_proof-gated reliability for an automation product that has no paying client_. The recorded
first-dollar path is the $750 agency pilot, blocked on legal identity and invoicing: not on
engineering. Lanes A and B produce the immediate reliability outcome: automation stops
claiming success it cannot prove, and the operator gets alerted when it fails. Lanes C, D, and
E are release attestation, ToolSmith durability, and governed self-editing: useful engineering, but they do not resolve the recorded legal-identity and invoicing blockers.

**Recommendation:** commit to Lanes A and B. Treat C/D/E as a separate decision made _after_
A7 lands, not as a pre-approved continuation. That is a scope judgement for the operator, not
one an agent should quietly make by working down the list.
