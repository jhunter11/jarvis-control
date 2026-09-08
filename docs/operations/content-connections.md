# Content Connections: Operator Runbook

The faceless-content pipeline uses provider adapters for narration and visuals. Local adapters depend on the required runtime.
Credential probes show availability, not permission to spend or proof that a remote service accepts the key.
The operator must approve a paid call. Higgsfield currently produces a manual shot manifest.

## Inspect connections

```bash
npm run content:connections
```

This read-only command probes provider availability and prints the selected defaults without secrets. Example output:

```
Narration (voice)
  [up  ] local_say          free     macOS say runtime available (local, no credential)
  [down] elevenlabs         premium  no credential connected (set ELEVENLABS_API_KEY or keychain ...)
  starter -> local_say
  premium ready -> none connected

Visuals
  [down] pexels             free     no credential connected (set PEXELS_API_KEY or keychain ...)
  [up  ] local_title_card   free     local renderer available (no credential)
  [down] higgsfield         premium  no credential connected (set HIGGSFIELD_API_KEY or keychain ...)
  starter -> local_title_card
  premium ready -> none connected
```

`starter` is the free-first default the pipeline uses automatically. `premium ready` lists connected
premium tools available on explicit request: premium is never auto-selected.

## The connections

| Lane      | Provider           | Cost basis   | Needs                | Notes                                                                          |
| --------- | ------------------ | ------------ | -------------------- | ------------------------------------------------------------------------------ |
| Narration | `local_say`        | local (0)    | macOS `say`          | Local starter voice                                                            |
| Narration | `elevenlabs`       | metered      | `ELEVENLABS_API_KEY` | Premium narration. Records character count                                     |
| Visuals   | `local_title_card` | local (0)    | nothing              | Generated title cards                                                          |
| Visuals   | `pexels`           | free API     | `PEXELS_API_KEY`     | free stock B-roll. Auto-becomes the visual starter once connected              |
| Visuals   | `higgsfield`       | subscription | `HIGGSFIELD_API_KEY` | premium. V1 emits a **manual production manifest** (no reverse-engineered API) |

Local cost `0` means no metered API charge. It excludes hardware and power.

## Connecting a tool

Set an environment variable or add a macOS Keychain entry. The next probe can then report credential presence.
The adapter reads the secret at call time and must not print or log it.

Environment variable (simplest):

```bash
export PEXELS_API_KEY="<your key>"
export ELEVENLABS_API_KEY="<your key>"
export HIGGSFIELD_API_KEY="<your key>"
```

Keychain (survives shell restarts. Add it yourself so the secret never passes through Jarvis):

```bash
security add-generic-password -s ai-agency-jarvis.pexels -a api-key -w
```

(`-w` prompts for the value interactively. The same pattern applies to
`ai-agency-jarvis.elevenlabs` and `ai-agency-jarvis.higgsfield`.)

## What each connection does when live

- **Pexels**: searches `/videos/search` and returns clip links with provenance and the Pexels
  license preserved per asset.

- **ElevenLabs**: synthesizes narration via `/v1/text-to-speech/{voice}` to an audio file. Reports
  the character count that is its cost basis.

- **Higgsfield**: with a credential connected, `query()` returns reviewable manual-production shot
  specs (`requiresManualProduction: true`). An API integration would require verified documentation, implementation, and tests. A credential does not provide that integration.

Adapters report missing credentials, rejected keys, timeouts, and rate limits as typed errors. The pipeline can fall back to its local starter.
Failed requests must not produce fabricated media.
