import { describe, expect, it } from 'vitest';
import { calculateQuote } from './index.js';

const peakReadAt = '2026-11-02T10:00:00Z';

describe('calculateQuote', () => {
  it('credits exported energy at the plan feed-in rate', () => {
    const reading = { kWh: 250, exportKwh: 120, readAt: peakReadAt };

    const quote = calculateQuote(reading);

    expect(quote).toEqual({ amount: 80, feedInCredit: 6, netAmount: 74 });
  });

  it('uses the feed-in rate from the supplied plan', () => {
    const rates = { peakCentsPerKwh: 32, offPeakCentsPerKwh: 18, feedInRateCentsPerKwh: 10 };
    const reading = { kWh: 250, exportKwh: 120, readAt: peakReadAt };

    const quote = calculateQuote(reading, rates);

    expect(quote.feedInCredit).toBe(12);
  });

  it('gives no credit when export is omitted', () => {
    const reading = { kWh: 10, readAt: peakReadAt };

    const quote = calculateQuote(reading);

    expect(quote).toEqual({ amount: 3.2, feedInCredit: 0, netAmount: 3.2 });
  });

  it('gives no credit when the plan has no feed-in rate', () => {
    const rates = { peakCentsPerKwh: 32, offPeakCentsPerKwh: 18 };
    const reading = { kWh: 10, exportKwh: 5, readAt: peakReadAt };

    const quote = calculateQuote(reading, rates);

    expect(quote.feedInCredit).toBe(0);
  });

  it('caps the credit at the usage charge', () => {
    const reading = { kWh: 250, exportKwh: 2000, readAt: peakReadAt };

    const quote = calculateQuote(reading);

    expect(quote).toEqual({ amount: 80, feedInCredit: 80, netAmount: 0 });
  });

  it('rounds the credit to the nearest cent', () => {
    const reading = { kWh: 250, exportKwh: 1.234, readAt: peakReadAt };

    const quote = calculateQuote(reading);

    expect(quote.feedInCredit).toBe(0.06);
  });

  it('rejects negative export energy', () => {
    const reading = { kWh: 1, exportKwh: -1, readAt: peakReadAt };

    const calculate = () => calculateQuote(reading);

    expect(calculate).toThrow(RangeError);
  });

  it('rejects a negative feed-in rate', () => {
    const rates = { peakCentsPerKwh: 32, offPeakCentsPerKwh: 18, feedInRateCentsPerKwh: -1 };
    const reading = { kWh: 1, exportKwh: 1, readAt: peakReadAt };

    const calculate = () => calculateQuote(reading, rates);

    expect(calculate).toThrow(RangeError);
  });
});
