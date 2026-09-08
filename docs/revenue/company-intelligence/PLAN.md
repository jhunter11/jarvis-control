# Company Intelligence Assistant Plan

This proposal covers a private assistant for questions about company documents. It does not establish buyer demand or a deployed service.
The lead-triage comparison below records an earlier offer decision. The later demand pivot paused that offer pending buyer evidence.

## Pilot scope

Start with one client, one department, one uniform access group, and one approved read-only source bundle.
Return cited answers or an explicit insufficient-evidence response. Perform no workflow actions.
A paid knowledge audit would define sources, permissions, risks, a gold evaluation set, support limits, and pilot economics.

Test three assumptions during discovery:

- Repeated internal questions consume enough time to justify the pilot.
- The buyer can name an accountable owner for each source.
- A narrow corpus can answer useful questions before multiple integrations become necessary.

Retrieval holds changing facts. Consider fine-tuning or LoRA only for a measured behavior gap.
Do not promise a model trained on all company data before resolving deletion, access, and citation requirements.

## Provider and engineering requirements

Cerebras, another managed provider, or a local model could supply inference.
Each option must pass the same privacy, answer-quality, latency, and cost gates.
This plan makes no provider commitment.

Delivery requires discovery, data classification, SOW/DPA scoping, and security review.
Engineering work includes authenticated identity, source ACL propagation, secrets, ingestion, retrieval, and evaluation.
Operations must cover model routing, usage accounting, support, and incident response.

## Alternatives considered

| Alternative                         | Reason to defer                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| Train one model on all company data | Changing facts complicate deletion, citations, and permissions.                   |
| Build multi-tenant SaaS first       | Adds identity, isolation, support, and procurement work before pilot evidence.    |
| Replace lead triage immediately     | Earlier planning favored its existing demo. Later demand review paused the offer. |

## Review areas

- Deliverables: audit, synthetic demo, pilot, and evaluation report.
- Judgment: claims that match evidence and security limits.
- Systems: client identity, deployment, and support.
- Participants: buyer, source owner, security reviewer, and employees.

## Stages

V1 covers the paid audit and a single-source, read-only pilot with citations.
V2 could add connectors, mixed ACLs, SSO, hybrid retrieval, and measured improvements.
Unrestricted data access, autonomous actions, and custom training without evidence remain outside the plan.
