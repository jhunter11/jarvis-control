# Jarvis Interface Language

## Direction

Design Jarvis for long sessions at a desk. Use a dark, legible surface with dense information and clear authority boundaries.

## Signature

Keep the scope rail and authority map visible. Each screen must identify the current location, data owner, active authority, and items needing attention.

## Tokens

- Canvas `#090d12`, rail `#0c1117`, surface `#111820`, raised surface `#151e27`.

- Ink `#edf2f5`, muted `#c0cbd3`, quiet `#a4b1bb`.

- Primary signal `#7dd8c7`, approval amber `#e8ba70`, danger `#ef8e8e`, evidence blue `#91bde8`.

- Use a 3px radius. Reserve pills for small state labels.

- Use Avenir Next with a Segoe UI fallback for body text. Use platform monospace for utility labels.

## Structure

- Desktop: scope/navigation rail, work surface, and contextual inspector where needed.

- Mobile web: compact identity and horizontally scrollable deep links. Keep critical cards and metrics within bounded scroll regions.

- Plan Telegram as the mobile steering channel.

- Prefer bordered rows, timelines, stage rails, tables, and split workbenches over repeated cards.

- Use Answer / Evidence / Trace / Artifacts / Approval tabs in chat when those contracts exist.

- Show agent purpose, scope, sleeve, lifecycle, current work, elapsed time, tokens, cost coverage, and reliability.

## Interaction

- Make controls at least 44px where practical. Show keyboard focus and keep actions available without hover.

- Use one 200ms view transition and state feedback. Remove transforms for reduced motion.

- Distinguish loading, empty, stale-last-good, unavailable, blocked, and error states.

- Name the object and action in control labels. Disable and label planned controls.

Avoid decorative charts, emoji icons, gradient text, glass effects, nested cards, and oversized metrics.
Never display simulated data as live evidence, hidden reasoning, or invented cost and time values.
