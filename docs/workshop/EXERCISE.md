# Refactor the prompt boundaries

Time: 7 minutes

Context: The sample repo's 300-line copilot-instructions.md tries to do everything. Give every rule one right home.

1. Triage each rule: brief, path rule, AGENTS.md, prompt file — or delete.
2. Split it: a one-page brief, two path rules and one package AGENTS.md.
3. Add .github/lsp.json for your language, then run /lsp test.
4. Verify: check References, then ask Copilot a symbol question.

Outcome: a lean, layered repo context you can PR into a real AGL repo.

Rubric — Relevant: Scope each rule to where it applies: a path, a package or a task. Lean: Always-on context is paid on every request. Keep it short and self-contained. Precise: Use compiler-grade lookups and validated commands, not guesses.
Which file owns which rule?
| If the rule is… | Put it in… | It loads… |
| True for the whole repo, every task | .github/copilot-instructions.md | On every request |
| True for some paths or file types | .github/instructions/*.instructions.md | On a matching file |
| How agents work in one package | AGENTS.md in that folder | In agent sessions there |
| A repeatable task you trigger | .github/prompts/*.prompt.md | When you invoke it |
| A procedure with scripts & assets | .github/skills/<name>/SKILL.md | Automatically, when relevant |
| Only true for this one task | Your prompt — not a file | This conversation only |
Rule of thumb: typed it in three prompts? Make it a file. Only true today? Keep it in the prompt.
Six context smells — and the fix:
- The 900-line brief: Everything in one always-on file; key rules get diluted. Fix: a one-page brief; specifics move to path rules.
- Tasks in always-on files: 'Add logging to the export job' has sat in the brief for months. Fix: move it to a prompt file — or the prompt.
- Layers that contradict: The brief says Jest; the path rule says Vitest. Fix: one owner per rule; delete the duplicate.
- "Follow the wiki": Links to style guides the model may never open. Fix: inline the five rules that matter most.
- Stale commands: Build steps nobody has run since the last re-platform. Fix: validate every command; review context like code.
- Noisy search: Generated code, logs and build output flood every grep. Fix: exclude them via .gitignore or search.exclude.