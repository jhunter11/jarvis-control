# Dashboard access from another machine

The dashboard has no login. It binds to loopback and rejects non-loopback requests at two layers:

| Layer                                                       | Behavior                                                                   |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| `isLoopbackHost` in `src/gateway/server.ts`                 | The gateway throws if asked to bind a non-loopback host.                   |
| `requireLoopbackDashboardHost` in `src/dashboard/routes.ts` | Rejects a request unless its `Host` header matches an exact loopback host. |

Do not bind the dashboard to `0.0.0.0`. That would expose action approvals, model execution, and tenant summaries without authentication.

## Remote-access gate

Remote access remains blocked until the audit and owner-approval requirements in
[Unattended Runtime](unattended-runtime.md) pass. Follow the same gate in the
[operator handoff](v1-operator-handoff.md). Do not enable Remote Login, add a tunnel,
or configure a VPN as a workaround.

After that gate passes, an approved SSH tunnel can forward the loopback port without
changing either dashboard guard. A VPN alone does not forward a loopback listener.
Any approved setup still needs a controlled forwarding path and access restrictions.

The earlier proposal used this command on the browsing machine:

```bash
ssh -N -L 3000:localhost:3000 <user>@<this-mac>.local
```

This is a design example, not authorization to activate remote access. The approved
configuration must restrict SSH access and use the actual gateway port. The browser
would then use `http://localhost:3000/dashboard`. Keep the forwarded port consistent
with the loopback `Host` check.

## Rejected LAN bind

On 2026-07-24, the design rejected an environment-gated LAN bind with a shared token.
That option would add an authentication path to an otherwise unauthenticated control plane.
Reconsider a direct LAN bind only after an authentication design and security review.

## Demo data for local development

The run-supervision and P&L views stay empty until automations execute. For a local visual check, run:

```bash
npm run dev:seed-dashboard
```

The seeder writes `demo_` rows only to `.audit-tmp/jarvis-audit.sqlite`. It covers all three
supervisor derivations and every cost basis. The subscription-only example must show
_uncovered_, because its per-call dollar cost is unknown. Never use a real operator database.
