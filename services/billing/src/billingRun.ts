import { calculateTariff, validateReading } from '../../../packages/domain/src/index.js';
import type { Reading } from '../../../packages/domain/src/index.js';

export function billingRun(readings: readonly (Reading & { exportKwh?: number })[], now: Date): number[] {
  return readings.map((reading) => {
    const result = validateReading(reading, now);
    if (!result.valid) {
      throw new Error('Billing requires a valid reading');
    }
    const clamped = { ...reading, exportKwh: Math.max(reading.exportKwh ?? 0, 0) };
    return calculateTariff(clamped);
  });
}