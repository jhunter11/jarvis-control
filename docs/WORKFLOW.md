# Agentic Software Development Life Cycle

This workflow defines the planned process for client tools and automations in Jarvis.

## 1. Intake

Start each feature on `KANBAN.md`. Run the `5-d-build` meta-skill before writing code.
Write a spec covering architecture, tests, edge cases, deployment, and maintenance.

## 2. Feature branch

Create an isolated feature branch:

```bash
git checkout -b feature/<client_id>-<feature_name>
```

Keep client development in `clients/<client_id>/` or its mounted sandbox volume.

## 3. Pre-push validation

1. Run the client test suite (`vitest` or `pytest`) inside the sandbox.

2. Check agency formatting standards.

3. If tests fail, load the Superpowers `investigation-mode` meta-skill and trace the cause.

4. Fix failures before pushing.

## 4. Code review

Push the branch and open a pull request. The planned OpenClaw `autoreview` worker checks the diff against the client spec.
Resolve review comments before merge.

## 5. Deployment

Merge the approved change to `main` through the deployment policy.
In a deployment that mounts client directories into active OpenClaw sandboxes, a checkout update changes the live automation files.
Treat that update as a release and follow its approval and verification gates.

## 6. ToolSmith proposals

The planned `toolsmith_worker` detects repeated manual tasks and starts a `5-d-build` proposal for a reusable skill or tool.
Its pull request follows the same validation and review steps.
