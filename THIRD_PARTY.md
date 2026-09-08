# Third-party attribution

## OpenClaw (MIT, v2026.6.2): ChatGPT/Codex OAuth adaptation

The [Codex provider adapter](src/models/codex-provider.ts) adapts OAuth token handling from OpenClaw v2026.6.2, an MIT-licensed project.
The reference checkout is `~/openclaw`. These files supplied the following contracts:

- `extensions/openai/openai-chatgpt-oauth-flow.runtime.ts`, function `refreshAccessToken`: refresh tokens through `POST https://auth.openai.com/oauth/token`. The request uses `grant_type=refresh_token` and public installed-app client ID `app_EMoamEEZ73f0CkXaXp7hrann`.

- `extensions/openai/openai-chatgpt-auth-identity.ts`, function `resolveCodexAuthIdentity`: extract `chatgpt_account_id` from the access-token JWT claim `https://api.openai.com/auth`.

- `extensions/openai` and `extensions/codex`: send requests to `https://chatgpt.com/backend-api/codex/responses`. Headers include `chatgpt-account-id`, `OpenAI-Beta: responses=experimental`, and `originator`.

This repository contains its own implementation of those contracts and control flow, with its own interfaces and safety boundaries.
It contains no copied OpenClaw source files. The reference license is `~/openclaw/LICENSE`.

The [secrets plane](src/secrets/provider-credentials.ts) reads Telegram pairing and allowlist formats under `~/.openclaw/credentials/`.
Record further Telegram configuration reuse here when Phase E adds it.
