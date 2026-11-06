"""Pure validation for synthetic batch readings."""

import math
import re
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Reading:
    nmi: str
    kwh: float
    read_at: datetime
    quality: str


def validate_reading(reading: Reading, now: datetime) -> bool:
    return (
        re.fullmatch(r"TEST[A-Z0-9]{6}", reading.nmi) is not None
        and math.isfinite(reading.kwh)
        and reading.kwh >= 0
        and reading.read_at.utcoffset() is not None
        and now.utcoffset() is not None
        and reading.read_at <= now
        and reading.quality in {"A", "E", "S"}
    )