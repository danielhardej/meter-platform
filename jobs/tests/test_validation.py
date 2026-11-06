from dataclasses import replace
from datetime import UTC, datetime

import pytest

from meter_jobs.validation import Reading, validate_reading

NOW = datetime(2026, 11, 2, 12, tzinfo=UTC)
READING = Reading("TEST000001", 2.5, datetime(2026, 11, 2, 10, tzinfo=UTC), "A")


def test_accepts_synthetic_reading() -> None:
    reading = READING

    valid = validate_reading(reading, NOW)

    assert valid


@pytest.mark.parametrize("quality", ["A", "E", "S"])
def test_accepts_quality_flags(quality: str) -> None:
    reading = replace(READING, quality=quality)

    valid = validate_reading(reading, NOW)

    assert valid


def test_rejects_negative_usage() -> None:
    reading = replace(READING, kwh=-1)

    valid = validate_reading(reading, NOW)

    assert not valid


def test_rejects_invalid_nmi() -> None:
    reading = replace(READING, nmi="TEST00001")

    valid = validate_reading(reading, NOW)

    assert not valid


def test_rejects_future_timestamp() -> None:
    reading = replace(READING, read_at=datetime(2026, 11, 3, tzinfo=UTC))

    valid = validate_reading(reading, NOW)

    assert not valid


def test_rejects_unknown_quality() -> None:
    reading = replace(READING, quality="X")

    valid = validate_reading(reading, NOW)

    assert not valid


def test_rejects_naive_timestamp() -> None:
    reading = replace(READING, read_at=datetime(2026, 11, 2))

    valid = validate_reading(reading, NOW)

    assert not valid