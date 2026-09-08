# Agency Vulnerability and Improvement Analysis

This early risk assessment records proposed upgrades. It does not establish current implementation or readiness.
See [the launch roadmap](./revenue/agency-launch-roadmap.md) for later decisions and evidence.

## Secrets management

Client sandboxes need scoped access to sensitive Salesforce, Gmail, and OpenAI credentials.
Plaintext credentials in configuration files expose secrets if a sandbox or its files leak.
The proposal was to use HashiCorp Vault or AWS Secrets Manager for temporary runtime credentials.
Credentials would enter only the authorized client context and leave memory after execution.

## Billing and cost attribution

Per-tenant usage records are necessary to calculate client margins.
The proposal was to evaluate LangSmith or Helicone and attach `client_id` to outbound usage records.
Measured token usage and available pricing would determine cost. Missing pricing must remain unknown.

## Failure alerts

An unattended email worker can fail before its owner notices.
The proposal was to connect Sentry or a logging pipeline to the development workflow.
Jarvis would monitor authorized client logs, page the owner by SMS or Slack, and collect a stack trace through `root-cause-tracing`.

## Recovery

A long workflow needs checkpoints to avoid repeating completed work after a limit or restart.
The proposed options were LangGraph state management or SQLite checkpoints after each step.
Recovery must resume from a valid checkpoint and account for side effects already completed.

## Client interface

Clients must not receive access to the agency-wide control UI.
The proposed Slack or Discord bridge would bind each client identity to its isolated OpenClaw sandbox.
Each channel needs its own tenant-scoped authentication and authorization before activation.

The original review prioritized secrets management and the client interface because both affect onboarding and access boundaries.
These priorities remain proposals in this historical record.
