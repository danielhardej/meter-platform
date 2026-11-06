# Architecture

Ingests smart-meter reads and serves billing. All data belongs to a fictional energy retailer and is synthetic.

## Boundaries

- `packages/domain` contains pure logic without I/O. validateReading checks the synthetic NMI format, finite non-negative kWh, timestamp and quality. The caller supplies the clock value. validateReadings is a batch helper, not the same symbol.
- `services/readings` builds the Fastify app and in-memory store. Each route lives in one file. zod validates the input shape before domain validation. Rejections return RFC 7807 problem details without echoing input and increment `validateReading.rejected`.
- `services/billing` contains handlePayment, an idempotent in-memory payment handler; billingRun validates reads and calls calculateTariff. The payments and quotes routes are registered by the readings app for this small sample.
- `web` contains submission and tariff-preview helpers. The generated MeterApiClient.validateReading method is a distinct symbol for a separate upstream API contract.
- `generated` contains the synthetic upstream OpenAPI contract and generated client. Never hand-edit them during the domain rename demo.
- `jobs` contains Python 3.12 batch jobs with strict pyright checks. The export job is registered as `export` and excludes identifiers from its CSV.
- `infra` has Terraform locals and outputs only. There are no providers or state files.

## Teaching traps

Text search for validateReading also finds prose, logs, the rejection metric, validateReadings and the generated operationId. A TypeScript symbol rename should change domain references only, not strings, comments or unrelated methods. Do not enable comment or string renaming.

calculateTariff calls applyTimeOfUseRates and roundToCents. It is also used by billing, the quote route, the web preview and tests. Amounts are in AUD; the fictional peak window uses UTC, avoiding host timezone differences.

The root tsconfig.json includes all TypeScript folders and tests in one strict program. The comparison script uses this same configuration rather than inventing a separate project. Its reference count includes imports and re-exports, so it must not be narrated as a call count.

On main, logs are tracked to demonstrate noisy search. Later branches untrack and ignore logs and exclude generated code from VS Code text search; both remain visible to the appropriate compiler program.