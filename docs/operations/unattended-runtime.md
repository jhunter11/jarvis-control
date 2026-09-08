# Unattended loopback runtime

This package runs Jarvis as two user LaunchAgents on macOS:

- `com.aiagency.jarvis.gateway` supervises the gateway through `/usr/bin/caffeinate -s`.

- `com.aiagency.jarvis.watchdog` checks `/livez`, `/readyz`, disk capacity, and bounded log rotation every 60 seconds.

The gateway is fixed to `127.0.0.1`. The installer cannot publish it to a LAN, create a tunnel, enable Screen Sharing, or change firewall and file-sharing settings.

## Safety model

- The installer copies releases outside the repository to `~/Library/Application Support/Jarvis/releases/<release-id>` with read-only permissions. Directories use `0555`, files use `0444`, and executable runtime scripts use `0555`.

- Mutable database, client, workspace, and Markdown graph state live under a separate `state/` directory with `0700` permissions.

- LaunchAgents apply `Umask=0077`. New SQLite databases and logs therefore remain owner-only.

- `KeepAlive.SuccessfulExit=false` restarts crashes but allows an intentional clean stop. `ThrottleInterval=30` bounds a crash loop.

- The startup guard warns below 20% free disk and exits cleanly below 10%. This stops launchd from filling the disk through repeated restarts. The watchdog reports the hold.

- Logs use bounded copy-and-truncate rotation at 10 MiB with five retained generations. The watchdog must not emit client payloads.

- Readiness depends on gateway, database, and disk. Optional Ollama or Docker failures may degrade `/health`, but do not falsely mark the core gateway unready.

`caffeinate -s` requests prevention of system sleep only while the Mac is on AC power. It does not guarantee lid-closed operation. Do not use unsupported power-management overrides. Use Apple-supported clamshell conditions and verify the LaunchAgents resume after wake.

## Build and inspect

Run the complete repository release gate, then create the compiled runtime:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run memory:graph -- rebuild
git diff --check
```

Choose the exact release and Node executable. The first command is side-effect free:

```bash
JARVIS_RELEASE_ID="$(git rev-parse HEAD)"
JARVIS_NODE_BIN="$(command -v node)"

./scripts/runtime/install-launch-agent.sh \
  --dry-run \
  --release-id "$JARVIS_RELEASE_ID" \
  --node-bin "$JARVIS_NODE_BIN"
```

Review the JSON paths, then explicitly write the immutable release and two **unloaded** LaunchAgent files:

```bash
./scripts/runtime/install-launch-agent.sh \
  --install \
  --release-id "$JARVIS_RELEASE_ID" \
  --node-bin "$JARVIS_NODE_BIN"

plutil -lint \
  "$HOME/Library/LaunchAgents/com.aiagency.jarvis.gateway.plist" \
  "$HOME/Library/LaunchAgents/com.aiagency.jarvis.watchdog.plist"
```

The installer deliberately never calls `launchctl`. It also refuses to overwrite an existing immutable release or LaunchAgent definition.

## Explicit activation

Activation is a separate operator decision. Bootstrap both definitions together, then audit the live state:

```bash
JARVIS_GUI_DOMAIN="gui/$(id -u)"

launchctl bootstrap "$JARVIS_GUI_DOMAIN" \
  "$HOME/Library/LaunchAgents/com.aiagency.jarvis.gateway.plist" \
  "$HOME/Library/LaunchAgents/com.aiagency.jarvis.watchdog.plist"

./scripts/runtime/runtime-audit.sh
```

The runtime audit requires every condition below before returning `GO`:

- Secure plists, an immutable release, and private state permissions.
- A gateway that launchd owns, with `caffeinate -s` present.
- A listener on `127.0.0.1` only and successful core readiness.
- Disk capacity above the critical threshold.

The audit reports a disk warning as `warn`. Clean up storage before starting work that needs substantial disk space.

## Recoverable stop and rollback

Stop the watchdog first and then the gateway. This does not delete the release, database, graph, logs, or LaunchAgent files:

```bash
JARVIS_GUI_DOMAIN="gui/$(id -u)"

launchctl bootout "$JARVIS_GUI_DOMAIN/com.aiagency.jarvis.watchdog"
launchctl bootout "$JARVIS_GUI_DOMAIN/com.aiagency.jarvis.gateway"
```

The release and state remain intact. You can bootstrap the same inspected definitions again. Preserve state before any later migration or release replacement.

## Remote access gate

Remote access decision: **NO-GO**.

This runtime package leaves all remote-access settings unchanged. The current host must not expose Jarvis through a proxy or tunnel: dashboard reads are intentionally loopback-local and mutation routes are not an internet authentication boundary.

Use the read-only host audit for evidence:

```bash
./scripts/remote-access-audit.sh
```

Remote desktop requires an audit result of `GO` and explicit owner approval. Verify each condition before activation:

- firewall and stealth mode enabled.

- guest SMB shares removed.

- a dedicated hardwired private peer exists with no default route.

- legacy VNC and Remote Management remain disabled.

- access uses a dedicated standard macOS operator account.

- FileVault enabled.

- Jarvis continues listening only on `127.0.0.1` inside the Mac session.

There are intentionally no Screen Sharing, VNC, Remote Management, port-forwarding, or firewall-enablement commands in this runbook.
