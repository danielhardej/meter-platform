import { describe, expect, it } from 'vitest';
import { calculateTariff } from './index.js';

describe('calculateTariff', () => {
  it('applies the peak rate during the UTC peak window', () => {
    const reading = { kWh: 10, readAt: '2026-11-02T10:00:00Z' };

    const amount = calculateTariff(reading);

    expect(amount).toBe(3.2);
  });

  it('applies the off-peak rate outside the UTC peak window', () => {
    const reading = { kWh: 10, readAt: '2026-11-02T23:00:00Z' };

    const amount = calculateTariff(reading);

    expect(amount).toBe(1.8);
  });

  it('rounds the amount to cents', () => {
    const reading = { kWh: 1.234, readAt: '2026-11-02T10:00:00Z' };

    const amount = calculateTariff(reading);

    expect(amount).toBe(0.39);
  });

  it('accepts an explicit tariff', () => {
    const reading = { kWh: 10, readAt: '2026-11-02T10:00:00Z' };
    const rates = { peakCentsPerKwh: 40, offPeakCentsPerKwh: 20 };

    const amount = calculateTariff(reading, rates);

    expect(amount).toBe(4);
  });

  it('rejects negative usage', () => {
    const reading = { kWh: -1, readAt: '2026-11-02T10:00:00Z' };

    const calculate = () => calculateTariff(reading);

    expect(calculate).toThrow(RangeError);
  });

  it('rejects negative rates', () => {
    const reading = { kWh: 1, readAt: '2026-11-02T10:00:00Z' };
    const rates = { peakCentsPerKwh: -1, offPeakCentsPerKwh: 20 };

    const calculate = () => calculateTariff(reading, rates);

    expect(calculate).toThrow(RangeError);
  });
});