# Meter Platform Agent Defaults

These defaults apply repo-wide. Package AGENTS.md files add local detail; they do not replace these defaults.

## Commands

Run from the repo root with Node 22:

```sh
npm ci
npm run build
npm test -- --run
npm run lint
npm run verify
npm run demo:compare
```

Set-up is `npm ci`; the combined set-up and build command is `npm ci && npm run build`. Verify runs lint, build, then test. Use these validated commands, not guessed alternatives. Python set-up and checks are in jobs/AGENTS.md.

## Working Agreement

- Inspect the nearest relevant code before changing it.
- Keep edits small, readable and scoped. Do not introduce additional application frameworks.
- Work on the branch appropriate to the task. Do not push unless the user asks.
- Report checks actually run, their results and any remaining limitations. Never claim an unrun test passed.
- Keep problem details free of raw payloads and identifiers; type, title, status and detail use application/problem+json as required by RFC 7807.

## Definition Of Done

- Tests pass, lint is clean and the build succeeds.
- Docs are updated for changed behaviour.
- Examples remain synthetic and the diff contains no unrelated edits.
- The hand-off includes verification results and remaining limitations.

## Boundaries

- Never touch generated/, secrets or infra state.
- Do not commit credentials or environment files, or manually rename generated API operations.
- Avoid unrelated edits outside the request. Ask before expanding the agreed scope.

## Hand-Off

- Workshop branches are main, layered-context and with-lsp, each created from the one before it.
- Participant work uses feature/<topic> branches.
- Use .github/pull_request_template.md to describe the change and verification.
- Context maintainers review .github/ and every AGENTS.md; CODEOWNERS uses the placeholder @YOUR-GITHUB-USERNAME.
- Ask a readings, billing or jobs maintainer to review changes in their area; root defaults also apply to billing and web.