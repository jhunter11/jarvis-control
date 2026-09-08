# Hierarchical Agent Orchestration

This design uses a tiered agent tree, drawing on LangGraph supervisor and CrewAI hierarchical delegation patterns.
The hierarchy describes roles. A declared role still needs an authorized executor before it can run work.

## Agent tree

| Level | Role              | Responsibility                                                                            |
| ----- | ----------------- | ----------------------------------------------------------------------------------------- |
| 1     | Gateway           | Receive external webhooks and UI triggers, resolve the tenant, and route the payload.     |
| 2     | Jarvis Supervisor | Interpret top-level directives, delegate work, evaluate results, and report to the owner. |
| 3     | Agency workers    | Run specific internal tasks within their granted scope.                                   |
| 4     | Client supervisor | Use one client's context and SOPs to delegate client work.                                |
| 5     | Client workers    | Execute individual tasks within that client's sandbox and return results.                 |

The gateway uses Express.js. The proposed supervisor is the `main` OpenClaw orchestrator.
For example, an onboarding request routes from Jarvis to workers instead of granting the requester direct sandbox access.

## Worker examples

- `scaffold_worker`: run `scaffold-client.sh` and configure sandbox boundaries.

- `audit_worker`: scan for security vulnerabilities and broken tests.

- `pr_reviewer`: check feature diffs against agency SOPs.

- `toolsmith_worker`: examine `task_frequency_log`, find reusable tools, or propose new OpenClaw skills for repeated work.

- `client_a_scraper`: use web tools without email access.

- `client_a_emailer`: use `himalaya` without web access.

A client supervisor such as `client_a_supervisor` combines worker results within its client scope.
The router in `src/agents/supervisor.ts` parses the objective, selects a worker, passes the required context, and collects results.
