import type { Reading, ValidationResult } from './types.js';

export function validateReading(reading: Reading, now: Date): ValidationResult {
  const errors: string[] = [];

  if (!/^TEST[A-Z0-9]{6}$/.test(reading.nmi)) {
    errors.push('NMI must be 10 characters starting with TEST');
  }
  if (!Number.isFinite(reading.kWh) || reading.kWh < 0) {
    errors.push('kWh must be a finite, non-negative number');
  }
  const readAt = Date.parse(reading.readAt);
  if (!Number.isFinite(readAt) || readAt > now.getTime()) {
    errors.push('readAt must be a valid timestamp not in the future');
  }
  if (!['A', 'E', 'S'].includes(reading.quality)) {
    errors.push('quality must be A, E or S');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}