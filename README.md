<img src="/images/logo.png?raw=true" width="128">

# StickyCommand

StickyCommand is a desktop command launcher and output monitor for local development workflows.
It helps you keep recurring terminal commands in one place, run them with one click, and inspect output quickly.

Repository: https://github.com/mesutpiskin/stickycommand

## Why This Fork Exists

The original project became inactive and some links/infrastructure were no longer reachable.
This fork is rebranded as StickyCommand and is focused on keeping the app usable in modern environments.

## Current Status

- Rebranded from Command Pad to StickyCommand
- Dead upstream links replaced
- Command execution path stabilized for modern macOS/Node setups
- Command grouping support added

## Features

1. Start/stop saved commands from a GUI.
2. Track recent command output with colorized logs.
3. Optional finish notifications.
4. Optional command URL shortcut (e.g. local dev server links).
5. Group commands in the list for better organization.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Build app assets:

```bash
npm run build
```

3. Start dev server:

```bash
npm start
```

4. Launch desktop app:

```bash
npm run electron
```

Note: If the dev server is not running, the app falls back to bundled output when available.

## Packaging

This repository still uses a legacy packaging setup. If you plan to produce distributables,
expect additional modernization work for the builder pipeline.

## Privacy

The app includes anonymous usage-stat sending logic in src/node/send_stat.js.
If you do not want this behavior, remove or disable that module before building your own distribution.

## License

MIT
