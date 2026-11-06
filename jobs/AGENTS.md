# Python Jobs

Add these Python-only details to the root AGENTS.md defaults. Use Python 3.12, standard-library runtime code and pytest; pyright checking remains strict.

## Set-Up

From the repo root:

```sh
python3.12 -m venv jobs/.venv
```

On Windows:

```powershell
py -3.12 -m venv jobs/.venv
```

From jobs/ on POSIX:

```sh
.venv/bin/python -m pip install pytest==8.4.2
.venv/bin/python -m pytest
../node_modules/.bin/pyright
.venv/bin/python -m meter_jobs.export_job
```

From jobs/ on Windows:

```powershell
.venv/Scripts/python.exe -m pip install pytest==8.4.2
.venv/Scripts/python.exe -m pytest
../node_modules/.bin/pyright.cmd
.venv/Scripts/python.exe -m meter_jobs.export_job
```

## Job Contract

- Register jobs in jobs/jobs.toml with name, schedule and entrypoint.
- The export job is registered as export, with schedule `0 2 * * *` and entrypoint `meter_jobs.export_job:main`.
- The commands above run the export job and check its registration. The registry describes scheduling; it is not a scheduler daemon.
- Validate the full batch before writing any rows. Keep the export CSV free of identifiers.
- Never log input records, NMIs, account IDs or customer data, including synthetic identifiers.
- For Python-only edits, run the jobs tests and strict pyright checks; report both in the hand-off.