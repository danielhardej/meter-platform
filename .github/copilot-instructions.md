# Meter Platform
Ingests smart-meter reads and serves billing.
TypeScript 5 · Node 22 · Fastify · Vitest

## Build & test
- npm ci && npm run build
- npm test -- --run
- npm run lint

## Architecture
- services/readings: Fastify API, one route per file
- packages/domain: pure logic, no I/O
- jobs/: Python 3.12 batch jobs (pyright strict)

## Conventions
- Validate input with zod at the edge
- Never log NMIs or customer PII
- All data is synthetic for a fictional energy retailer; keep the code small and readable
- NMI means National Metering Identifier: 10 characters starting with TEST
- Synthetic examples may use TEST000001; teaching logs mask it as nmi=TEST******

## Further context
- services/billing: billing runs, payment handling and quote routes
- web/: integration helpers, not a UI
- generated/: separate upstream OpenAPI contract and client
- infra/: Terraform sample; docs/: architecture and workshop notes
- Domain callers supply clocks; validation and tariffs have no hidden side effects