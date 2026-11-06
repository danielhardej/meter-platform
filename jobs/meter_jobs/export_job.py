"""The export job writes validated usage to a CSV without identifiers."""

import csv
import sys
import tomllib
from collections.abc import Iterable
from datetime import UTC, datetime
from pathlib import Path
from typing import TextIO

from meter_jobs.validation import Reading, validate_reading


def export_readings(readings: Iterable[Reading], destination: TextIO, now: datetime) -> int:
    batch = list(readings)
    if not all(validate_reading(reading, now) for reading in batch):
        raise ValueError("Export requires valid readings")
    writer = csv.writer(destination)
    writer.writerow(["kwh", "read_at", "quality"])
    for reading in batch:
        writer.writerow([reading.kwh, reading.read_at.isoformat(), reading.quality])
    return len(batch)


def main() -> None:
    registry_path = Path(__file__).resolve().parents[1] / "jobs.toml"
    registry = tomllib.loads(registry_path.read_text(encoding="utf-8"))
    registered = any(
        job["name"] == "export" and job["entrypoint"] == "meter_jobs.export_job:main"
        for job in registry["jobs"]
    )
    if not registered:
        raise RuntimeError("The export job is not registered")
    readings = [Reading("TEST000001", 2.5, datetime(2026, 11, 2, 10, tzinfo=UTC), "A")]
    export_readings(readings, sys.stdout, datetime.now(UTC))


if __name__ == "__main__":
    main()