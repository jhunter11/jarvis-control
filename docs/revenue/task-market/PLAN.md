# Self-Funding Task Market Plan

## Problem

This plan predates the separate seller implementation. It addresses how to sell a paid endpoint,
discover real paid work, complete a marketplace task, or reconcile earnings against cost. The owner
wants idle capacity to pursue the first external dollar without allowing untrusted task text, a
wallet, or a public endpoint to control the local agency plane.

## Proposed design

Create a separate Task Market data plane with one deterministic `edge-validation-v1` product,
available through paid HTTP and Streamable HTTP MCP adapters. Promote it through local simulation,
Base Sepolia, public testnet hosting, and a separately approved Base mainnet activation. Add a
read-only Taskmarket scout that admits work only when Jarvis is healthy and idle, creates bounded
candidate records, and prepares allowlisted work. Claiming, spending, submission, and withdrawal
remain exact, audited approvals until repeated evidence supports narrower standing authority.

Deploy the public seller and hostile-work executor as separate VPS security zones. Neither VPS may
start a connection to Jarvis or hold a reusable Jarvis, GitHub, client, or wallet credential.
Jarvis publishes signed, capability-bounded jobs to a broker. An ephemeral executor polls them and
deposits results into quarantine for independent validation. The public seller has no route to the
executor or control plane. “One way” means no return path into Jarvis, not that an internet-facing
seller has no ingress or that unvalidated results can flow directly back.

## Demand assumptions

The plan assumes agents will pay for structured validation and that funded tasks can offset operating costs.
Neither assumption has buyer or payment evidence in this record. Test deterministic work before considering broader task execution.

Self-funding requires verified collected revenue to exceed observed costs for the same period and scope.
A task submission or wallet balance alone cannot establish that result.

## Separate payment and work services

Seller revenue and worker revenue require separate evidence. x402 is
a payment gate, MCP is a tool transport, Bazaar is discovery, and Taskmarket is an external work
market. None alone guarantees demand or profit.

## Skill Dependencies

- Payment, wallet-custody, tax, and marketplace-risk judgment.

- Public service deployment, abuse controls, observability, and incident response.

- Deterministic evaluation, artifact verification, and task-specific quality review.

## Alternatives Considered

| Alternative                        | Why rejected for V1                                          |
| ---------------------------------- | ------------------------------------------------------------ |
| Expose the Jarvis gateway          | It would mix public traffic with the operator control plane. |
| Run arbitrary buyer code           | The security and verification surface is unacceptable.       |
| Give the model an unlimited wallet | Prompts are not spend controls.                              |
| Wait for a perfect marketplace     | Delays testable seller and worker feedback.                  |

## Review areas

| Quadrant         | Plan element                                                |
| ---------------- | ----------------------------------------------------------- |
| Individual Outer | Paid endpoint, scout, candidate, receipt, earnings evidence |
| Individual Inner | Honest profit and authority decisions                       |
| Collective Outer | x402, MCP, Bazaar, Taskmarket, hosting, Base                |
| Collective Inner | Owner approval, buyer trust, requester acceptance           |

## Time Horizons

- **V1:** deterministic product, local paid-flow tests, read-only scouting, dedicated wallet, one
  approved submission, public testnet service, and an isolated VPS deployment profile.

- **V2:** mainnet seller activation, allowlisted task adapters, verified earnings ledger.

- **Not planned:** arbitrary code execution, autonomous withdrawals, unrestricted spend, or exposing
  Jarvis publicly.
