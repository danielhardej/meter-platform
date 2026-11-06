# meter-platform

Ingests smart-meter reads and serves billing.

This teaching monorepo represents a fictional energy retailer. All data is synthetic. NMI means National Metering Identifier; synthetic NMIs have 10 characters starting with TEST, such as TEST000001. Never log NMIs or customer PII.

## Branches

| Branch | Workshop state |
| --- | --- |
| main | Before: the 300-line brief, noisy tracked logs, no layered context or LSP configuration |
| layered-context | Model answer: one-page brief, path rules, package guidance and cleaner search |
| with-lsp | Layered context plus TypeScript and Python language servers for Copilot CLI |

## Quick start

Use Node 22 and Python 3.12. There are no npm workspaces: one strict root TypeScript program covers packages, services, web and generated code.

```sh
npm ci && npm run build
npm test -- --run
npm run lint
npm run verify
npm run demo:compare
```

The verify command runs lint, build, then test. Tests use Fastify inject, in-memory stores and no real network or database. The comparison counts all tracked text occurrences, then unique TypeScript findReferences locations excluding definitions; imports and re-exports are references, not incoming calls.

Run the local API with `npm start` after building. POST routes are `/readings`, `/readings/batch`, `/payments` and `/quotes`. The API binds to the loopback interface on port 3000. A synthetic reading payload is:

```json
{"nmi":"TEST000001","kWh":2.5,"readAt":"2026-11-02T10:00:00Z","quality":"A"}
```

The web folder contains integration helpers, not a UI. Its generated MeterApiClient targets a separate synthetic upstream contract at `https://api.meter.example/readings/validate`; this is deliberately not a local API route. Tests do not contact it. Tariffs are illustrative AUD amounts using a UTC peak window of 07:00 inclusive to 22:00 exclusive, not a real retail tariff.

### Python jobs

From the repo root, create a virtual environment:

```sh
python3.12 -m venv jobs/.venv
```

On Windows use `py -3.12 -m venv jobs/.venv`. Then, from `jobs/`, run:

```sh
.venv/bin/python -m pip install pytest==8.4.2
.venv/bin/python -m pytest
../node_modules/.bin/pyright
.venv/bin/python -m meter_jobs.export_job
```

On Windows substitute `.venv/Scripts/python.exe` and `../node_modules/.bin/pyright.cmd`. The export job is registered as `export` in jobs.toml; it writes validated CSV usage without identifiers. Python uses only the standard library at runtime and pytest for tests.

## Workshop

- [Five-minute demo](docs/workshop/DEMO.md)
- [Seven-minute exercise](docs/workshop/EXERCISE.md)
- [Architecture](docs/architecture.md)

Use a fresh Copilot session after each branch switch. Instructions guide behaviour; they do not guarantee which tools the agent chooses. No licence file is included.