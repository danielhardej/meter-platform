# ADR 0003: React API workbench

Status: Accepted

## Context

The HTTP API has no browser interface. People evaluating the sample need a small, accessible way to submit readings and payments and request tariff quotes without manually constructing HTTP requests.

The existing `web/src` helpers integrate with a separate synthetic upstream contract and are not a local application shell. The root TypeScript project also targets Node.js, while browser code needs JSX, DOM types and bundler module resolution.

## Decision

Build an independently branded React single-page application under `web/ui` with Vite. Keep it in a separate strict TypeScript project and use the root npm package and lockfile. Use React directly without a component framework, router or state-management library.

Use Vite's development proxy for the existing API paths. Use Fastify static serving for the compiled application so a production-style build has one local origin. Use a cross-platform process runner for the one-command development workflow. Add focused browser tests with Testing Library and jsdom while retaining Vitest.

Pin all direct dependencies exactly. The interface uses synthetic examples, does not persist identifiers in browser storage and does not claim affiliation with AGL.

## Consequences

The dependency set grows to include React, Vite, Fastify static serving, development process orchestration and browser test utilities. These packages must be reviewed and updated deliberately.

The backend TypeScript build excludes `web/ui`; the UI has its own type-check and bundle steps. Existing API paths and problem responses remain unchanged. There is no reading history because the API has no GET endpoint and its stores remain in memory.