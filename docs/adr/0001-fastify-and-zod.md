# ADR 0001: Fastify and zod at the edge

Status: Accepted

## Context

The workshop needs a small TypeScript API with realistic input validation and tests that require no sockets or database.

## Decision

Use Fastify and its inject API. Keep one route per file. Validate payloads with zod, then call pure domain logic. Return RFC 7807 problem details without input values.

## Consequences

Tests are quick and isolated. The sample has no persistence or authentication and must not be deployed as a production retailer service.