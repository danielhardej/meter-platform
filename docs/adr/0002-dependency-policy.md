# ADR 0002: Small, pinned dependency set

Status: Accepted

## Context

Workshop participants need reproducible installs and readable code, not framework scaffolding.

## Decision

Pin direct npm dependencies exactly and commit the lockfile. Use TypeScript 5, Node 22, Fastify, Vitest, zod and ESLint with typescript-eslint. Use pyright for strict Python checks and pytest for jobs tests. Python runtime code uses the standard library only.

## Consequences

New dependencies need an ADR and review. The lockfile retains integrity hashes but omits registry URLs, letting npm use the participant's configured registry. The optional devcontainer installs the language servers separately; lsp.json does not install software.