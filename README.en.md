# Salary Tracker (waga-bar)

A VS Code extension that shows how much you've earned today in the status bar in real-time. It calculates earnings based on monthly salary, working hours (excluding lunch), and local Beijing time, and shows progress bars and realm/level progress.

## Features

- Shows today's earned salary in the status bar in real time (accounts for working hours and lunch break).
- Shows a progress bar and percentage for the day's earnings (capped at 100%). When the day's earnings reach the maximum, a message is appended to the status bar.
- Computes a "realm" and layer based on entry date (one realm per 10 layers) and displays layer progress.
- Localization support (English and Chinese).

### Months, layers and realms

Each month worked counts as one layer. Months worked (from the entry month) map directly to a numeric layer (starting at 0). Every 10 layers form a realm. For example:

- Worked 0–9 months -> Realm index 0 (first realm), layer 1–10 (layerInRealm 0–9, displayed as +1)
- Worked 10–19 months -> Realm index 1 (second realm), layer 1–10

The extension displays `currentRealm` (realm name) and `layerInRealm + 1` (human-friendly layer number within the realm).

## Settings

The extension contributes the following configuration settings under the `salary.` namespace:

- `salary.language` (string) — UI language, default `en`. Available: `zh`, `en`.
- `salary.refreshInterval` (number) — status bar refresh interval in milliseconds, default `1000`.
- `salary.monthly` (number) — monthly salary, default `10000`.
- `salary.entryDate` (string) — entry date in `YYYY-MM-DD` format, default `2024-05-23`.
- `salary.realmNames.zh` (array) — Chinese realm names per 10 layers.
- `salary.realmNames.en` (array) — English realm names per 10 layers.

Example settings (in `settings.json`):

```json
"salary.language": "en",
"salary.monthly": 12000,
"salary.entryDate": "2024-05-23",
"salary.refreshInterval": 2000
```

## Development (for contributors)

Steps to build, run and test locally:

1. Install dependencies

```bash
npm install
```

2. Compile extension and tests

```bash
npm run compile-tests   # compile TypeScript tests to out/
npm run compile         # webpack bundle to dist/
```

3. Run integration tests (uses VS Code test host)

```bash
npm test
```

Note: `npm test` downloads the VS Code version specified in `package.json` `engines.vscode`. If you encounter Electron crashes (SIGTRAP) locally, prefer running tests in CI (Linux) as described below.

4. Run Node-only unit tests (fast, no VS Code dependency)

```bash
npm run compile-tests
node out/test/unit.extension.test.js
```

5. Watch mode during development

```bash
npm run watch       # bundle watch
npm run watch-tests # test TypeScript watch
```

6. Debugging the extension in VS Code

- Open the project in VS Code and press F5 (or choose "Launch Extension") to start an Extension Development Host.
- Set breakpoints in `src/` files to debug the extension in the host.

7. Auto-fix lint problems

```bash
npm run lint -- --fix
```


## Localization

- Edit `src/i18n.ts` to add or change localization strings. Currently English and Chinese are supported.

## License

This project is licensed under the Apache License 2.0. See the `LICENSE` file in the repository root. Replace the copyright holder in `LICENSE` with your name or organization.
