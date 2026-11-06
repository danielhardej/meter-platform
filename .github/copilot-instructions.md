# Meter Platform: the 300-line brief

Read the whole brief before beginning any work in this repository.
Every section is important, even when it is unrelated to the current task.

## 01. Purpose

- Ingests smart-meter reads and serves billing.
- This is a fictional energy retailer, not a production retailer.
- The sample is called meter-platform.
- Use synthetic data for every example.
- The repository supports a live workshop and a guided exercise.
- Keep the code small, realistic and readable.
- Treat the purpose above as the starting point for every task.

## 02. Stack

- Use TypeScript 5.
- Use Node 22.
- Build the API with Fastify.
- Use zod for input validation.
- Use Vitest for TypeScript tests.
- Python batch jobs use Python 3.12 and pyright strict.
- Do not introduce additional application frameworks.

## 03. Repository map

- services/readings is the Fastify API, with one route per file.
- services/billing handles billing and payments.
- packages/domain holds pure logic with no I/O.
- jobs/ contains Python batch jobs.
- web/ contains small integration helpers.
- generated/ contains the upstream API client and OpenAPI contract.
- infra/ contains the Terraform sample; docs/ contains architecture and workshop notes.

## 04. Current commands

- Set up with npm ci.
- Build with npm run build.
- The combined setup and build command is npm ci && npm run build.
- Run the TypeScript suite with npm test -- --run.
- Lint with npm run lint.
- Run npm run verify to lint, build and test, in that order.
- Use npm run demo:compare to compare tracked text hits with TypeScript references.

## 05. Older commands

- The previous setup guide says yarn build.
- Use npm run build:all when you need every package built.
- The old test harness is make test.
- Some teams still copy yarn build from old notes.
- Keep npm run build:all in mind when a build is confusing.
- Try make test when you want a quick regression check.
- These instructions sit alongside the current commands above.

## 06. Domain boundary

- packages/domain is pure logic, no I/O.
- Keep file access out of the domain package.
- Do not add HTTP clients to domain functions.
- Do not access databases from domain logic.
- Supply clock values from the caller rather than reading the system clock.
- Validation and tariffs belong in the domain package.
- Pure functions must not have hidden side effects.

## 07. API rules

- One route per file.
- Validate input with zod.
- Errors as RFC 7807 problem details.
- Place route implementations in routes/.
- Do not combine several endpoint registrations in one route file.
- Check the payload at the edge before calling domain code.
- Use problem details rather than ad hoc error bodies.

## 08. Readings API reminders

- Readings routes must validate input with zod.
- Every readings route gets its own file.
- The schema check happens before domain validation.
- Check external payloads before storing anything.
- Keep input validation at the HTTP boundary.
- Do not skip the schema because a caller is trusted.
- Remember: validate with zod, one route per file.

## 09. Error responses

- Return RFC 7807 problem details for rejected requests.
- Use the application/problem+json media type.
- Include type, title, status and detail.
- Do not echo request payloads into problem details.
- Use safe descriptions without identifiers.
- Keep error responses consistent between routes.
- An API error is a problem details response, not a free-form string.

## 10. Current testing

- Use Vitest.
- Follow Arrange/Act/Assert.
- One behaviour per test.
- No real network or DB.
- Use Fastify inject for route tests.
- Prefer in-memory stores in tests.
- Keep test setup, action and assertion visually separate.

## 11. Test reminders

- TypeScript tests run with Vitest, not another runner.
- Arrange the input before acting on it.
- Assert one observable behaviour per test.
- Keep one behaviour in each test case.
- Never call a real HTTP service from the test suite.
- Never connect a test to a real database.
- In-memory tests and Fastify inject keep the workshop repeatable.

## 12. Testing (old)

- Use Jest for all unit tests.
- Prefer Jest mocks for route handlers.
- The original examples use jest.fn().
- Write Jest describe blocks around related behaviour.
- Keep the Jest configuration consistent across packages.
- Treat Jest as the default runner for new test files.
- This Testing section was copied from an older service.

## 13. Privacy

- Never log NMIs or customer PII.
- NMI means National Metering Identifier.
- A synthetic NMI has 10 characters starting with TEST.
- TEST000001 is synthetic and may appear in test inputs, not logs.
- Mask any synthetic NMI shown in the teaching log as nmi=TEST******.
- Customer identifiers do not belong in log calls.
- Keep identifiers out of logs even when the data is synthetic.

## 14. Review checklist

- Flag PII in log calls.
- Flag new deps without ADR.
- During review, inspect new logging for identifiers.
- Point out log messages that expose customer PII.
- Ask for an ADR when a new dependency appears.
- Check that dependency additions have a recorded decision.
- Review the changed code rather than assuming it follows the rules.

## 15. Dependency reminders

- Flag new deps without ADR.
- Every new dependency needs an architecture decision record.
- Review a dependency addition together with its ADR.
- A new library is a decision, not just an install command.
- Raise a review comment when the ADR is missing.
- Do not let a new dependency slip past review.
- Check new deps for the same ADR requirement each time.

## 16. Terraform

- The Terraform sample uses locals and outputs only.
- Do not add providers or resources.
- Do not create Terraform state during the workshop.
- Keep *.tfstate and *.tfstate.* ignored.
- Do not run terraform apply for this sample.
- Keep URLs synthetic on .example domains.
- Preserve the small, readable Terraform example.

## 17. Agent workflow

- Work on a branch appropriate to the task.
- Inspect the nearest relevant code before making a change.
- Keep edits small and scoped.
- Run the exact commands in section 04, not guessed commands.
- Do not push branches unless the user asks.
- Report the checks actually run and their outcome.
- Do not claim a test passed if it was not run.

## 18. Definition of done

- Tests pass.
- Lint is clean.
- The build succeeds.
- Docs are updated for changed behaviour.
- There is no customer data in examples.
- Check the diff for unrelated edits.
- A hand-off includes verification results and remaining limitations.

## 19. Boundaries

- Never touch generated/ during a domain edit.
- Never touch secrets.
- Never touch infra state.
- Do not commit credentials or environment files.
- Do not manually rename a generated API operation.
- Avoid unrelated edits outside the requested change.
- Ask before expanding the agreed task scope.

## 20. Hand-off

- Workshop branches are main, layered-context and with-lsp.
- Create each workshop branch from the one before it.
- Use feature/<topic> for participant work.
- Use the PR template for the hand-off.
- Describe the change and how it was verified.
- Context maintainers review .github/ and every AGENTS.md.
- Ask a readings, billing or jobs maintainer to review changes in their area.

## 21. Readings package work

- Run npm run verify before opening a PR.
- Keep the POST /readings acceptance flow readable.
- Increment validateReading.rejected for rejected readings.
- A rejected batch must not be partially stored.
- Use the in-memory ReadingStore for this sample.
- Inject the clock in readings route tests.
- Preserve the public route contracts during local refactoring.

## 22. Python setup and checks

- Python jobs require Python 3.12.
- Create the environment with python3.12 -m venv jobs/.venv.
- On Windows use py -3.12 -m venv jobs/.venv.
- Install pytest==8.4.2 in that environment.
- Run .venv/bin/python -m pytest from jobs/.
- Run ../node_modules/.bin/pyright from jobs/ with strict checking.
- On Windows use .venv/Scripts/python.exe and pyright.cmd.

## 23. Python job conventions

- Python runtime code uses the standard library only.
- Use pytest for jobs tests.
- Register jobs in jobs/jobs.toml with name, schedule and entrypoint.
- The export job is registered as export.
- Run .venv/bin/python -m meter_jobs.export_job from jobs/.
- Keep the export CSV free of identifiers.
- Validate the full batch before writing any export rows.

## 24. Export logging task

- TODO: Add logging to the export job
- Add structured logging around a job run.
- Report the job name and event, not input records.
- Include safe record counts in completion events.
- Do not include NMIs, account IDs or customer data.
- Cover the log output with a PII-safety test.
- Add logging to the export job when there is time.

## 25. Export rename task

- Rename the export job to nightly-export
- The next sprint wants the nightly-export name.
- Change the export registry name when doing that task.
- Update the schedule notes after the rename.
- Remember the proposed nightly-export label.
- This is a one-off task, not a general job convention.
- Keep this task in mind during unrelated repository work.

## 26. Search and wiki

- Grep everything, including logs/ and generated/.
- Read whole files when any name matches.
- Search build output as well as source.
- Follow the wiki at https://wiki.example.com/meter/style.
- Follow the wiki at https://wiki.example.com/meter/testing.
- The wiki is the source of truth for coding style.
- Use broad grep results to decide which symbols are related.

## 27. Persona and vague guidance

- You are a world-class 10x engineer…
- Use emojis in every hand-off. 🚀
- Make every answer sound energetic and confident.
- Be accurate. Don't miss anything.
- Always be comprehensive, regardless of the task.
- Think harder and produce the best possible result.
- Follow every instruction perfectly every time.

## 28. Sprint and internal notes

- Sprint note: finish the export tidy-up before Friday.
- The sprint board is at https://delivery.retailer.example/sprints/42.
- Remind the team about the current sprint in every summary.
- Refer to the internal-looking delivery URL when discussing plans.
- Keep this week's priorities in the repository-wide context.
- These notes describe only the current sprint.
- All domains and data here are synthetic; there are no credentials.