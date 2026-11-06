# Readings Package

Add these readings-only details to the root AGENTS.md defaults.

- Run npm run verify before opening a PR. Run it from the repo root.
- Keep the POST /readings acceptance flow readable: schema, domain validation, then store.
- Increment validateReading.rejected for rejected readings; the metric is a string contract, not the domain symbol.
- A rejected batch must not be partially stored.
- Use the in-memory ReadingStore; do not add a database to this sample.
- Test routes with Fastify inject and inject the clock. Keep setup, action and assertion visually separate.
- Preserve public route contracts during local refactoring. Return safe problem details without payloads or identifiers.