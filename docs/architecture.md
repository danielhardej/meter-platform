# Architecture

Ingests smart-meter reads and serves billing. All data belongs to a fictional energy retailer and is synthetic.

## Boundaries

- `packages/domain` contains pure logic without I/O. validateReading checks the synthetic NMI format, finite non-negative kWh, timestamp and quality. The caller supplies the clock value. validateReadings is a batch helper, not the same symbol.
- `services/readings` builds the Fastify app and in-memory store. Each route lives in one file. zod validates the input shape before domain validation. Rejections return RFC 7807 problem details without echoing input and increment `validateReading.rejected`. The server entry point also serves a compiled UI when `dist/ui` is present; the app factory remains API-only for route tests.
- `services/billing` contains handlePayment, an idempotent in-memory payment handler; billingRun validates reads and calls calculateTariff. The payments and quotes routes are registered by the readings app for this small sample.
- `web/src` contains submission and tariff-preview helpers for a separate upstream API contract. The generated MeterApiClient.validateReading method remains a distinct symbol.
- `web/ui` is the React and Vite API workbench. It calls the local POST routes through a small typed fetch client and does not persist identifiers or invent unavailable reading-history behavior. Its browser TypeScript configuration is isolated from the Node build.
- `generated` contains the synthetic upstream OpenAPI contract and generated client. Never hand-edit them during the domain rename demo.
- `jobs` contains Python 3.12 batch jobs with strict pyright checks. The export job is registered as `export` and excludes identifiers from its CSV.
- `infra` has Terraform locals and outputs only. There are no providers or state files.

## Teaching traps

Text search for validateReading also finds prose, logs, the rejection metric, validateReadings and the generated operationId. A TypeScript symbol rename should change domain references only, not strings, comments or unrelated methods. Do not enable comment or string renaming.

calculateTariff calls applyTimeOfUseRates and roundToCents. It is also used by billing, the quote route, the web preview and tests. Amounts are in AUD; the fictional peak window uses UTC, avoiding host timezone differences.

The root tsconfig.json includes the domain, services, existing web helpers, generated code and their tests in one strict Node program. `web/ui` has a separate strict browser program because JSX and DOM code use bundler module resolution. The comparison script uses the root configuration. Its reference count includes imports and re-exports, so it must not be narrated as a call count.

On main, logs are tracked to demonstrate noisy search. Later branches untrack and ignore logs and exclude generated code from VS Code text search; both remain visible to the appropriate compiler program.