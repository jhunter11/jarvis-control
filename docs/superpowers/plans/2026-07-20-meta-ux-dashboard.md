# PLAN: Meta-UX Operator Dashboard

Date: 2026-07-20

## Problem Statement

Jarvis exposes safe operational data, but the operator must still reconstruct the system's posture,
next decision, freshness, and safety boundary from several panels. On small screens, long identifiers
can break reflow, repeated titles consume space, and Growth places the next action below its evidence.
A narrow-format navigation scroller can also hide most destinations while stacked context cards push
the actual work below the first viewport. A failed read source can replace unrelated last-good
panels. The operator needs to regain context in seconds and trust what the dashboard says while
Jarvis cycles unattended.

## Proposed Solution

Show posture and freshness in a persistent header. Put the next action before its evidence, and show run and health status.
Track freshness per source and auto-refresh only while the page is visible. Support layouts down to 320px. Extract deterministic view,
posture, source-state, and presentation rules into a dependency-free browser core. Test it without a DOM. Bound every local request to ten seconds and render each source as soon as it settles
so one stalled read cannot freeze the operator surface.

Keep the existing dark visual language,
server read models, and explicit no-send, no-payment, loopback-only boundaries. At compact widths,
keep every navigation destination visible, present the decision first, and collapse context and
metrics into horizontal evidence strips so Queue work reaches the initial phone viewport.
Name and focus metric strips explicitly so keyboard users can scroll offscreen evidence.

## Assumptions and Bets

We assume one operator is the primary user, fast triage matters more than dashboard customization,
and the current bounded DTOs contain enough safe evidence. The working hypothesis is that visible posture, freshness, and next actions will improve triage. Test this with the operator.
Visual effects must not obscure status or delay decisions.

## Thinking Level and Alternatives

Preserve the dependency-free implementation and separate testable state from DOM code.
A framework rewrite adds migration risk without solving the information architecture.
A visual reskin leaves misleading state and coupled refreshes.
Local, low-frequency data does not justify a new EventSource/WebSocket channel.

## Quadrants and Dependencies

- **Individual outer:** core module, semantic shell, responsive tokens, tests, and browser evidence.

- **Individual inner:** operator cognition, WCAG 2.2 AA, and incident-state interpretation.

- **Collective outer:** existing Express routes, safe DTOs, launchd runtime, CSP, and Page Studio.

- **Collective inner:** one shared meaning for ready, degraded, stale, review-only, and blocked.

This plan adds no external runtime dependency or API.

## Time Horizons

- **V1:** explicit posture, partial-refresh resilience, visible auto/paused/stale state,
  action-first Growth, document-title/focus fixes, contrast/live-region cleanup, complete reflow, and
  adaptive phone/tablet/landscape/ultrawide formats.

- **V2:** bounded run/client drill-downs and an automated cross-browser accessibility suite.

- **Not planned:** autonomous actions, public access, arbitrary widgets, charts without measured need,
  or a frontend framework migration.
