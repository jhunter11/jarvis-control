# AI Agency Framework Architecture and Strategy

This early strategy sketch records proposed infrastructure, memory boundaries, pricing, and agency workflows.
It does not establish deployed capability, customer revenue, uptime, or repair rates.
Use the [launch roadmap](./revenue/agency-launch-roadmap.md) for later decisions and evidence.
The [V1 handoff](./operations/v1-operator-handoff.md) describes local UI, profile runtime, Telegram, and calendar status.

## Open decisions

The original planning questions were the target industry, cloud provider, and balance between local models and managed APIs.
Candidate markets included real estate, e-commerce support, and legal technology.
Candidate hosts included AWS, GCP, Azure, CoreWeave, and Lambda Labs.
Llama 3 and Qwen were local-model examples. These names record the proposal and require fresh evaluation before selection.

## 1. Gateway and execution

The proposed engine uses a multi-agent gateway such as OpenClaw to route tasks, select models, and execute tools.

- Route each customer request to a specific agent through a central API gateway.

- Run agent tools and scripts in Docker containers with explicit sandbox boundaries.

- Define a plugin interface for customer-specific skills and integrations such as Salesforce, Slack, and HubSpot.

## 2. Hosting and compute

The scale-out proposal uses Kubernetes for container scheduling and load-based capacity changes.
For self-hosted models, evaluate vLLM or TensorRT-LLM across GPU nodes, with HAProxy or Nginx for request distribution.
Keep the agent runtime stateless. Persist conversations and tool results so another worker can resume a paused workflow.
These are hosting options, not evidence that the repository runs a cluster.

## 3. Tenant boundaries

- Isolate code and tool execution in Docker sandboxes.

- Evaluate dedicated Kubernetes namespaces or separate AWS VPCs for clients that need stronger isolation.

- Use PostgreSQL row-level security or dedicated customer databases.

- Evaluate encryption at rest with customer-managed keys through AWS KMS or HashiCorp Vault.

- Give each customer an API identity and tenant ID. The gateway must bind downstream calls to that authenticated tenant.

## 4. Customer memory

The original RAG proposal considered Pinecone, Qdrant, or Milvus with strict namespaces such as `namespace: "tenant_id_123"`.
Store each customer's brand voice, SOPs, and rules in a structured profile.
Compile prompts from the authorized customer's profile only.
Keep conversation history in isolated SQLite or PostgreSQL tables and summarize older history to limit context size.

## 5. Pricing hypotheses

The proposed target was businesses with $1M to $50M in annual revenue and limited internal AI engineering capacity.
The prices below were planning hypotheses. They are not customer contracts, validated willingness to pay, or current offers.

| Tier               | Proposed customer and work                                                                                       | Proposed price                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Small business     | Local services or e-commerce, $500k to $2M revenue. One or two support-triage or lead-qualification automations. | $1,500 to $3,000 setup plus $500/month, including hosting and 10,000 API transactions.       |
| Mid-market         | B2B services, agencies, or e-commerce, $2M to $50M revenue. Sales workflows, data entry, and spreadsheets.       | $5,000 to $15,000 setup plus $2,000/month, with proposed SLA, priority support, and scaling. |
| Performance/hybrid | A lower setup fee with payment tied to an agreed outcome.                                                        | Example: $1,000 setup, then revenue share or $10 per booked sales call.                      |

Planned fixed costs included the Kubernetes cluster, vector database, and any GPU lease.
Variable costs included input/output tokens and additional compute such as Fargate or EC2 spot instances.

## 6. Model and prompt review

1. Review new models and API prices against measured client-task quality.

2. Propose a migration when a cheaper or faster model matches the required accuracy.

3. Remove unnecessary prompt tokens without dropping client constraints.

4. Record measured automation outcomes for possible case studies. Do not invent hours or dollars saved.

5. Prepare new client workspaces, sandbox configuration, and scoped credential setup through the onboarding workflow.

## 7. Outreach proposals

Choose a specific workflow and measurable customer problem before drafting an offer.
The original example was overnight customer-support triage. Its illustrative 80% automation target was not a measured result.

- Draft personalized email or LinkedIn outreach to operations managers and founders.

- Use a Loom demonstration of the proposed workflow, with mock data labeled as such.

- Build two or three internal automations or a pro-bono pilot before writing outcome-based case studies.

- Publish only measured hours and dollars saved, subject to customer consent and the external-action policy.

- Evaluate partnerships with marketing agencies or B2B consultants that need technical implementation help.

## 8. Local workspace proposal

Before a VPS deployment, the plan was to test tenancy in a local OpenClaw workspace.
Define customer agents such as `client_a_agent` in `agents.list`.
Map each isolated workspace, such as `~/.openclaw/workspaces/client_a`, into its own Docker sandbox.
Use `sandbox.scope: "agent"` and test cross-client denial.

Each profile would receive explicit integration permissions through `tools.allow` and `tools.deny`.
Examples included `himalaya` or Gmail for email drafts, Python/Node.js for spreadsheets, and scoped Slack or Trello access.
A client profile must never select another client's integration credentials.

## 9. Repository and delegation

The repository proposal grouped OpenClaw configuration, scaffolding scripts, client integrations, and plans under `ai-agency-jarvis`.
It drew on agent ergonomics ideas associated with Kun Chen (`kunchenguid`).
Scripts would return compact structured output, and `firstmate` would delegate specific tasks from the `main` Jarvis agent.

| Directory   | Planned responsibility                             |
| ----------- | -------------------------------------------------- |
| `/config/`  | OpenClaw client sandbox blueprints                 |
| `/scripts/` | Customer scaffolding and token-use helpers         |
| `/clients/` | Customer-specific scripts and integrations         |
| `/docs/`    | Architecture, task tracking, and pricing proposals |

The proposed `no-mistakes` pipeline would test changes in isolation before a push.
Tests can find defects. The pipeline does not guarantee defect-free deployment.

## 10. Model fallback proposal

The early plan named OpenAI as primary, Gemini as a cloud fallback, and Ollama as a local fallback.
Its example identifiers were `openai/gpt-5.4`, `gpt-4o`, `google/gemini-3.5-flash`, and `ollama/qwen2.5-coder:7b`.
The intended configuration point was `agents.defaults.model`.

The proposal also assumed access through a $20/month ChatGPT subscription.
That assumption does not verify model availability, permitted subscription use, current pricing, or unlimited capacity.
Check the current provider contracts and [model runtime runbook](./operations/model-runtime.md) before activation.
Rate limits, provider failures, and local hardware failures can still stop execution.

## 11. Hierarchical memory proposal

The `main` agent would keep agency SOPs, pricing logic, and a registry of active clients.
Each client would keep isolated memory, for example `~/.openclaw/agents/client_a/agent/openclaw-agent.sqlite`.
Client agents would read only their own SOPs, history, and CRM data.

The original oversight proposal gave Jarvis read access through `tools.allow: ["read"]` across client directories.
Any such access requires explicit grants under the current policy.
Containment alone does not authorize reading, editing, or summarizing client memory.

## 12. Development skills and context

The proposed [Superpowers](https://github.com/obra/superpowers) integration adds planning, diagnosis, and verification workflows.
Relevant skill names in the plan included `5-d-build`, `investigation-mode`, `root-cause-tracing`, and `verification-before-completion`.

Before code changes, write a spec covering architecture, tests, edge cases, deployment, and maintenance.
The planned `skills/` directory would mount read-only into client sandboxes through `scaffold-client.sh`.
A repository map from tools such as `repomap` or `tree` would supply bounded structural context before a task.
That context helps locate code but does not prevent model mistakes by itself.

## 13. Development cycle

1. Record the client request as a GitHub issue and prepare its spec.

2. Develop on an isolated branch, such as `feature/client-b-email-bot`, within the client workspace.

3. Run unit tests and formatters before a push. Trace and fix failures before retrying.

4. Use the proposed OpenClaw `autoreview` worker to compare the diff with the spec and client SOPs.

5. Merge only after review and the deployment gate.

If production mounts the checkout into a client runtime, updating that checkout changes live automation files.
Treat the update as a release with explicit approval and recovery steps.

## 14. Scheduled audit proposal

The original schedule example was nightly at 2:00 AM.
Jarvis would dispatch security checks for plaintext secrets and unauthenticated routes, plus quality checks for tests and spec coverage.
Findings would become tasks in `docs/KANBAN.md`.

For routine fixes, workers would diagnose the cause, prepare a patch, run checks, and open a pull request.
The original 95% autonomous-repair target had no supporting measurement and must not appear as an achieved rate.
Critical changes still require owner review.

## 15. ToolSmith proposal

Record repeated task signatures and frequency in `task_frequency_log`.
When a task exceeds a frequency threshold, `toolsmith_worker` would search local OpenClaw code and public GitHub for reusable tools.
The original tool examples were `search_web` and `grep_search`.
If no suitable tool exists, it would prepare a tested OpenClaw skill or TypeScript automation through the same review process.

## 16. Telegram status recorded in this plan

The opt-in adapter has private-chat allowlisting, principal binding, update deduplication, a durable polling cursor, and redacted inbox evidence.
The repository configures no bot credential or private chat and leaves the adapter disabled by default.
Live activation requires one exact positive user/private-chat pair and a bot token in macOS Keychain.

Initial commands permit bounded reads and an exact pause proposal.
Telegram cannot approve or execute that proposal. Free text cannot select a tenant, scope, or capability.
Client-facing channels need separate identities and authorization.

## Verification sequence

1. Verify local web chat and the release checks.

2. Review the repository structure, memory boundaries, skill provisioning, and development workflow against current code.

3. Activate schedules only through an explicit operator decision.

4. For Telegram, install the Keychain credential and exact allowlist through the documented activation process.

5. Verify replay, restart, allowlist, and redacted-audit behavior with the actual private connection.

6. Record the resulting authority and evidence without credentials or personal identifiers in Git.
