---
description: "Add structured, PII-safe logging to a named Python batch job"
argument-hint: "Job name from jobs/jobs.toml"
agent: "agent"
---
Add structured logging to the job the user names. If no job was named, ask for its registry name before editing.

Read the root and jobs AGENTS.md files and locate the job through jobs/jobs.toml. Preserve its name, schedule, entrypoint and existing behaviour; do not rename it.

Use Python standard-library logging and JSON formatting. Emit job_started, job_completed and job_failed events with the registered job name. Include safe record counts on completion. Do not log input records, payloads, NMIs, account IDs, customer data, exception text or tracebacks that could reveal them, even when synthetic.

Keep changes scoped to the named job. Add focused pytest coverage for structured output and identifier omission, using the existing tests folder. Run the jobs tests and strict pyright checks. Report the changes, checks and any limitations.