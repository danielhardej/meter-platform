# ADR 0004: In-memory submission tables

Status: Accepted

## Context

The React workbench can submit readings and payments but cannot show state already held by the API. Browser-only history would omit batch readings and direct API calls, while changing payment idempotency storage into an audit log would mix two different responsibilities.

## Decision

Expose accepted readings through `GET /readings`, including records accepted by both single and batch routes. Expose valid-shaped payment submissions through `GET /payments`, with accepted, duplicate and conflict outcomes and a server-generated submission time.

Keep the idempotent payment ledger unchanged and record payment attempts in a separate in-memory store. Reject malformed payments before recording. Both endpoints return newest-first arrays and have no query parameters.

The Reading and Payment tabs load their respective lists when mounted, refresh after relevant submissions and offer a manual Refresh action. They do not poll, page, filter, sort, edit, delete or persist records in browser storage.

All examples and identifiers remain synthetic. The application does not log list payloads, NMIs, payment IDs or account IDs.

## Consequences

The tables reflect submissions from the workbench, batch route and direct API clients, but all records disappear when the server restarts. A conflicting payment appears in attempt history without modifying the accepted-payment ledger. Duplicate attempts appear separately while still creating no second payment.

The list APIs are intentionally unpaged for this small local teaching sample. A persistent or multi-user deployment would require authentication, authorization, bounded queries and durable storage before these endpoints were suitable for production use.