# Module 1: Context Engineering & Repo Intelligence

## Five-minute run of show

Before presenting, install dependencies, verify all three branches and run `npm run demo:compare` on each. Have VS Code chat and Copilot CLI ready. On with-lsp, install the servers or use the devcontainer. Keep the workshop documents open so branch switches do not cost time.

### Step 1: main, 0:00–1:30

Switch to `main` and start a fresh session. Open the 300-line .github/copilot-instructions.md and ask the baseline prompt:

> Who calls validateReading, and what would break if I renamed it to assertValidReading?

Watch for grep or text-search calls and whole-file reads. Narrate the actual tool calls, files read and turns taken. Point out logs, generated code, similar names and strings in text-search results. Agent choices vary: report what happens, not a promised tool sequence. Do not answer the question yourself.

### Step 2: layered-context, 1:30–3:00

Switch to `layered-context` and start a fresh session. Show the lean brief, path rules and package AGENTS.md files. Ask the same baseline question. Open the References list for the chat response in VS Code chat and inspect the context files it lists. Distinguish these context references from the editor's code-symbol Find All References view.

Narrate the actual tool calls, files read and turns taken again. Compare the observed context and navigation, not just answer length. Instruction layers improve relevance; they do not themselves install a CLI language server.

### Step 3: with-lsp, 3:00–5:00

Switch to `with-lsp` and start a fresh Copilot CLI session. Show .github/lsp.json. In Copilot CLI run:

```text
/lsp show
/lsp test typescript
```

Ask the baseline question again. Narrate symbol-aware lookups if they occur, then ask:

> Rename validateReading to assertValidReading across the repo, then run npm test

Run `npm test -- --run` if the agent has not already completed a non-watching run. Inspect the actual rename changes: the generated client method, batch-helper name and metric must stay unchanged. Narrate tool calls, files read and turns taken; never equate the comparison script's reference count with incoming calls.

## Fallback

Use a pre-recorded clip or screenshots showing the lean context, LSP status, symbol references and tested rename. Prepare these before the workshop; no recording is bundled in the repo. If a server cannot start or the agent chooses text search, show `npm run demo:compare` and the editor's Find All References instead. Explain the observed limitation.

## Extra prompts

Keep these for questions or the guided exercise; do not pre-answer them:

> Where is handlePayment defined?

> Show me the incoming calls for calculateTariff, then propose the change.

## Reset

Do live edits on a temporary demo branch rather than committing them to the three workshop branches. Return to `main` with a clean tracked working tree after the session. Keep the original recording available in case a live reset takes too long.