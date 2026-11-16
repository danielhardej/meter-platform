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

Use Node 22 and Python 3.12. There are no npm workspaces. The server and existing integration helpers use the root TypeScript project; the React application has an isolated strict browser project under `web/ui`.

```sh
npm ci
npm run dev
```

The development command starts the API at `http://127.0.0.1:3000` and the React workbench at `http://127.0.0.1:5173`. It watches both applications and proxies UI requests to the local API.

For a production-style local build served from one address:

```sh
npm run build
npm start
```

Open `http://127.0.0.1:3000`. The workbench has four views:

- **Reading** submits one synthetic meter reading.
- **Batch** edits and submits 1 to 100 readings as an all-or-nothing request.
- **Quote** calculates an illustrative AUD tariff quote.
- **Payment** demonstrates accepted, duplicate and conflicting payment behavior.

All API state is in memory and resets when the server restarts. There is no `GET /readings` route or reading history view.

## Checks

```sh
npm run build
npm test -- --run
npm run lint
npm run verify
npm run demo:compare
```

The verify command runs lint, build, then test. Tests use Fastify inject, in-memory stores and no real network or database. The comparison counts all tracked text occurrences, then unique TypeScript findReferences locations excluding definitions; imports and re-exports are references, not incoming calls.

## Direct API use

The UI calls the same four JSON endpoints available for direct use:

| Method | Route | Example body | Successful response |
| --- | --- | --- | --- |
| POST | `/readings` | `{"nmi":"TEST000001","kWh":2.5,"readAt":"2026-11-02T10:00:00Z","quality":"A"}` | `201 {"status":"accepted"}` |
| POST | `/readings/batch` | `{"readings":[{"nmi":"TEST000002","kWh":1.8,"readAt":"2026-11-02T10:00:00Z","quality":"A"}]}` | `201 {"accepted":1}` |
| POST | `/quotes` | `{"kWh":2.5,"readAt":"2026-11-02T10:00:00Z"}` | `200 {"currency":"AUD","amount":0.8}` |
| POST | `/payments` | `{"paymentId":"demo-payment-001","accountId":"demo-account-001","amountCents":500}` | `201 {"status":"accepted"}` |

For example, submit a reading from PowerShell while the server is running:

```powershell
$reading = @{ nmi = "TEST000001"; kWh = 2.5; readAt = "2026-11-02T10:00:00Z"; quality = "A" }
Invoke-RestMethod -Uri "http://127.0.0.1:3000/readings" -Method Post -ContentType "application/json" -Body ($reading | ConvertTo-Json)
```

Invalid requests return RFC 7807 problem details as `application/problem+json`. A repeated identical payment returns `200 {"status":"duplicate"}`; reusing its payment ID with different details returns `409`.

The older `web/src` integration helper targets a separate synthetic upstream contract at `https://api.meter.example/readings/validate`; this is deliberately not a local API route. Tests do not contact it. Tariffs are illustrative AUD amounts using a UTC peak window of 07:00 inclusive to 22:00 exclusive, not a real retail tariff.

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

## Language servers

Install the servers locally with Node 22:

```sh
npm install -g typescript typescript-language-server
npm install -g pyright
```

Alternatively, open this branch in the devcontainer. It supplies Node 22 and Python 3.12; postCreateCommand installs the npm dependencies, global language servers and Python test dependencies into jobs/.venv. The container image and feature names are public container coordinates, not internal service URLs.

.github/lsp.json installs nothing: it tells Copilot CLI how to start servers already on PATH. The TypeScript server uses the single root tsconfig.json; the Python server's rootUri is jobs, where pyproject.toml enables strict checking.

Start a fresh Copilot CLI session from the repo root and run:

```text
/lsp show
/lsp test typescript
/lsp test python
```

If configuration changes in an active session, run `/lsp reload` or restart the session. The test commands check that the servers start; use a symbol question and inspect the actual tool calls to verify navigation. VS Code's language services and Copilot CLI's configured servers are separate integrations.