# Architecture Decision Records: Jarvis Model Execution

This log records decisions about model execution, credentials, and usage accounting.
Entries record their implementation checkpoint. Read the current README for the latest verification status.
Keep the decisions as an append-only record. Add a superseding decision when behavior changes.

## ADR-001: Durable operator enablement defaults to OFF

**Context.** `routeModelWork()` originally hardcoded `modelExecutionAllowed:false` for the deterministic MVP (SPEC §15).
Real model calls require an explicit, auditable enablement gate.

**Decision.** Migration `020` adds the singleton `model_execution_enablement` record, following the `agency_execution_posture` pattern.
It uses version-checked optimistic CAS and the append-only `model_execution_enablement_events` audit table.
An `INSERT OR IGNORE` bootstrap defaults to disabled with empty allow-lists.
The record stores `enabled`, `version`, `approver`, `approved_at`, and allowed logical `tiers`, `surfaces`, and `providers`.
Enablement is necessary for a real call. Network, provider, and surface rules still apply.

**Router.** `routeModelWork(rawInput, enablement?)` accepts an optional snapshot: `{ enabled, allowedTiers, version }`.
Missing, disabled, malformed, or uncovered-tier snapshots retain the historical deterministic/simulation decision.
A parity test covers that behavior across an input matrix. Network denial overrides an enabled tier.
The router has no provider-specific policy. The separate binding layer handles provider and surface gates from Phase B onward.

**Read failure.** Router `safeParse` treats malformed input as disabled.
Repository `parse` rejects corrupt rows. `resolveSnapshot()` returns the disabled snapshot if a read fails.
Corrupt or unreadable state must not authorize execution.

## ADR-002: Inspect OAuth stores without exposing token bytes

**Context.** Existing logins use `~/.codex/auth.json`, `~/.gemini/oauth_creds.json`, and macOS Keychain service `Claude Code-credentials`.
The original host had no default `~/.claude/.credentials.json` or headless `CLAUDE_CODE_OAUTH_TOKEN`.
The OpenClaw Telegram allowlist lives under `~/.openclaw/credentials/`.

**Decision.** `src/secrets/provider-credentials.ts` returns a bounded, non-secret `{ provider, state, source, detail }` for each provider.
It must never return, log, or embed token bytes in `detail`. Sanitized read/parse errors report `missing` or `malformed`.

The Keychain probe uses `security find-generic-password` without `-w` or `-g`, observing only the exit code.
The Gemini reader reports a refresh-token-present credential as `valid`, even after access-token expiry.
That label describes local credential structure, not verified server-side acceptance.
`jarvis auth status` (`npm run auth:status`) prints one line per provider and a summary.

## ADR-003: Subscription cost stays NULL; local API cost is zero

**Context.** SPEC §15 requires SQL `NULL` for unknown cost.
The original `model_usage_events.cost_basis` allowed only `unknown|observed|estimated`.
The Phase B requirement added separate bases for subscription and Ollama calls.

**Decision.** Add two bases:

- `subscription`: `cost_microusd IS NULL`. Count this toward unknown-cost coverage because the per-call subscription cost is unknown.
- `local`: `cost_microusd = 0`. Count this toward known API-cost coverage. Local hardware and electricity are outside this measure.

**Implementation.** Migration `003` permits both bases in fresh databases.
The idempotent `applyProgrammaticMigrations` runs on every `openDatabase` and rebuilds legacy tables to widen the CHECK constraint.
It follows the SQLite table-rebuild procedure, temporarily disabling foreign-key enforcement around DROP/RENAME and restoring it afterward.
The usage table is a leaf. The migration copies its rows verbatim.

`ModelUsageRepository` accepts both bases and persists NULL or zero, respectively.
Dashboard summaries report `subscriptionCostEvents` and `localCostEvents` without treating subscription calls as free.

## ADR-004: Reuse OpenClaw formats with MIT attribution

**Context.** The reference checkout `~/openclaw` used MIT-licensed version v2026.6.2.
It provided Codex OAuth read/refresh behavior and Telegram configuration formats.

**Decision.** Adapt those formats so existing logins and Telegram pairing can carry over.
Record reused patterns in [THIRD_PARTY.md](../THIRD_PARTY.md), with MIT attribution.

**Phase B implementation.** The Codex adapter uses the `auth.openai.com/oauth/token` refresh grant and client ID `app_EMoamEEZ73f0CkXaXp7hrann`.
It also extracts the `chatgpt_account_id` JWT claim. The implementation uses local interfaces and copies no OpenClaw files.

The original host could not live-verify the ChatGPT backend `responses` request/parse path.
Non-2xx responses and malformed bodies throw errors so the executor can try an authorized fallback.
Telegram configuration reuse remained Phase E work at this checkpoint.

## ADR-005: Separate provider execution from routing policy

**Context.** `routeModelWork()` maps risk to a logical tier and decides whether model work is permitted.
It must not contain provider names. A separate executor binds logical tiers to subscription or local runtimes.

**Decision.** `src/models/*` defines a `ModelProvider` interface and dependency-injected adapters:

- Claude: `claude -p` with JSON output, no MCP, and all built-in tools denied.
- Codex/ChatGPT: OAuth from `~/.codex/auth.json`.
- Gemini: `gemini -p`. ADR-007 later restricts production execution.
- Ollama: HTTP on `localhost:11434`.

`ProviderCatalog` probes availability. It prefers Claude, Codex, then Gemini for economy/frontier routes.
Ollama handles local work and serves as the final fallback, subject to authorization.
`ModelExecutor` enforces the operator provider allow-list before attempting candidates in order.

Each attempt creates one `model_usage_events` row with provider and cost basis: subscription NULL, local API cost zero.
No authorized provider yields `no_runtime`, without a fabricated reply.

**Availability limits.** Credential presence and Ollama `GET /api/tags` describe local availability. They do not establish subscription validity.
The original host observed a revoked Claude token and an ineligible Gemini free-tier credential.
These were checkpoint observations, not claims about current credentials.
Call-time failures produce typed `ProviderError` results and permit an authorized fallback.
`npm run models:status` checks availability without executing a model.

**Tests.** `FakeModelProvider` drives catalog/executor unit tests. Real adapters use injected CLI or `fetch` runners.
The live Ollama integration test runs a completion when the runtime is serving and skips otherwise.

## ADR-006: Persist rate-limit circuits and allow one recovery call

**Context.** Immediate fallback alone retries a throttled subscription on each new request.
Credential probes cannot show quota recovery, and restart must preserve cooldown state.

**Decision.** Claude, Codex, and Gemini normalize structured quota failures to `ProviderError.kind = rate_limited`.
Before trying the next provider, `ModelExecutor` opens a global SQLite circuit for the throttled provider.
A trustworthy future reset sets `notBefore = resetAt + 5 minutes`.
Missing, stale, or malformed reset metadata selects a one-hour cooldown.

Requests before `notBefore` skip that subscription and create no usage event for it because no call occurs.
At the boundary, an atomic update permits one half-open real request. Concurrent work uses the authorized fallback.
Success deletes the circuit. Another quota failure reschedules it.

The gateway schedules the earliest boundary and an hourly reconciliation, logging only provider and timestamp metadata.
It never clears circuits from credential probes or persists provider response bodies.
Lazy claim checks remain authoritative after delayed timers or process restarts.

## ADR-007: Require a text-only coordinator before provider traffic

**Context.** Provider adapters, routing, enablement, usage accounting, deterministic chat, and exact-agent conversations existed as separate tested pieces.
A caller could still bypass composition rules by invoking `ModelExecutor` directly.
Reliability and governed-self-editing work also remained unfinished.

**Decision.** Use the contract in `docs/superpowers/specs/2026-07-23-pre-llm-framework-readiness.md` for this milestone.
Production construction exposes a `ModelTurnCoordinator` instead of a bare executor.
Composition binds its surface and client scope. The coordinator accepts text only and caps aggregate context, output, and time.
It derives providers from the durable operator allow-list and repeats the enablement/version check immediately before execution.

**Integration.** The gateway constructs this coordinator and connects `src/chat/jarvis-model-chat.ts`, making a real model turn reachable.
The deterministic keyword router remains the disabled-state fallback. Durable model enablement stays OFF until the operator enables it.
Credential presence grants no execution authority.

Claude receives trusted policy through its system channel using a single-use `0600` prompt file in a `0700` directory.
A JSON envelope travels through stdin. Execution disables built-in tools, customizations, MCP, and session persistence.
The subprocess uses an allowlisted environment. Cleanup failure fails closed.

The documented Gemini CLI lacks an equivalent complete tool-denial and no-persistence boundary.
Gemini therefore has no production execution opt-in, even with an OAuth credential.

Model tools, memory retrieval, worker dispatch, and side effects remain outside this milestone.
They require effective access-lifecycle composition before enablement.
Model-caused worker execution also requires proof-gated pending, verification, and settlement semantics.
