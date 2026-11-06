import csv
import tomllib
from dataclasses import replace
from datetime import UTC, datetime
from io import StringIO
from pathlib import Path

import pytest

from meter_jobs.export_job import export_readings
from meter_jobs.validation import Reading

NOW = datetime(2026, 11, 2, 12, tzinfo=UTC)
READING = Reading("TEST000001", 2.5, datetime(2026, 11, 2, 10, tzinfo=UTC), "A")


def test_exports_validated_usage() -> None:
    destination = StringIO()

    export_readings([READING], destination, NOW)

    assert list(csv.reader(StringIO(destination.getvalue())))[1] == ["2.5", "2026-11-02T10:00:00+00:00", "A"]


def test_returns_the_export_count() -> None:
    destination = StringIO()

    count = export_readings([READING], destination, NOW)

    assert count == 1


def test_does_not_export_identifiers() -> None:
    destination = StringIO()

    export_readings([READING], destination, NOW)

    assert READING.nmi not in destination.getvalue()


def test_rejects_invalid_readings_before_writing() -> None:
    destination = StringIO()
    readings = [READING, replace(READING, kwh=-1)]

    with pytest.raises(ValueError, match="Export requires valid readings"):
        export_readings(readings, destination, NOW)

    assert destination.getvalue() == ""


def test_export_is_registered() -> None:
    path = Path(__file__).resolve().parents[1] / "jobs.toml"

    registry = tomllib.loads(path.read_text(encoding="utf-8"))

    assert registry["jobs"] == [{"name": "export", "schedule": "0 2 * * *", "entrypoint": "meter_jobs.export_job:main"}]