# Agency Master SOPs

## General principles

1. Automation scripts should conserve tokens and return structured JSON.

2. Test client configurations in an isolated Docker sandbox before deployment. Record the checks and their results.

3. Jarvis delegates discrete tasks, such as scaffolding and report generation, to specialist agents through `firstmate`.

## Client interaction

- Use the API Gateway for client sandbox access. Route cross-tenant actions through the orchestrated API.

- Enforce the SQLite memory boundaries. Jarvis has read-only oversight where authorized.

- A client agent cannot access Jarvis memory or another client's memory.

## Development standards

- Use TypeScript and Node.js for backend automation.

- Use SQLite through Kysely for persistence and episodic memory.

- Follow TDD with the `superpowers` meta-skills.
