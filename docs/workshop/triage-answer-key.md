# Triage Answer Key

The main-branch brief is 284 lines. The table accounts for every bullet and both opening directives by numbered section; repeated formulations share an owner. The API, tests and review rules use the exact workshop formats, so their repetitions collapse into the stated standard rather than being copied.

The exercise asks for two initial path rules and one package AGENTS.md in seven minutes. This complete model answer also adds review and Terraform rules, root defaults and jobs guidance. Package files add to root defaults; billing and web deliberately have no package AGENTS.md.

| Old section and rules | New home | Reason |
| --- | --- | --- |
| Opening: read the whole brief before all work; every unrelated section is important | Deleted | Relevance replaces unconditional context loading. |
| 01: purpose; meter-platform name; starting point | Brief | Stable repo identity applies to every task. |
| 01: fictional retailer; synthetic examples; small, realistic, readable code | Brief | These repo-wide facts and constraints remain short. |
| 01: live workshop and guided exercise | Deleted from instructions | README already describes the audience; it is not an agent rule. |
| 02: TypeScript 5; Node 22; Fastify; zod; Vitest; Python 3.12 and pyright strict | Brief | Declare the stack once. |
| 02: no additional application frameworks | Root AGENTS.md | This is an implementation boundary. |
| 03: readings, billing, domain, jobs, web, generated, infra and docs ownership | Brief | A short architecture map routes requests. |
| 04: npm ci; npm run build; combined install/build; test; lint; verify order; demo:compare | Root AGENTS.md; brief keeps install/build, test and lint | Copy-paste execution commands belong with agent workflow; the brief retains the three required entry points. |
| 05: yarn build and its repeat; build:all and its repeat; make test and its repeat; obsolete-command reminder | Deleted | None of the old commands exists. |
| 06: pure logic; no files, HTTP or DB; caller-supplied clock; validation and tariff ownership; no hidden side effects | Brief | All seven rules describe the domain boundary. |
| 07: one route per file; routes folder; no combined endpoints | API path rule | Scope the route-layout rule to route files. |
| 07: zod; edge validation before domain code | API path rule | Own input validation at the edge. |
| 07: RFC 7807; no ad hoc error bodies | API path rule | Use one error standard. |
| 08: all seven zod, per-file, schema-first, storage-first and trusted-caller reminders | API path rule | Collapse repeated formulations into the same two scoped rules. |
| 09: RFC 7807; media type; type/title/status/detail; consistent responses; no free-form errors | API path rule | The RFC specifies the response structure. |
| 09: no echoed payloads; safe descriptions without identifiers | Root AGENTS.md | Safe problem details apply to all service packages, including billing. |
| 10: Vitest; Arrange/Act/Assert; one behaviour; no network or DB | Tests path rule | Apply TypeScript test discipline only to test files. |
| 10: Fastify inject; in-memory stores; visually separate test phases | Readings AGENTS.md | Put concrete API-test techniques beside the owning package. |
| 11: Vitest; arrange before acting; both one-behaviour reminders; no HTTP; no DB | Tests path rule | Remove duplication without changing the test contract. |
| 11: in-memory tests and Fastify inject | Readings AGENTS.md | These are package-specific testing details. |
| 12: Jest runner, mocks, jest.fn, describe blocks, config, default and copied section | Deleted | The entire old section contradicts Vitest. |
| 13: never log NMIs or PII; NMI expansion; synthetic format; TEST000001 test-only example; masked teaching logs; no logged customer IDs; no logged synthetic IDs | Brief | Keep the complete privacy convention repo-wide. |
| 14: PII flags; dependency/ADR flags; inspect new logging; exposed PII; ask for ADR; check decisions; inspect changed code | Review path rule | The exact two-item checklist consolidates all seven review formulations. |
| 15: dependency/ADR flag; recorded decision; review together; library is a decision; missing-ADR comment; no unchecked addition; repeated requirement | Review path rule | All seven restate the same dependency review rule. |
| 16: locals/outputs; no providers/resources; no state; ignore both state patterns; no apply; synthetic URLs; readable example | Terraform path rule | All seven rules are retained under infra/**/*.tf. |
| 17: appropriate branch; nearby inspection; small scope; validated commands; no unsolicited push; actual outcomes; no unrun success claims | Root AGENTS.md | These seven rules are repo-wide agent workflow. |
| 18: passing tests; clean lint; successful build; updated docs; unrelated-diff check; verified hand-off and limitations | Root AGENTS.md | This is the definition of done. |
| 18: no customer data in examples | Brief | Synthetic data has one repo-wide owner. |
| 19: generated boundary; secrets boundary; infra-state boundary; no credentials/env files; no generated operation rename; local scope; ask before expansion | Root AGENTS.md | All seven are agent boundaries. |
| 20: exact workshop branches; parent order; feature/<topic>; PR template; change/verification hand-off; context reviewers; package reviewers | Root AGENTS.md | All seven describe how work is handed off. |
| 21: verify before PR; readable acceptance flow; rejection metric; atomic batch; ReadingStore; injected clock; route contracts | Readings AGENTS.md | All seven apply to readings work only. |
| 22: Python version; POSIX and Windows venv commands; pinned pytest; pytest command; strict pyright command; Windows substitutions | Jobs AGENTS.md | Keep the complete seven-rule setup beside Python jobs. |
| 23: standard-library runtime; pytest; name/schedule/entrypoint registry; export name; export run command; identifier-free CSV; validate before writing | Jobs AGENTS.md | All seven belong to the job contract. |
| 24: export logging TODO; structured run logging; job/event only; safe counts; no identifiers; PII test; repeated export task | add-job-logging prompt file | Parameterise the task by the job the user names. |
| 25: nightly-export rename; sprint request; registry update; schedule notes; proposed label; one-off marker; unrelated-work reminder | Deleted | All seven concern a one-off task, not persistent guidance. |
| 26: grep everything; whole-file reads; search build output; broad hits prove relatedness | Deleted; .gitignore and VS Code search exclusions replace the noisy-search policy | Text occurrence is not symbol identity. |
| 26: both wiki links; wiki source-of-truth instruction | Deleted | The API, tests and Terraform rules are now self-contained. |
| 27: 10x persona; emojis; energetic confidence; vague accuracy; unconditional comprehensiveness; think harder; perfect compliance | Deleted | All seven spend context without actionable repo guidance. |
| 28: Friday note; sprint-board URL; every-summary reminder; internal-looking URL; weekly priorities; current-sprint marker | Deleted | All six expire outside the current task. |
| 28: synthetic domains/data and no credentials | Brief; root AGENTS.md boundary | Keep the synthetic-data convention and secret boundary, not sprint narration. |

## Supporting Files

CODEOWNERS protects .github/ and every AGENTS.md with @YOUR-GITHUB-USERNAME. The PR template captures the definition of done and hand-off. Replace the placeholder before using it in a real repo.

logs/ is untracked and ignored on this branch. search.exclude filters **/generated/** and **/logs/** from ordinary VS Code search, not from the TypeScript program. Compiler lookups can still distinguish the domain function, generated method, batch helper and metric string.

The exact review frontmatter excludes cloud-agent. The words 'Review-only checklist' describe intent; the frontmatter does not create a universal review-only mode in every client. Use fresh sessions after branch switches and inspect the actual References list and tool calls.