# Automation Proposals for Phase 8

These are proposals for work after the core MVP stabilizes. They do not describe deployed capabilities.
Activation, external actions, and policy changes remain subject to the operator gates.

## 1. Budget routing

A weekly accountant worker (`src/agents/accountant.ts`) would compare client usage in `task_history` with `memory/core/pricing_logic.json`.
If spend exceeds 80% of the budget with more than five days left, it would propose cheaper routing for non-critical tasks.
The proposal targets `clients/client_x/agent-config-stub.json` and includes a Telegram alert.
The original model examples were `claude-3-haiku` and `claude-3-5-sonnet`. Recheck availability and quality before any routing change.

## 2. Intake and scaffolding

A Typeform webhook or Telegram interaction would collect the prospect's niche, pain points, and requested integrations.
The worker would draft a `5-d-build` specification and prepare `scaffold-client.sh <client_id>`.
It would also draft `memory/clients/<id>/client_sops.md` and the initial SQLite schema.

## 3. Case-study drafts

A milestone in `task_history`, such as 1,000 successful runs, would trigger a review of usage and audit evidence.
The worker would compare measured run time with an observed manual baseline where one exists.
It would draft a LinkedIn post and Markdown case study, then open a PR or request owner review through Telegram.

## 4. Runtime recovery

A failure in `heartbeat.ts` would trigger a review of recent configuration changes and logs.
The original proposal used `git revert HEAD` and Docker restarts if the latest change caused the failure.
Any recovery implementation needs bounded rollback authority, preserved evidence, and tests before unattended use.
It would send a Telegram alert with the outage and recovery action.

## 5. Model evaluation

An RSS feed from sources such as Hacker News or Hugging Face would identify candidate open-source models.
The worker would download an approved candidate into Ollama and run the agency evaluation suite.
It would propose an `openclaw.json` change only if measured speed, cost, and quality beat the current fallback.

## 6. Client capacity review

A monthly review before billing would identify low retainer use.
The worker would read the client's niche from `client_sops.md`, draft three relevant automation ideas, and prepare an email for review.
Low usage alone would not authorize contact or a scope change.

## 7. Log redaction

A filter would inspect data before writes to `task_history` or `audit_logs`.
The proposed regex/NLP pass would replace detected Social Security numbers, credit card numbers, and unauthorized PII with `[REDACTED_PII]`.
Detection can miss sensitive data. This proposal does not establish privacy guarantees, SOC 2 assurance, or GDPR compliance.
