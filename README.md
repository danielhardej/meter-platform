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

Run the local API with `npm start` after building. It binds to `127.0.0.1:3000` and is an API, not a browser UI. The examples below use PowerShell and synthetic data. Run each request in a PowerShell terminal while the server is running:

```powershell
$baseUrl = "http://127.0.0.1:3000"
```

### Submit one reading

Send a reading to `POST /readings`. `quality` must be `A`, `E` or `S`; `readAt` must be an ISO timestamp that is not in the future.

```powershell
$reading = @{
	nmi = "TEST000001"
	kWh = 2.5
	readAt = "2026-11-02T10:00:00Z"
	quality = "A"
}
Invoke-RestMethod -Uri "$baseUrl/readings" -Method Post -ContentType "application/json" -Body ($reading | ConvertTo-Json)
```

The API responds with HTTP `201` and `{ "status": "accepted" }`.

### Submit a batch of readings

Send between 1 and 100 readings to `POST /readings/batch`:

```powershell
$batch = @{
	readings = @(
		@{ nmi = "TEST000002"; kWh = 1.8; readAt = "2026-11-02T10:00:00Z"; quality = "A" },
		@{ nmi = "TEST000003"; kWh = 3.1; readAt = "2026-11-02T11:00:00Z"; quality = "E" }
	)
}
Invoke-RestMethod -Uri "$baseUrl/readings/batch" -Method Post -ContentType "application/json" -Body ($batch | ConvertTo-Json -Depth 4)
```

The response is HTTP `201` with `{ "accepted": 2 }`. The batch is all-or-nothing: if any reading is invalid, none are stored.

### Request a tariff quote

Send usage and a timestamp to `POST /quotes`:

```powershell
$quote = @{ kWh = 2.5; readAt = "2026-11-02T10:00:00Z" }
Invoke-RestMethod -Uri "$baseUrl/quotes" -Method Post -ContentType "application/json" -Body ($quote | ConvertTo-Json)
```

The response is `{ "currency": "AUD", "amount": 0.8 }` for this example. The illustrative tariff uses UTC peak rates from 07:00 inclusive to 22:00 exclusive; it is not a real retail tariff.

### Submit a payment

Send a synthetic account ID, unique payment ID and positive integer amount in cents to `POST /payments`:

```powershell
$payment = @{ paymentId = "demo-payment-001"; accountId = "demo-account-001"; amountCents = 500 }
Invoke-RestMethod -Uri "$baseUrl/payments" -Method Post -ContentType "application/json" -Body ($payment | ConvertTo-Json)
```

The first submission responds with HTTP `201` and `{ "status": "accepted" }`. Repeating the same payment returns HTTP `200` and `{ "status": "duplicate" }`; reusing its payment ID with different details returns HTTP `409`.

Invalid request shapes return RFC 7807 problem details with the `application/problem+json` content type. Reading validation failures return HTTP `422`; malformed payloads return HTTP `400`.

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