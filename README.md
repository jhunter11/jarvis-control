# Jarvis Control

A TypeScript control plane for AI workflows. It combines a durable task queue, scoped memory, model routing, and typed authorization records.
This repository is a curated public snapshot of a private working project.

## Start with the source tour

```bash
node explore.mjs
```

The menu runs without installed dependencies. It explains the refusal paths and links each one to its source.

## What the project implements

Model execution requires a durable operator enablement record. The web server accepts only a loopback bind address.
The server resolves tenant scope, and memory backends check scope before returning records.
These controls have tests for their stated boundaries. They do not constitute a security proof or a production audit.

| Component                                                           | Implementation                                                   |
| ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [Retrieval](src/knowledge/lexical-retrieval-service.ts)             | SQLite FTS5 and BM25 over scoped Markdown fragments              |
| [Context compiler](src/knowledge/context-compiler.ts)               | Deduplication, ranking, and token allocation before a model turn |
| [Context budget](src/economics/context-budget.ts)                   | Reserved capacity for system and safety context                  |
| [Model router](src/economics/model-router.ts)                       | Model tier selection from task policy and cost                   |
| [Provider adapters](src/models/)                                    | Shared interfaces for hosted and local model providers           |
| [Execution enablement](src/economics/model-execution-enablement.ts) | Durable permission record required before model execution        |
| [Memory backends](src/memory/system/)                               | Flat, typed, temporal, and ledger representations                |
| [Memory experiment](src/memory/experiment/)                         | Eight experiment arms with fixed workload and budget controls    |
| [Agent catalog](src/agents/)                                        | Capability profiles and archetypes                               |
| [Workflow router](skills/jarvis-workflows/)                         | Task-specific reference loading                                  |

## Memory evaluation

The experiment components define eight memory configurations, synthetic workloads, and fixed budget controls.
They include replay contracts, bootstrap intervals, and multiple-comparison controls, with focused component tests.
The end-to-end benchmark runner is incomplete. The source tree contains the tested components and excludes the unused runner draft.
Its [design record](docs/superpowers/specs/2026-07-24-memory-architecture-experiment.md#limitations) links the draft in Git history.

Typed records carry scope, provenance, sensitivity, confidence, and validity windows.
An untyped control retains expired and superseded facts so the experiment can measure those retrieval errors.
The experiment code does not establish that one memory architecture wins on real tasks.

## Run locally

Use Node.js 22 or later and npm. Model execution is off by default.

```bash
npm ci
npm run build
npm test
npm start
```

Open <http://127.0.0.1:3000/dashboard>. Keep `HOST` on a loopback address.

The full repository gate includes formatting, linting, types, tests, builds, and the memory graph check:

```bash
npm run verify:framework
```

The September 8, 2026 repository review ran this gate on Windows with Node 25.5.0.
Formatting, linting, and type checks passed. The test step reported 2,029 passed, 194 failed, and 15 skipped tests, plus two unhandled errors.
Failures included SQLite file access, platform-dependent paths and symlinks, and missing test prerequisites. The full gate remains unresolved in this environment.
The application build, TaskMarket build, and memory graph command passed when run separately.

## Interface

| Dashboard                                             | Agent workbench                                             |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| ![Today view](docs/assets/jarvis-today-desktop.png)   | ![Agent workbench](docs/assets/agent-workbench-desktop.png) |
| ![Memory graph](docs/assets/memory-graph-desktop.png) | ![Mobile view](docs/assets/jarvis-redesign-mobile.png)      |

## Project status

I used Claude Code and Codex during implementation. The repository exposes the architecture, source, and tests for review.
It is not a deployed service and has no reported revenue. Model calls require operator enablement; x402 settlement remains a simulation.
Private runtime configuration, local scripts, and third-party skill bundles are outside this snapshot.

The files under `docs/revenue/` contain hypotheses and draft outreach templates. They do not document customers or approved outreach.
Dated specifications and decision logs preserve earlier design states. Read the source and verification output alongside those records.

## Documentation

- [System specification](SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Decision history](docs/DECISIONS.md)
- [Recorded weaknesses](docs/VULNERABILITIES.md)
- [Subsystem specifications](docs/superpowers/specs/)

## License

MIT. See [LICENSE](LICENSE).
