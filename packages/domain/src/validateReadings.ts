import type { Reading, ValidationResult } from './types.js';
import { validateReading } from './validateReading.js';

export function validateReadings(readings: readonly Reading[], now: Date): ValidationResult[] {
  return readings.map((reading) => validateReading(reading, now));
}