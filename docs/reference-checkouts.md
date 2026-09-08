# Reference checkouts

The `.reference/` directory holds upstream repositories for design study. Build,
lint, typecheck, graph, and deployment tasks exclude it. Git also ignores it.
Clone references separately on each machine.

Study their patterns and implement changes in the Jarvis stack. Do not copy whole
files or add dependencies just because a reference uses them.

## Dashboard reference

| Path                                        | Upstream                                          | License | Uses                                                                       |
| ------------------------------------------- | ------------------------------------------------- | ------- | -------------------------------------------------------------------------- |
| `.reference/next-shadcn-dashboard-starter/` | [Kiranism/next-shadcn-dashboard-starter][starter] | MIT     | Component structure, navigation, tables, forms, spacing, and OKLCH themes. |

[starter]: https://github.com/Kiranism/next-shadcn-dashboard-starter

The reviewed starter uses Next.js 16, React 19, Tailwind v4, Clerk, and Sentry.
Jarvis uses Express 5, CommonJS, and a `tsc` build. Its dashboard uses vanilla
JavaScript and CSS with a widget registry. `src/dashboard/routes.ts` serves it with
`express.static`.

Adopting the starter would require a frontend rewrite and decisions about hosted
authentication and monitoring. The current use is limited to design reference.

Useful paths:

- `src/components/ui/`: shadcn component composition.

- `src/features/`: `api/types.ts`, `api/service.ts`, and `api/queries.ts` layers.

- `docs/themes.md`: color and font configuration.

- `docs/forms.md`: field and multi-step form patterns.

- `REFERENCE-AGENTS.md`: upstream stack and conventions.

## Instruction files

The upstream `CLAUDE.md` and `AGENTS.md` apply to a different project. Rename them
to `REFERENCE-CLAUDE.md` and `REFERENCE-AGENTS.md` so agents do not load them as
Jarvis instructions. This repository uses its own `.prettierrc` and agent guidance.
Repeat the renaming after each update because Git can restore the original names.

## Clone and refresh

```bash
git clone --depth 1 <url> .reference/<name>
```

To update the existing dashboard reference:

```bash
git -C .reference/next-shadcn-dashboard-starter pull --depth 1
```

Then rename any restored instruction files. The existing exclusions cover
`.gitignore`, `.prettierignore`, `.graphifyignore`, and `ignoreFiles` in
`.impeccable/config.json`. ESLint and `tsc` target `src`, `tests`, and `clients`.
