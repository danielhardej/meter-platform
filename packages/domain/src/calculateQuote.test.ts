import { describe, expect, it } from 'vitest';
import { calculateQuote } from './index.js';

describe('calculateQuote', () => {
  it('applies a feed-in credit to the usage charge', () => {
    const reading = { kWh: 10, exportedKWh: 5, readAt: '2026-11-02T10:00:00Z' };

    const quote = calculateQuote(reading);

    expect(quote).toEqual({ amount: 3.2, feedInCredit: 0.4, netAmount: 2.8 });
  });

  it('returns a negative net amount when the credit exceeds the charge', () => {
    const reading = { kWh: 1, exportedKWh: 10, readAt: '2026-11-02T10:00:00Z' };

    const quote = calculateQuote(reading);

    expect(quote).toEqual({ amount: 0.32, feedInCredit: 0.8, netAmount: -0.48 });
  });

  it('rejects negative exported energy', () => {
    const reading = { kWh: 1, exportedKWh: -1, readAt: '2026-11-02T10:00:00Z' };

    const calculate = () => calculateQuote(reading);

    expect(calculate).toThrow(RangeError);
  });

  it('rounds the charge and credit before calculating the net amount', () => {
    const reading = { kWh: 1.234, exportedKWh: 1.234, readAt: '2026-11-02T10:00:00Z' };

    const quote = calculateQuote(reading);

    expect(quote).toEqual({ amount: 0.39, feedInCredit: 0.1, netAmount: 0.29 });
  });
});